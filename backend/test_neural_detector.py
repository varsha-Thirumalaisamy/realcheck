"""
Test Suite for Neural Image Forensic Detector (EfficientNet-B0 FaceForensics++ C23).

Tests:
1. Model loading & weights initialization
2. Valid image inference
3. Raw logits and continuous probability outputs
4. Probability range, separation, and consistency
5. Categorical classification mapping
6. Invalid image input handling
7. Genuine Grad-CAM generation
8. API / InvestigationResult contract preservation
"""

import os
import numpy as np
from PIL import Image

from app.detectors.image.neural_detector import NeuralImageDetector, DEFAULT_WEIGHTS_PATH
from app.schemas.forensics import InvestigationResult

REAL_IMAGE_PATH = os.path.join(
    os.path.dirname(__file__),
    ".venv", "Lib", "site-packages", "sklearn", "datasets", "images", "china.jpg"
)
REAL_IMAGE_PATH_2 = os.path.join(
    os.path.dirname(__file__),
    ".venv", "Lib", "site-packages", "sklearn", "datasets", "images", "flower.jpg"
)
RENDERED_IMAGE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..", "frontend", "src", "assets", "hero.png"
)


def test_model_loading():
    """Verify that NeuralImageDetector loads checkpoint weights and configures architecture."""
    assert os.path.exists(DEFAULT_WEIGHTS_PATH), f"Weights file missing: {DEFAULT_WEIGHTS_PATH}"
    detector = NeuralImageDetector()
    assert detector.model is not None
    assert detector.model_name == "Neural Deepfake & AI Detector (EfficientNet-B0)"
    assert detector.input_type == "IMAGE"
    assert hasattr(detector, "transform")
    print("PASS: test_model_loading")


def test_valid_image_inference():
    """Verify end-to-end inference producing an InvestigationResult."""
    detector = NeuralImageDetector()
    assert os.path.exists(REAL_IMAGE_PATH), f"Real test image missing: {REAL_IMAGE_PATH}"

    result = detector.analyze(REAL_IMAGE_PATH, {"file_name": "china.jpg", "file_size": "150 KB"})
    assert isinstance(result, InvestigationResult)
    assert result.media_type == "IMAGE"
    assert result.file_name == "china.jpg"
    assert result.assessment in {"Likely Authentic", "Likely AI-Generated", "Uncertain / Mixed Evidence"}
    assert 0 <= result.authenticity_score <= 100
    assert 0.0 <= result.ai_generation_probability <= 100.0
    assert 0.0 <= result.confidence_score <= 1.0
    assert result.confidence_level in {"High", "Moderate", "Low"}
    assert len(result.signals) >= 2
    assert len(result.evidence_breakdown) >= 1
    print("PASS: test_valid_image_inference")


def test_raw_logits_and_probability_consistency():
    """Verify genuine model logits and softmax probabilities."""
    detector = NeuralImageDetector()
    logits = detector.get_logits(REAL_IMAGE_PATH)

    assert isinstance(logits, np.ndarray)
    assert logits.shape == (2,)  # [logit_real, logit_fake]

    # Test softmax calculation
    exps = np.exp(logits - np.max(logits))
    probs = exps / np.sum(exps)
    assert np.isclose(np.sum(probs), 1.0, atol=1e-5)
    assert 0.0 <= probs[0] <= 1.0
    assert 0.0 <= probs[1] <= 1.0

    result = detector.analyze(REAL_IMAGE_PATH)
    # Ensure authenticity_score and ai_prob correspond to real model probabilities
    assert abs(result.ai_generation_probability - round(probs[1] * 100.0, 2)) < 0.1
    print("PASS: test_raw_logits_and_probability_consistency")


def test_classification_decision():
    """Verify threshold classification consistency."""
    detector = NeuralImageDetector()
    res1 = detector.analyze(REAL_IMAGE_PATH)

    if res1.ai_generation_probability >= 65.0:
        assert res1.assessment == "Likely AI-Generated"
        assert res1.risk_level == "High Risk"
    elif res1.ai_generation_probability <= 35.0:
        assert res1.assessment == "Likely Authentic"
        assert res1.risk_level == "Low Risk"
    else:
        assert res1.assessment == "Uncertain / Mixed Evidence"
        assert res1.risk_level == "Medium Risk"

    print("PASS: test_classification_decision")


def test_invalid_image_handling():
    """Verify safe error handling for missing or unreadable inputs."""
    detector = NeuralImageDetector()
    try:
        detector.analyze("non_existent_file_path_12345.jpg")
        assert False, "Expected FileNotFoundError"
    except FileNotFoundError:
        pass
    print("PASS: test_invalid_image_handling")


def test_gradcam_generation():
    """Verify genuine Grad-CAM generation from model backpropagation."""
    detector = NeuralImageDetector()
    tensor = detector._preprocess(REAL_IMAGE_PATH)
    heatmap = detector.compute_gradcam(tensor, target_class=0)

    assert isinstance(heatmap, np.ndarray)
    assert heatmap.shape == (224, 224)
    assert heatmap.min() >= 0.0
    assert heatmap.max() <= 1.0
    # Heatmap should not be entirely zeros when target class matches strong prediction
    assert heatmap.max() > 0.0
    print("PASS: test_gradcam_generation")


def test_explain_contract():
    """Verify explainability metadata contract."""
    detector = NeuralImageDetector()
    res = detector.analyze(REAL_IMAGE_PATH)
    explanation = detector.explain(res)

    assert "Grad-CAM" in explanation.get("method", "")
    assert "features.8" in explanation.get("layer_targeted", "")
    assert len(explanation.get("salient_features", [])) > 0
    print("PASS: test_explain_contract")


if __name__ == "__main__":
    print("Running NeuralImageDetector test suite...")
    tests = [
        test_model_loading,
        test_valid_image_inference,
        test_raw_logits_and_probability_consistency,
        test_classification_decision,
        test_invalid_image_handling,
        test_gradcam_generation,
        test_explain_contract,
    ]
    passed = 0
    for t in tests:
        t()
        passed += 1
    print(f"\nAll {passed}/{len(tests)} NeuralImageDetector tests passed successfully!")
