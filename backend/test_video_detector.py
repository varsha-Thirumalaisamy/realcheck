"""
Comprehensive Automated Test Suite for Video Forensic Detection Module
Tests VideoDetector, Temporal Consistency, Segment Generation, Explainability & Edge Cases.
"""
import os
import sys
import tempfile
import unittest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.detectors.video.detector import VideoDetector
from backend.app.schemas.forensics import InvestigationResult

class TestVideoDetector(unittest.TestCase):
    def setUp(self):
        self.detector = VideoDetector()

    def test_detector_initialization(self):
        self.assertEqual(self.detector.input_type, "VIDEO")
        self.assertIn("Temporal", self.detector.model_name)

    def test_missing_file_handling(self):
        result = self.detector.analyze("non_existent_video_file.mp4", {"file_name": "non_existent.mp4"})
        self.assertIsInstance(result, InvestigationResult)
        self.assertEqual(result.media_type, "VIDEO")
        self.assertEqual(result.authenticity_score, 0)
        self.assertIn("not found", result.why_result_explanation.lower())

    def test_empty_file_handling(self):
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            temp_path = f.name
            
        try:
            result = self.detector.analyze(temp_path, {"file_name": "empty_clip.mp4"})
            self.assertIsInstance(result, InvestigationResult)
            self.assertEqual(result.media_type, "VIDEO")
            self.assertEqual(result.authenticity_score, 0)
            self.assertIn("empty", result.why_result_explanation.lower())
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_synthetic_container_analysis(self):
        # Create a mock video container file
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            # Write standard dummy MP4 container signature bytes
            f.write(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42\x00\x00\x00\x08free")
            f.write(b"\x00" * 4096)
            temp_path = f.name

        try:
            result = self.detector.analyze(temp_path, {"file_name": "sample_video.mp4", "file_size": "0.1 MB"})
            self.assertIsInstance(result, InvestigationResult)
            self.assertEqual(result.media_type, "VIDEO")
            self.assertEqual(result.file_name, "sample_video.mp4")
            self.assertTrue(0 <= result.authenticity_score <= 100)
            self.assertIn(result.risk_level, ["Low Risk", "Medium Risk", "High Risk"])
            self.assertIn(result.assessment, [
                "Likely Authentic",
                "Likely AI-Manipulated",
                "Likely AI-Generated",
                "Uncertain / Mixed Evidence"
            ])
            self.assertGreater(len(result.signals), 0)
            self.assertGreater(len(result.metadata.hash_sha256), 10)
            
            # Verify suspicious segments
            self.assertIsNotNone(result.suspicious_segments)
            for seg in result.suspicious_segments:
                self.assertIsNotNone(seg.start_time)
                self.assertIsNotNone(seg.end_time)
                self.assertIn(seg.risk_level, ["High", "Amber", "Normal"])
                self.assertIsNotNone(seg.anomaly_type)

            # Verify explainability
            self.assertIsNotNone(result.why_result_explanation)
            self.assertGreater(len(result.top_contributing_signals), 0)
            
            explanation = self.detector.explain(result)
            self.assertIn("method", explanation)
            self.assertIn("salient_features", explanation)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_explain_interface(self):
        mock_result = InvestigationResult(
            case_id="RC-2026-TEST",
            media_type="VIDEO",
            file_name="test.mp4",
            assessment="Likely Authentic",
            authenticity_score=90,
            risk_level="Low Risk",
            confidence_level="High",
            confidence_score=0.90,
            is_demo_analysis=False,
            disclaimer="Test run",
            timestamp="2026-09-28T00:00:00Z",
            ai_generation_probability=10.0,
            manipulation_risk=10.0,
            forensic_anomaly_score=10.0,
            metadata_risk_score=10.0,
            signals=[],
            evidence_breakdown=[],
            metadata={
                "file_name": "test.mp4",
                "file_size_formatted": "1.0 MB",
                "mime_type": "video/mp4",
                "dimensions": "1920 x 1080",
                "hash_sha256": "abc123hash",
                "metadata_risk_score": 10.0
            },
            why_result_explanation="Test explanation",
            top_contributing_signals=[],
            limitations="None"
        )
        exp = self.detector.explain(mock_result)
        self.assertIn("method", exp)
        self.assertIn("salient_features", exp)
        self.assertIn("Temporal", exp["method"])

if __name__ == "__main__":
    unittest.main()
