"""
Unit Tests for Benchmark Metrics, Calibration, and Manifest Verification.

Tests all metric calculations against small hand-made arrays with known expected values.
"""

import os
import tempfile
import numpy as np

from evaluation.benchmark import calculate_metrics, load_detector_by_path
from evaluation.calibration import (
    compute_brier_score,
    compute_ece,
    compute_reliability_curve,
    TemperatureScaler,
    PlattScaler
)
from evaluation.dataset import DatasetManifestManager, DatasetSample


def test_calculate_metrics_hand_made_values():
    """
    Test Case with known expected values:
    y_true = [1, 1, 1, 0, 0, 0]
    y_pred = [1, 1, 0, 0, 0, 1]

    TP: 2 (indices 0, 1)
    FP: 1 (index 5)
    TN: 2 (indices 3, 4)
    FN: 1 (index 2)

    Expected:
    Accuracy: 4/6 = 0.6667
    Precision: 2/3 = 0.6667
    Recall: 2/3 = 0.6667
    Specificity: 2/3 = 0.6667
    NPV: 2/3 = 0.6667
    F1: 0.6667
    """
    y_true = [1, 1, 1, 0, 0, 0]
    y_pred = [1, 1, 0, 0, 0, 1]

    metrics = calculate_metrics(y_true, y_pred)

    cm = metrics["confusion_matrix"]
    assert cm["tp"] == 2
    assert cm["fp"] == 1
    assert cm["tn"] == 2
    assert cm["fn"] == 1

    counts = metrics["sample_counts"]
    assert counts["total"] == 6
    assert counts["actual_ai_generated"] == 3
    assert counts["actual_real"] == 3
    assert counts["ai_prevalence"] == 0.5

    m = metrics["metrics"]
    assert m["accuracy"] == 0.6667
    assert m["precision"] == 0.6667
    assert m["recall"] == 0.6667
    assert m["specificity"] == 0.6667
    assert m["negative_predictive_value"] == 0.6667
    assert m["f1_score"] == 0.6667


def test_calculate_metrics_perfect_predictions():
    """Test perfect classification edge case."""
    y_true = [1, 1, 0, 0]
    y_pred = [1, 1, 0, 0]

    metrics = calculate_metrics(y_true, y_pred)
    m = metrics["metrics"]
    assert m["accuracy"] == 1.0
    assert m["precision"] == 1.0
    assert m["recall"] == 1.0
    assert m["f1_score"] == 1.0
    assert metrics["confusion_matrix"]["tp"] == 2
    assert metrics["confusion_matrix"]["tn"] == 2
    assert metrics["confusion_matrix"]["fp"] == 0
    assert metrics["confusion_matrix"]["fn"] == 0


def test_calculate_metrics_inverted_predictions():
    """Test completely inverted classification edge case."""
    y_true = [1, 1, 0, 0]
    y_pred = [0, 0, 1, 1]

    metrics = calculate_metrics(y_true, y_pred)
    m = metrics["metrics"]
    assert m["accuracy"] == 0.0
    assert m["precision"] == 0.0
    assert m["recall"] == 0.0
    assert m["f1_score"] == 0.0


def test_calculate_metrics_zero_division_safety():
    """Test safe handling when all predictions are 0 (TP=0, FP=0)."""
    y_true = [1, 1, 0, 0]
    y_pred = [0, 0, 0, 0]

    metrics = calculate_metrics(y_true, y_pred)
    m = metrics["metrics"]
    assert m["precision"] == 0.0
    assert m["recall"] == 0.0
    assert m["f1_score"] == 0.0
    assert m["accuracy"] == 0.5


def test_brier_score_known_values():
    """
    Test Brier Score:
    y_true = [1, 0]
    y_prob = [0.8, 0.2]
    MSE = ((0.8 - 1.0)^2 + (0.2 - 0.0)^2) / 2
        = (0.04 + 0.04) / 2 = 0.04
    """
    y_true = np.array([1, 0])
    y_prob = np.array([0.8, 0.2])
    brier = compute_brier_score(y_true, y_prob)
    assert round(brier, 4) == 0.0400


def test_ece_perfect_calibration():
    """When predicted confidence equals empirical accuracy in every bin, ECE should be 0."""
    # 5 samples with confidence 1.0 and label 1 -> acc = 1.0, conf = 1.0 -> diff = 0
    # 5 samples with confidence 0.0 and label 0 -> acc = 0.0, conf = 0.0 -> diff = 0
    y_true = np.array([1, 1, 1, 1, 1, 0, 0, 0, 0, 0])
    y_prob = np.array([1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0])
    ece = compute_ece(y_true, y_prob, n_bins=10)
    assert round(ece, 4) == 0.0


