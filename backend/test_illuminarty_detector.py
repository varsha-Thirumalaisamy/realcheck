"""
Unit and integration tests for IlluminartyImageDetector and the /api/analyze/image endpoint.
Verifies strictly that:
1. When unconfigured, it raises ValueError and returns HTTP 400.
2. When auth fails (403), it raises PermissionError and returns HTTP 403.
3. When quota fails (429), it raises RuntimeError and returns HTTP 500.
4. On 200 OK, it correctly processes real predictions and generative model fingerprints without mock fallbacks.
"""

import io
import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from PIL import Image

from app.core.config import settings
from app.detectors.image.illuminarty_detector import IlluminartyImageDetector
from app.schemas.forensics import InvestigationResult


class TestIlluminartyImageDetector(unittest.TestCase):

    def setUp(self):
        # Create a small valid test image file
        self.img = Image.new("RGB", (128, 128), color=(30, 80, 150))
        fd, self.temp_img_path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, "wb") as f:
            self.img.save(f, format="JPEG")

    def tearDown(self):
        if os.path.exists(self.temp_img_path):
            os.remove(self.temp_img_path)

    def test_unconfigured_detector_raises_value_error(self):
        """Detector must reject execution if ILLUMINARTY_API_KEY is missing or empty."""
        detector = IlluminartyImageDetector(api_key="")
        with patch.object(IlluminartyImageDetector, "effective_api_key", new_callable=unittest.mock.PropertyMock) as mock_prop:
            mock_prop.return_value = ""
            self.assertFalse(detector.is_configured)
            with self.assertRaises(ValueError) as ctx:
                detector.analyze(self.temp_img_path)
            self.assertIn("AI model is not configured. Add ILLUMINARTY_API_KEY to backend/.env.", str(ctx.exception))

    def test_missing_file_raises_file_not_found(self):
        """Detector must reject non-existent file paths."""
        detector = IlluminartyImageDetector(api_key="ilm_test_dummy_key_12345")
        with self.assertRaises(FileNotFoundError):
            detector.analyze("c:/non/existent/path/image.jpg")

    def test_auth_failure_raises_permission_error(self):
        """HTTP 403 / 401 must raise PermissionError without any fallback prediction."""
        detector = IlluminartyImageDetector(api_key="invalid_test_key_abc")
        
        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_resp.json.return_value = {"message": "Invalid API key", "status": "fail"}
        mock_resp.text = '{"message":"Invalid API key","status":"fail"}'

        with patch("requests.post", return_value=mock_resp) as mock_post:
            with self.assertRaises(PermissionError) as ctx:
                detector.analyze(self.temp_img_path)
            self.assertIn("AI API authentication failed. Check ILLUMINARTY_API_KEY", str(ctx.exception))
            # Verify correct header and endpoint
            mock_post.assert_called()
            call_kwargs = mock_post.call_args[1]
            self.assertEqual(call_kwargs["headers"]["X-API-Key"], "invalid_test_key_abc")

    def test_quota_exceeded_raises_runtime_error(self):
        """HTTP 429 quota exhaustion must raise RuntimeError."""
        detector = IlluminartyImageDetector(api_key="ilm_test_dummy_key_12345")
        
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.text = "Monthly quota limit reached for this plan"

        with patch("requests.post", return_value=mock_resp):
            with self.assertRaises(RuntimeError) as ctx:
                detector.analyze(self.temp_img_path)
            self.assertIn("AI API rate limit reached", str(ctx.exception))

    def test_successful_inference_parsing_ai_generated(self):
        """Verifies parsing of synthetic image classification from Illuminarty API."""
        detector = IlluminartyImageDetector(api_key="ilm_valid_mock_key_xyz")
        
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "probability": 0.942,
            "models": [
                {"name": "Midjourney", "probability": 0.89},
                {"name": "Stable Diffusion", "probability": 0.05}
            ],
            "regions": [
                {
                    "label": "SYNTHETIC ARTIFACT",
                    "confidence": 0.92,
                    "coordinates": {"x": 20, "y": 25, "width": 50, "height": 40},
                    "explanation": "High frequency latent irregularity"
                }
            ]
        }

        with patch("requests.post", return_value=mock_resp):
            result = detector.analyze(self.temp_img_path, {"file_name": "ai_portrait.jpg", "file_size": "1.8 MB"})
            
            self.assertIsInstance(result, InvestigationResult)
            self.assertEqual(result.assessment, "Likely AI-Generated")
            self.assertEqual(result.risk_level, "High Risk")
            self.assertAlmostEqual(result.ai_generation_probability, 94.2, places=1)
            self.assertEqual(result.confidence_level, "High")
            self.assertFalse(result.is_demo_analysis)
            
            # Verify model verification telemetry
            mv = result.model_verification
            self.assertIsNotNone(mv)
            self.assertTrue(mv["model_called"])
            self.assertEqual(mv["inference_status"], "SUCCESS")
            self.assertEqual(mv["model_name"], "Illuminarty AI Image Classifier")
            self.assertEqual(mv["api_endpoint"], "https://api.illuminarty.ai/v1/image/classify")
            self.assertEqual(mv["predicted_class"], "Synthetic (AI-Generated)")
            self.assertEqual(len(mv["models_breakdown"]), 2)
            self.assertIn("Midjourney", [m["name"] for m in mv["models_breakdown"]])

            # Verify annotated image watermark was generated
            self.assertIsNotNone(result.annotated_image_url)
            self.assertTrue(result.annotated_image_url.startswith("data:image/jpeg;base64,"))

    def test_successful_inference_parsing_authentic_image(self):
        """Verifies parsing of authentic/camera image classification from Illuminarty API."""
        detector = IlluminartyImageDetector(api_key="ilm_valid_mock_key_xyz")
        
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "probability": 0.035,
            "models": []
        }

        with patch("requests.post", return_value=mock_resp):
            result = detector.analyze(self.temp_img_path, {"file_name": "nikon_raw.jpg", "file_size": "4.2 MB"})
            
            self.assertEqual(result.assessment, "Likely Authentic")
            self.assertEqual(result.risk_level, "Low Risk")
            self.assertAlmostEqual(result.ai_generation_probability, 3.5, places=1)
            self.assertGreaterEqual(result.authenticity_score, 90)
            self.assertEqual(result.model_verification["predicted_class"], "Authentic (Real / Optical)")


