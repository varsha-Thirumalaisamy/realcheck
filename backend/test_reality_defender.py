"""
Unit and integration tests for Reality Defender Client, Detector, and the FastAPI /api/analyze/image endpoint.
Verifies strictly:
1. Missing API key raises RealityDefenderConfigurationError and returns HTTP 400.
2. Successful API response correctly parses ensemble score, status, sub-models, and heatmaps without mock fallback.
3. Invalid API response format raises RealityDefenderAPIError.
4. Timeout raises RealityDefenderTimeoutError and returns HTTP 504.
5. Provider authentication error (401/403) raises RealityDefenderAuthenticationError and returns HTTP 403.
6. API key is never exposed in error messages, logs, or response bodies.
"""

import io
import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from PIL import Image

from app.core.config import settings
from app.services.reality_defender_client import (
    RealityDefenderClient,
    RealityDefenderConfigurationError,
    RealityDefenderAuthenticationError,
    RealityDefenderRateLimitError,
    RealityDefenderTimeoutError,
    RealityDefenderAPIError,
)
from app.detectors.image.reality_defender_detector import RealityDefenderImageDetector
from app.schemas.forensics import InvestigationResult
from realitydefender.errors import RealityDefenderError


class TestRealityDefenderClientAndDetector(unittest.TestCase):

    def setUp(self):
        self.img = Image.new("RGB", (128, 128), color=(40, 90, 160))
        fd, self.temp_img_path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, "wb") as f:
            self.img.save(f, format="JPEG")

    def tearDown(self):
        if os.path.exists(self.temp_img_path):
            os.remove(self.temp_img_path)

    def test_missing_api_key_raises_configuration_error(self):
        """Client must reject execution if REALITY_DEFENDER_API_KEY is missing or empty."""
        client = RealityDefenderClient(api_key="")
        with patch.object(RealityDefenderClient, "effective_api_key", new_callable=unittest.mock.PropertyMock) as mock_prop:
            mock_prop.return_value = ""
            self.assertFalse(client.is_configured)
            with self.assertRaises(RealityDefenderConfigurationError) as ctx:
                client.detect_file(self.temp_img_path)
            self.assertIn("REALITY_DEFENDER_API_KEY", str(ctx.exception))

    def test_detector_missing_api_key_raises_configuration_error(self):
        """Detector analyze method must raise RealityDefenderConfigurationError when unconfigured."""
        detector = RealityDefenderImageDetector(api_key="")
        with patch.object(RealityDefenderClient, "effective_api_key", new_callable=unittest.mock.PropertyMock) as mock_prop:
            mock_prop.return_value = ""
            self.assertFalse(detector.is_configured)
            with self.assertRaises(RealityDefenderConfigurationError) as ctx:
                detector.analyze(self.temp_img_path)
            self.assertIn("REALITY_DEFENDER_API_KEY", str(ctx.exception))

    def test_auth_failure_raises_authentication_error(self):
        """Unauthorized response from Reality Defender must raise RealityDefenderAuthenticationError."""
        client = RealityDefenderClient(api_key="rd_invalid_test_key_xyz")
        rde = RealityDefenderError("Invalid API key", "unauthorized")
        
        with patch("realitydefender.RealityDefender.detect_file", side_effect=rde):
            with self.assertRaises(RealityDefenderAuthenticationError) as ctx:
                client.detect_file(self.temp_img_path)
            self.assertIn("authentication failed", str(ctx.exception).lower())
            # Verify API key is NOT leaked in exception message
            self.assertNotIn("rd_invalid_test_key_xyz", str(ctx.exception))

    def test_timeout_raises_timeout_error(self):
        """Timeout from Reality Defender must raise RealityDefenderTimeoutError."""
        client = RealityDefenderClient(api_key="rd_valid_key_123")
        rde = RealityDefenderError("Polling timed out", "timeout")
        
        with patch("realitydefender.RealityDefender.detect_file", side_effect=rde):
            with self.assertRaises(RealityDefenderTimeoutError) as ctx:
                client.detect_file(self.temp_img_path)
            self.assertIn("timed out", str(ctx.exception).lower())

    def test_rate_limit_raises_rate_limit_error(self):
        """Rate limit error (429) from Reality Defender must raise RealityDefenderRateLimitError."""
        client = RealityDefenderClient(api_key="rd_valid_key_123")
        rde = RealityDefenderError("Rate limit exceeded", "rate_limit")
        
        with patch("realitydefender.RealityDefender.detect_file", side_effect=rde):
            with self.assertRaises(RealityDefenderRateLimitError) as ctx:
                client.detect_file(self.temp_img_path)
            self.assertIn("rate limit", str(ctx.exception).lower())

    def test_invalid_api_response_raises_api_error(self):
        """Non-dict return from Reality Defender must raise RealityDefenderAPIError."""
        client = RealityDefenderClient(api_key="rd_valid_key_123")
        with patch("realitydefender.RealityDefender.detect_file", return_value="INVALID_STRING_OUTPUT"):
            with self.assertRaises(RealityDefenderAPIError) as ctx:
                client.detect_file(self.temp_img_path)
            self.assertIn("Invalid response format", str(ctx.exception))

    def test_successful_detection_parsing(self):
        """Verifies parsing of Reality Defender ensemble result, score, and model breakdown."""
        detector = RealityDefenderImageDetector(api_key="rd_valid_test_key")
        
        mock_rd_result = {
            "request_id": "rd-req-2026-xyz8899",
            "status": "MANIPULATED",
            "score": 93.45,
            "models": [
                {"name": "Diffusion Artifact Detector", "status": "MANIPULATED", "score": 95.0},
                {"name": "GAN Residual Classifier", "status": "MANIPULATED", "score": 91.2}
            ],
            "heatmaps": {
                "diffusion_model": "https://s3.amazonaws.com/realitydefender/heatmap1.png"
            }
        }

        with patch("realitydefender.RealityDefender.detect_file", return_value=mock_rd_result):
            res = detector.analyze(self.temp_img_path, {"file_name": "ai_test.jpg", "file_size": "1.2 MB"})
            
            self.assertIsInstance(res, InvestigationResult)
            self.assertEqual(res.assessment, "Likely AI-Generated")
            self.assertEqual(res.risk_level, "High Risk")
            self.assertAlmostEqual(res.ai_generation_probability, 93.45, places=2)
            self.assertFalse(res.is_demo_analysis)
            
            # Verify telemetry
            mv = res.model_verification
            self.assertTrue(mv["model_called"])
            self.assertEqual(mv["inference_status"], "SUCCESS")
            self.assertEqual(mv["model_name"], "Reality Defender Multi-Model Ensemble")
            self.assertEqual(mv["api_endpoint"], "https://api.prd.realitydefender.xyz")
            self.assertEqual(mv["predicted_class"], "Synthetic / Manipulated")
            self.assertEqual(len(mv["models_breakdown"]), 2)
            self.assertIn("diffusion_model", mv["heatmaps"])
            self.assertEqual(mv["request_id"], "rd-req-2026-xyz8899")

            # Verify API key is NOT in model_verification or structured response
            self.assertNotIn("api_key", str(mv))
            self.assertNotIn("rd_valid_test_key", str(mv))


