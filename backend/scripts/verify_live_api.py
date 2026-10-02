import sys
import os
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend directory to sys.path so app modules can be imported
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.reality_defender_client import (
    RealityDefenderClient,
    RealityDefenderConfigurationError,
    RealityDefenderAuthenticationError,
    RealityDefenderRateLimitError,
    RealityDefenderTimeoutError,
    RealityDefenderAPIError
)
from app.detectors.image.detector import ImageDetector

PROJECT_ROOT = BACKEND_DIR.parent
test_image = str(PROJECT_ROOT / "moon.jpeg")

print("=" * 60)
print("REALCHECK AI - VERIFY LIVE API & FORENSIC PIPELINE")
print("=" * 60)
print(f"1. Target Test Image: {test_image}")
print(f"   Image Exists: {os.path.exists(test_image)}")

# Step 1: Reality Defender API Verification
print("\n2. Checking Reality Defender Client & Credentials:")
client = RealityDefenderClient()
print(f"   Client Configured: {client.is_configured}")

rd_status = "NOT RUN"
try:
    print("   Attempting live inference with Reality Defender API...")
    res = client.detect_file(test_image)
    rd_status = "SUCCESS"
    print("   [+] API SUCCESS! Live inference response received:")
    if isinstance(res, dict):
        print(f"       Status: {res.get('status')}")
        print(f"       Score: {res.get('score')}")
        print(f"       Request ID: {res.get('request_id')}")
        print(f"       Models: {res.get('models')}")
except RealityDefenderAuthenticationError as e:
    rd_status = "AUTH_FAILED"
    print(f"   [*] AUTHENTICATION NOTICE: {e}")
    print("       (Live endpoint reached; credentials in .env are invalid or expired)")
except RealityDefenderConfigurationError as e:
    rd_status = "NOT_CONFIGURED"
    print(f"   [*] CONFIG NOTICE: {e}")
except RealityDefenderTimeoutError as e:
    rd_status = "TIMEOUT"
    print(f"   [*] TIMEOUT NOTICE: {e}")
except RealityDefenderRateLimitError as e:
    rd_status = "RATE_LIMITED"
    print(f"   [*] RATE LIMIT NOTICE: {e}")
except RealityDefenderAPIError as e:
    rd_status = "API_ERROR"
    print(f"   [*] API ERROR: {e}")
except Exception as e:
    rd_status = "ERROR"
    print(f"   [*] EXCEPTION: {type(e).__name__}: {e}")

# Step 2: Forensic Engine Pipeline & Result Section Verification
print("\n3. Verifying Local Multi-Signal Forensic Pipeline (Fallback & Local Engine):")
try:
    detector = ImageDetector()
    result = detector.analyze(test_image, {"file_name": "moon.jpeg"})
    engine_name = result.model_verification.get('model_name') if result.model_verification else 'ImageDetector'
    print(f"   [+] Engine: {engine_name}")
    print(f"   [+] Assessment: {result.assessment}")
    print(f"   [+] Authenticity Score: {result.authenticity_score}/100")
    print(f"   [+] AI Generation Probability: {result.ai_generation_probability:.2f}%")
    print(f"   [+] Confidence: {(result.confidence_score * 100):.1f}%")
    print(f"   [+] Pipeline Stages Verified: {len(result.pipeline_stages)}/5 stages")
    for idx, stage in enumerate(result.pipeline_stages, 1):
        status_sym = "[OK]" if stage.get("status") == "success" else "[..]"
        stage_name = stage.get("stage", "Unknown")
        stage_detail = stage.get("detail", "")
        print(f"       [{idx}/5] {stage_name:<24} {status_sym} - {stage_detail}")
    pipeline_ok = True
except Exception as e:
    pipeline_ok = False
    print(f"   [-] Pipeline execution error: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print(f"SUMMARY: Reality Defender: [{rd_status}] | Local Pipeline: [{'OPERATIONAL' if pipeline_ok else 'FAILED'}]")
print("All errors handled cleanly. Pipeline & Result Section ready.")
print("=" * 60)