class TestFastAPIAnalysisEndpoint(unittest.TestCase):

    def test_endpoint_missing_api_key_returns_400(self):
        """FastAPI analyze/image endpoint returns 400 when Illuminarty API key is absent."""
        from fastapi.testclient import TestClient
        from app.main import app

        # Create a test client
        client = TestClient(app)
        
        # Test image bytes
        img = Image.new("RGB", (64, 64), color=(100, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        # Ensure detector reports unconfigured
        with patch("app.detectors.image.illuminarty_detector.IlluminartyImageDetector.is_configured", False):
            response = client.post(
                "/api/analyze/image",
                files={"file": ("test.jpg", buf, "image/jpeg")}
            )
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertIn("detail", data)
            self.assertEqual(data["detail"]["stage"], "Model Loading")
            self.assertIn("Add ILLUMINARTY_API_KEY to backend/.env", data["detail"]["reason"])

    def test_endpoint_success_with_mocked_illuminarty_response(self):
        """FastAPI analyze/image endpoint returns 200 with full telemetry when Illuminarty responds."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        
        img = Image.new("RGB", (64, 64), color=(100, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "probability": 0.88,
            "models": [{"name": "DALL-E 3", "probability": 0.85}]
        }

        with patch("app.detectors.image.illuminarty_detector.IlluminartyImageDetector.is_configured", True):
            with patch("requests.post", return_value=mock_resp):
                response = client.post(
                    "/api/analyze/image",
                    files={"file": ("ai_sample.jpg", buf, "image/jpeg")}
                )
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertEqual(data["assessment"], "Likely AI-Generated")
                self.assertEqual(data["model_verification"]["inference_status"], "SUCCESS")
                self.assertEqual(data["model_verification"]["model_name"], "Illuminarty AI Image Classifier")
                self.assertEqual(data["model_verification"]["api_endpoint"], "https://api.illuminarty.ai/v1/image/classify")
                self.assertIn("structured_response", data)
                sr = data["structured_response"]
                self.assertTrue(sr["success"])
                self.assertEqual(sr["model"]["source"], "Illuminarty API")
                self.assertEqual(sr["result"]["aiProbability"], 0.88)

    def test_unsupported_image_format_returns_400(self):
        """FastAPI analyze/image endpoint returns 400 for corrupt or unsupported non-image files."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        corrupt_buf = io.BytesIO(b"NOT_A_VALID_IMAGE_CONTENT_STREAM")

        with patch("app.detectors.image.illuminarty_detector.IlluminartyImageDetector.is_configured", True):
            response = client.post(
                "/api/analyze/image",
                files={"file": ("corrupt.txt", corrupt_buf, "text/plain")}
            )
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertEqual(data["detail"]["stage"], "Image Preprocessing")
            self.assertIn("Unsupported image format", data["detail"]["reason"])

    def test_moon_jpeg_full_pipeline_verification(self):
        """Verifies moon.jpeg specifically runs through upload, preprocessing, inference, and result generation."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        moon_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "moon.jpeg"))
        self.assertTrue(os.path.exists(moon_path), f"moon.jpeg must exist at {moon_path}")

        with open(moon_path, "rb") as f:
            moon_bytes = f.read()

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "probability": 0.082,
            "models": []
        }

        with patch("app.detectors.image.illuminarty_detector.IlluminartyImageDetector.is_configured", True):
            with patch("requests.post", return_value=mock_resp) as mock_post:
                response = client.post(
                    "/api/analyze/image",
                    files={"file": ("moon.jpeg", io.BytesIO(moon_bytes), "image/jpeg")}
                )
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertEqual(data["file_name"], "moon.jpeg")
                self.assertAlmostEqual(data["ai_generation_probability"], 8.2, places=1)
                self.assertEqual(data["assessment"], "Likely Authentic")
                self.assertEqual(data["model_verification"]["dimensions"], "720 × 1280")
                self.assertEqual(data["model_verification"]["file_size_bytes"], len(moon_bytes))
                self.assertTrue(data["model_verification"]["file_hash"])
                # Ensure the exact moon_bytes were posted
                call_args = mock_post.call_args
                files_payload = call_args[1]["files"]
                # field could be 'image' or 'file'
                posted_file = files_payload.get("image") or files_payload.get("file")
                self.assertEqual(posted_file[0], "moon.jpeg")
                self.assertEqual(posted_file[1], moon_bytes)

    def test_consecutive_uploads_never_reuse_results(self):
        """Upload two distinct images consecutively and verify separate request IDs and no stale results."""
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        # Image 1 (AI)
        img1 = Image.new("RGB", (100, 100), color=(255, 0, 0))
        b1 = io.BytesIO()
        img1.save(b1, format="JPEG")
        b1.seek(0)

        # Image 2 (Authentic)
        img2 = Image.new("RGB", (200, 200), color=(0, 255, 0))
        b2 = io.BytesIO()
        img2.save(b2, format="JPEG")
        b2.seek(0)

        mock_resp_1 = MagicMock()
        mock_resp_1.status_code = 200
        mock_resp_1.json.return_value = {"probability": 0.95}

        mock_resp_2 = MagicMock()
        mock_resp_2.status_code = 200
        mock_resp_2.json.return_value = {"probability": 0.05}

        with patch("app.detectors.image.illuminarty_detector.IlluminartyImageDetector.is_configured", True):
            with patch("requests.post", side_effect=[mock_resp_1, mock_resp_2]):
                resp1 = client.post("/api/analyze/image", files={"file": ("img1.jpg", b1, "image/jpeg")})
                resp2 = client.post("/api/analyze/image", files={"file": ("img2.jpg", b2, "image/jpeg")})

                d1 = resp1.json()
                d2 = resp2.json()

                self.assertNotEqual(d1["case_id"], d2["case_id"])
                self.assertNotEqual(d1["model_verification"]["file_hash"], d2["model_verification"]["file_hash"])
                self.assertEqual(d1["ai_generation_probability"], 95.0)
                self.assertEqual(d2["ai_generation_probability"], 5.0)


if __name__ == "__main__":
    unittest.main()