class TestFastAPIRealityDefenderEndpoint(unittest.TestCase):

    def test_endpoint_missing_api_key_returns_400(self):
        """FastAPI analyze/image endpoint returns 400 when REALITY_DEFENDER_API_KEY is absent."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        img = Image.new("RGB", (64, 64), color=(100, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        with patch.object(RealityDefenderClient, "is_configured", new_callable=unittest.mock.PropertyMock, return_value=False):
            response = client.post("/api/analyze/image", files={"file": ("test.jpg", buf, "image/jpeg")})
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertEqual(data["detail"]["stage"], "Model Loading")
            self.assertIn("REALITY_DEFENDER_API_KEY", data["detail"]["reason"])

    def test_endpoint_auth_failure_returns_403(self):
        """FastAPI analyze/image endpoint returns 403 on Reality Defender authentication failure."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        img = Image.new("RGB", (64, 64), color=(100, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        rde = RealityDefenderError("Invalid API key", "unauthorized")
        with patch.object(RealityDefenderClient, "is_configured", new_callable=unittest.mock.PropertyMock, return_value=True):
            with patch("realitydefender.RealityDefender.detect_file", side_effect=rde):
                response = client.post("/api/analyze/image", files={"file": ("test.jpg", buf, "image/jpeg")})
                self.assertEqual(response.status_code, 403)
                data = response.json()
                self.assertEqual(data["detail"]["stage"], "Model Inference")
                self.assertIn("authentication failed", data["detail"]["reason"].lower())
                self.assertIn("REALITY_DEFENDER_API_KEY", data["detail"]["action"])

    def test_endpoint_timeout_returns_504(self):
        """FastAPI analyze/image endpoint returns 504 when Reality Defender times out."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        img = Image.new("RGB", (64, 64), color=(100, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        rde = RealityDefenderError("Request timed out", "timeout")
        with patch.object(RealityDefenderClient, "is_configured", new_callable=unittest.mock.PropertyMock, return_value=True):
            with patch("realitydefender.RealityDefender.detect_file", side_effect=rde):
                response = client.post("/api/analyze/image", files={"file": ("test.jpg", buf, "image/jpeg")})
                self.assertEqual(response.status_code, 504)
                data = response.json()
                self.assertEqual(data["detail"]["stage"], "Model Inference")
                self.assertIn("timed out", data["detail"]["reason"].lower())

    def test_endpoint_success_with_reality_defender_response(self):
        """FastAPI analyze/image endpoint returns 200 with structured response when Reality Defender responds."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        img = Image.new("RGB", (64, 64), color=(100, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        mock_rd_result = {
            "request_id": "rd-endpoint-test-1122",
            "status": "AUTHENTIC",
            "score": 5.2,
            "models": [{"name": "Sensor Noise Verifier", "status": "AUTHENTIC", "score": 3.0}],
            "heatmaps": None
        }

        with patch.object(RealityDefenderClient, "is_configured", new_callable=unittest.mock.PropertyMock, return_value=True):
            with patch("realitydefender.RealityDefender.detect_file", return_value=mock_rd_result):
                response = client.post("/api/analyze/image", files={"file": ("camera_photo.jpg", buf, "image/jpeg")})
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertEqual(data["assessment"], "Likely Authentic")
                self.assertEqual(data["model_verification"]["model_name"], "Reality Defender Multi-Model Ensemble")
                self.assertEqual(data["model_verification"]["api_endpoint"], "https://api.prd.realitydefender.xyz")
                self.assertAlmostEqual(data["ai_generation_probability"], 5.2, places=1)
                self.assertIn("structured_response", data)


if __name__ == "__main__":
    unittest.main()
