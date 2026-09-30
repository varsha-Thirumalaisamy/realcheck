"""
Unit test verifying API Key security and integration.
"""
import os
import unittest
from unittest.mock import patch, MagicMock

from app.core.config import settings
from app.detectors.text.walter_client import WalterWritesClient
from app.detectors.text.detector import TextDetector
from app.api.enterprise import verify_api_key
from fastapi import HTTPException

class TestAPIKeyIntegration(unittest.TestCase):
    def test_settings_loaded(self):
        """Verify environment variables are read by Pydantic Settings."""
        self.assertIsNotNone(settings.API_KEY)
        self.assertEqual(settings.WALTER_API_URL, "https://developer-portal.walterwrites.ai/api/detector/")
        # Ensure WALTER_API_KEY is read if set in .env
        self.assertTrue(hasattr(settings, "WALTER_API_KEY"))

    def test_walter_client_not_configured_when_empty(self):
        """Ensure client gracefully handles unconfigured key."""
        client = WalterWritesClient(api_key="")
        self.assertFalse(client.is_configured)
        self.assertIsNone(client.detect_ai("Some sample text"))

    def test_walter_client_mock_detection(self):
        """Ensure client makes proper request and parses response when configured."""
        client = WalterWritesClient(api_key="wltr_test_key_123456789")
        self.assertTrue(client.is_configured)

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "ai_score": 88.5,
            "verdict": "AI-Generated"
        }

        with patch("requests.post", return_value=mock_resp) as mock_post:
            sample_50w = (
                "Artificial intelligence and synthetic media models have rapidly transformed content generation "
                "across digital platforms. Investigators must carefully verify whether a given paragraph or document "
                "was composed by an autonomous neural system or a human author. This extensive multi-sentence sample text "
                "satisfies the fifty-word minimum threshold required by modern external forensic API detectors."
            )
            result = client.detect_ai(sample_50w)
            self.assertIsNotNone(result)
            self.assertEqual(result["status"], "SUCCESS")
            self.assertEqual(result["ai_score"], 88.5)
            self.assertEqual(result["verdict"], "AI-Generated")
            
            # Verify headers and security
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args[1]
            self.assertEqual(call_kwargs["headers"]["X-API-Key"], "wltr_test_key_123456789")

    def test_text_detector_with_mocked_walter_api(self):
        """Verify TextDetector incorporates external signal without breaking existing flow."""
        mock_client = MagicMock()
        mock_client.is_configured = True
        mock_client.detect_ai.return_value = {
            "status": "SUCCESS",
            "source": "Walter Writes AI",
            "ai_score": 92.0,
            "verdict": "AI-Generated"
        }

        detector = TextDetector(walter_client=mock_client)
        text = (
            "Artificial intelligence and synthetic media models have rapidly transformed content generation "
            "across digital platforms. Investigators must carefully verify whether a given paragraph or document "
            "was composed by an autonomous neural system or a human author. This extensive multi-sentence sample text "
            "satisfies the fifty-word minimum threshold required by modern external forensic API detectors."
        )
        res = detector.analyze(text)
        
        self.assertIn("External Neural AI Detection (Walter Writes)", [s.name for s in res.signals])
        self.assertGreaterEqual(res.ai_generation_probability, 90.0)

    def test_enterprise_api_key_verification(self):
        """Verify dynamic API key validation."""
        # Valid key should pass
        res = verify_api_key("rc_ent_2026_secure")
        self.assertEqual(res, "rc_ent_2026_secure")

        # Invalid key should raise 401
        with self.assertRaises(HTTPException) as ctx:
            verify_api_key("invalid_unauthorized_key")
        self.assertEqual(ctx.exception.status_code, 401)

if __name__ == "__main__":
    unittest.main()