def test_temperature_scaling_fitting():
    """Test TemperatureScaler optimization and probability transformation."""
    # Synthetic calibration split
    logits_calib = np.array([-2.5, -1.8, -0.9, 0.5, 1.2, 2.0, 2.8])
    y_calib = np.array([0, 0, 0, 0, 1, 1, 1])

    scaler = TemperatureScaler()
    scaler.fit(logits_calib, y_calib)

    assert scaler.is_fitted
    assert scaler.temperature > 0.0

    # Test calibration transformation on test logits
    test_logits = np.array([-3.0, 0.0, 3.0])
    calib_probs = scaler.predict_proba(test_logits)
    assert len(calib_probs) == 3
    assert 0.0 < calib_probs[0] < 0.5
    assert abs(calib_probs[1] - 0.5) < 1e-4
    assert 0.5 < calib_probs[2] < 1.0


def test_platt_scaling_fitting():
    """Test PlattScaler calibration."""
    logits_calib = np.array([-3.0, -2.0, -1.0, 1.0, 2.0, 3.0])
    y_calib = np.array([0, 0, 0, 1, 1, 1])

    scaler = PlattScaler()
    scaler.fit(logits_calib, y_calib)

    assert scaler.is_fitted
    test_probs = scaler.predict_proba(np.array([0.0]))
    assert 0.0 <= test_probs[0] <= 1.0


def test_manifest_manager_defaults_and_validation():
    """
    Test DatasetManifestManager enforces:
    - label_verified defaults to False
    - valid splits ('calibration', 'test')
    - provenance logging
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        manifest_file = os.path.join(tmp_dir, "manifest.json")
        mgr = DatasetManifestManager(manifest_file)

        # Add sample without explicit label_verified
        s1 = mgr.add_sample(
            sample_id="test-001",
            file_path="dummy.jpg",
            ground_truth=1,
            source="GenImage",
            license="OpenAccess",
            label_origin="SD-Prompt-Log",
            split="test"
        )
        assert s1.label_verified is False

        # Add sample with explicit verification
        s2 = mgr.add_sample(
            sample_id="test-002",
            file_path="dummy2.jpg",
            ground_truth=0,
            source="RAISE",
            license="CC-BY-NC",
            label_origin="RAW-Camera-EXIF",
            split="calibration",
            label_verified=True
        )
        assert s2.label_verified is True

        # Test verification helper
        mgr.verify_sample_label("test-001", "Audited hash against upstream release")
        assert s1.label_verified is True

        # Test invalid split
        try:
            mgr.add_sample("test-003", "dummy3.jpg", 0, "source", "lic", "origin", split="invalid_split")
            assert False, "Expected ValueError for invalid split"
        except ValueError:
            pass

        # Test saving and re-loading
        mgr.save()
        mgr2 = DatasetManifestManager(manifest_file)
        assert len(mgr2.samples) == 2
        assert mgr2.samples[0].id == "test-001"
        assert mgr2.samples[0].label_verified is True


def test_dynamic_detector_loader():
    """Test loading an arbitrary detector dynamically without hardcoding."""
    detector = load_detector_by_path("app.detectors.image.detector.ImageDetector")
    assert detector is not None
    assert hasattr(detector, "analyze")


def test_calibration_experiment_protocol():
    """
    Tests end-to-end calibration experiment:
    Fits temperature scaling on calibration split and verifies on test split.
    """
    from evaluation.calibration import run_calibration_experiment
    logits_calib = np.array([-3.0, -2.0, -1.0, 0.5, 1.5, 2.5, 3.5])
    y_calib = np.array([0, 0, 0, 1, 1, 1, 1])

    logits_test = np.array([-2.5, -1.5, 0.2, 1.8, 2.8])
    y_test = np.array([0, 0, 0, 1, 1])

    res = run_calibration_experiment(logits_calib, y_calib, logits_test, y_test, method="temperature")
    assert res["scaler"]["is_fitted"] is True
    assert "ece" in res["test_uncalibrated"]
    assert "ece" in res["test_calibrated"]
    assert res["sample_counts"]["calibration_samples"] == 7
    assert res["sample_counts"]["test_samples"] == 5


if __name__ == "__main__":
    try:
        import pytest
        pytest.main(["-v", __file__])
    except ImportError:
        print("Running tests via standalone test harness...")
        tests = [
            test_calculate_metrics_hand_made_values,
            test_calculate_metrics_perfect_predictions,
            test_calculate_metrics_inverted_predictions,
            test_calculate_metrics_zero_division_safety,
            test_brier_score_known_values,
            test_ece_perfect_calibration,
            test_temperature_scaling_fitting,
            test_platt_scaling_fitting,
            test_calibration_experiment_protocol,
            test_manifest_manager_defaults_and_validation,
            test_dynamic_detector_loader,
        ]
        passed = 0
        for test in tests:
            try:
                test()
                print(f"PASS: {test.__name__}")
                passed += 1
            except Exception as e:
                print(f"FAIL: {test.__name__} - {e}")
                raise
        print(f"\nAll {passed}/{len(tests)} benchmark unit tests passed successfully!")
