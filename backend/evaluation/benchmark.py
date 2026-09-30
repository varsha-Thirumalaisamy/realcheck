"""
Benchmark Engine for RealCheck AI Detectors.

Evaluates forensic detectors on verified evaluation test sets and calculates:
- Accuracy
- Precision (Positive Predictive Value)
- Recall (Sensitivity / True Positive Rate)
- F1-Score
- Specificity (True Negative Rate)
- Negative Predictive Value (NPV)
- Confusion Matrix (TP, FP, TN, FN)
- Class balance & sample distribution
- Probabilistic Calibration (ECE, Brier Score) if continuous probabilities are available

ARCHITECTURAL SPECIFICATION:
- The detector is dynamically loaded via argument/config (--detector) so Member 1's
  upcoming fine-tuned/pretrained ML model plugs in seamlessly without modifying this benchmark script.
- NEVER invents, estimates, or hardcodes benchmark numbers.
- Metrics are calculated strictly from actual predictions and ground-truth labels.
"""

import os
import sys
import json
import argparse
import importlib
from typing import Dict, Any, List, Optional, Tuple, Callable
import numpy as np

from .dataset import DatasetManifestManager, DatasetSample
from .calibration import compute_brier_score, compute_ece, compute_reliability_curve


def calculate_metrics(
    y_true: List[int],
    y_pred: List[int],
    y_prob: Optional[List[float]] = None
) -> Dict[str, Any]:
    """
    Computes rigorous classification metrics and confusion matrix
    from ground-truth labels and model predictions.

    Class Convention:
      0: Real / Authentic
      1: AI-Generated / Synthetic
    """
    y_true_arr = np.asarray(y_true, dtype=int)
    y_pred_arr = np.asarray(y_pred, dtype=int)

    if len(y_true_arr) != len(y_pred_arr):
        raise ValueError(f"Length mismatch: {len(y_true_arr)} true labels vs {len(y_pred_arr)} predictions")

    total = len(y_true_arr)
    if total == 0:
        return {
            "total_samples": 0,
            "error": "No samples evaluated"
        }

    # Confusion Matrix calculation
    # True Positives: Actual 1, Predicted 1
    tp = int(np.sum((y_true_arr == 1) & (y_pred_arr == 1)))
    # False Positives: Actual 0, Predicted 1 (Real flagged as AI)
    fp = int(np.sum((y_true_arr == 0) & (y_pred_arr == 1)))
    # True Negatives: Actual 0, Predicted 0
    tn = int(np.sum((y_true_arr == 0) & (y_pred_arr == 0)))
    # False Negatives: Actual 1, Predicted 0 (AI missed as Real)
    fn = int(np.sum((y_true_arr == 1) & (y_pred_arr == 0)))

    # Class balance
    actual_positives = int(np.sum(y_true_arr == 1))
    actual_negatives = int(np.sum(y_true_arr == 0))
    prevalence = float(actual_positives / total) if total > 0 else 0.0

    # Accuracy
    accuracy = float((tp + tn) / total)

    # Precision / PPV: TP / (TP + FP)
    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0

    # Recall / Sensitivity / TPR: TP / (TP + FN)
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0

    # Specificity / TNR: TN / (TN + FP)
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    # Negative Predictive Value / NPV: TN / (TN + FN)
    npv = float(tn / (tn + fn)) if (tn + fn) > 0 else 0.0

    # F1-score: 2 * (P * R) / (P + R)
    f1 = float(2 * (precision * recall) / (precision + recall)) if (precision + recall) > 0 else 0.0

    metrics: Dict[str, Any] = {
        "sample_counts": {
            "total": total,
            "actual_ai_generated": actual_positives,
            "actual_real": actual_negatives,
            "ai_prevalence": prevalence,
        },
        "confusion_matrix": {
            "tp": tp,
            "fp": fp,
            "tn": tn,
            "fn": fn,
            "matrix_2x2": [
                [tn, fp],  # Row 0: Actual Real -> [Pred Real, Pred AI]
                [fn, tp],  # Row 1: Actual AI   -> [Pred Real, Pred AI]
            ]
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "specificity": round(specificity, 4),
            "negative_predictive_value": round(npv, 4),
        }
    }

    # Probabilistic metrics if available
    if y_prob is not None and len(y_prob) == total:
        y_prob_arr = np.asarray(y_prob, dtype=float)
        brier = compute_brier_score(y_true_arr, y_prob_arr)
        ece = compute_ece(y_true_arr, y_prob_arr, n_bins=10)
        metrics["calibration"] = {
            "brier_score": round(brier, 4),
            "expected_calibration_error": round(ece, 4),
        }

    return metrics


def load_detector_by_path(detector_spec: str) -> Any:
    """
    Dynamically loads an arbitrary detector class or callable from a dotted path.
    Supports:
      'app.detectors.image.detector.ImageDetector'
      'app.detectors.image.detector:ImageDetector'
      'my_module.MyClass'
    Allows Member 1's ML model to plug in without modifying benchmark.py.
    """
    if ":" in detector_spec:
        module_path, class_name = detector_spec.split(":", 1)
    elif "." in detector_spec:
        parts = detector_spec.rsplit(".", 1)
        module_path, class_name = parts[0], parts[1]
    else:
        raise ValueError(f"Invalid detector path format '{detector_spec}'. Use 'package.module.ClassName'")

    try:
        mod = importlib.import_module(module_path)
    except ImportError as e:
        raise ImportError(f"Could not import module '{module_path}': {e}")

    if not hasattr(mod, class_name):
        raise AttributeError(f"Module '{module_path}' has no class/attribute '{class_name}'")

    detector_cls = getattr(mod, class_name)
    # Instantiate if it's a class
    if isinstance(detector_cls, type):
        return detector_cls()
    return detector_cls


def predict_single_sample(detector: Any, file_path: str, threshold: float = 0.5) -> Tuple[int, float]:
    """
    Executes a detector on a single file path and extracts binary prediction and AI probability.
    Adapts to BaseDetector (.analyze()) or standard model callables (.predict() / __call__()).
    """
    prob = 0.5
    # Case 1: Standard RealCheck BaseDetector
    if hasattr(detector, "analyze"):
        meta = {"file_name": os.path.basename(file_path), "file_size": "benchmark"}
        result = detector.analyze(file_path, meta)
        # Extract probability (0.0 - 1.0)
        if hasattr(result, "ai_generation_probability"):
            prob = float(result.ai_generation_probability) / 100.0
        elif hasattr(result, "authenticity_score"):
            prob = 1.0 - (float(result.authenticity_score) / 100.0)
    elif hasattr(detector, "predict_proba"):
        probs = detector.predict_proba([file_path])
        prob = float(probs[0][1] if len(probs[0]) > 1 else probs[0])
    elif callable(detector):
        out = detector(file_path)
        prob = float(out)
    else:
        raise TypeError(f"Detector of type {type(detector)} has no analyze, predict_proba, or __call__ method")

    pred = 1 if prob >= threshold else 0
    return pred, prob


def run_benchmark(
    manifest_path: str,
    detector: Any,
    split: str = "test",
    threshold: float = 0.5,
    is_smoke_test: bool = False,
    require_verified: bool = False
) -> Dict[str, Any]:
    """
    Runs evaluation benchmark against the specified split in the dataset manifest.
    """
    if is_smoke_test:
        print("\n" + "=" * 70)
        print("  *** NOTICE: PIPELINE TEST ONLY (NOT FINAL MODEL BENCHMARK RESULTS) ***")
        print("  This run validates test execution infrastructure.")
        print("=" * 70 + "\n")

    manifest = DatasetManifestManager(manifest_path)
    samples = manifest.get_split(split, require_verified=require_verified)

    if not samples:
        raise ValueError(f"No samples found in manifest '{manifest_path}' for split '{split}'")

    y_true: List[int] = []
    y_pred: List[int] = []
    y_prob: List[float] = []
    sample_details: List[Dict[str, Any]] = []

    for s in samples:
        if not os.path.exists(s.file_path):
            raise FileNotFoundError(f"Sample file not found: {s.file_path} (ID: {s.id})")

        pred, prob = predict_single_sample(detector, s.file_path, threshold=threshold)

        y_true.append(s.ground_truth)
        y_pred.append(pred)
        y_prob.append(prob)

        sample_details.append({
            "id": s.id,
            "file": os.path.basename(s.file_path),
            "ground_truth": s.ground_truth,
            "prediction": pred,
            "ai_probability": round(prob, 4),
            "source": s.source,
            "label_verified": s.label_verified,
            "correct": pred == s.ground_truth
        })

    metrics = calculate_metrics(y_true, y_pred, y_prob)
    metrics["benchmark_metadata"] = {
        "manifest_path": manifest_path,
        "split": split,
        "threshold": threshold,
        "is_smoke_test": is_smoke_test,
        "detector_class": detector.__class__.__name__ if hasattr(detector, "__class__") else str(detector),
    }
    metrics["samples"] = sample_details

    return metrics


def print_metrics_summary(results: Dict[str, Any]) -> None:
    """Pretty prints benchmark metrics and confusion matrix."""
    meta = results.get("benchmark_metadata", {})
    if meta.get("is_smoke_test"):
        print("\n" + "=" * 60)
        print(" [PIPELINE TEST ONLY - DO NOT CITE AS MODEL RESULTS]")
        print("=" * 60)

    print(f"\nEvaluated Split: {meta.get('split')}")
    print(f"Detector Class:  {meta.get('detector_class')}")
    print(f"Decision Thresh: {meta.get('threshold')}")

    counts = results["sample_counts"]
    print(f"\nSample Distribution:")
    print(f"  Total Samples:        {counts['total']}")
    print(f"  Actual Real (0):      {counts['actual_real']}")
    print(f"  Actual AI-Gen (1):    {counts['actual_ai_generated']}")
    print(f"  Prevalence:           {counts['ai_prevalence'] * 100:.1f}%")

    cm = results["confusion_matrix"]
    print(f"\nConfusion Matrix:")
    print(f"                  Predicted Real (0)    Predicted AI (1)")
    print(f"  Actual Real (0)       TN = {cm['tn']:<6}          FP = {cm['fp']:<6}")
    print(f"  Actual AI   (1)       FN = {cm['fn']:<6}          TP = {cm['tp']:<6}")

    m = results["metrics"]
    print(f"\nPerformance Metrics:")
    print(f"  Accuracy:                  {m['accuracy'] * 100:.2f}%")
    print(f"  Precision (PPV):           {m['precision'] * 100:.2f}%")
    print(f"  Recall / Sensitivity (TPR):{m['recall'] * 100:.2f}%")
    print(f"  Specificity (TNR):         {m['specificity'] * 100:.2f}%")
    print(f"  Negative Pred Value (NPV): {m['negative_predictive_value'] * 100:.2f}%")
    print(f"  F1-Score:                  {m['f1_score']:.4f}")

    if "calibration" in results:
        cal = results["calibration"]
        print(f"\nProbabilistic Calibration:")
        print(f"  Brier Score:               {cal['brier_score']:.4f}")
        print(f"  Expected Calib Error (ECE):{cal['expected_calibration_error']:.4f}")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="RealCheck AI Detector Benchmark Runner")
    parser.add_argument("--manifest", type=str, required=True, help="Path to manifest JSON file")
    parser.add_argument("--detector", type=str, default="app.detectors.image.detector.ImageDetector",
                        help="Dotted path to detector class/module (e.g. app.detectors.image.detector.ImageDetector)")
    parser.add_argument("--split", type=str, default="test", choices=["test", "calibration"],
                        help="Dataset split to evaluate")
    parser.add_argument("--threshold", type=float, default=0.5, help="Classification threshold (default 0.5)")
    parser.add_argument("--smoke-test", action="store_true", help="Flag as pipeline test only, not final results")
    parser.add_argument("--require-verified", action="store_true", help="Only run on samples with label_verified=True")
    parser.add_argument("--output-json", type=str, default=None, help="Save metrics output to JSON file")

    args = parser.parse_args()

    detector = load_detector_by_path(args.detector)
    results = run_benchmark(
        manifest_path=args.manifest,
        detector=detector,
        split=args.split,
        threshold=args.threshold,
        is_smoke_test=args.smoke_test,
        require_verified=args.require_verified
    )

    print_metrics_summary(results)

    if args.output_json:
        os.makedirs(os.path.dirname(os.path.abspath(args.output_json)), exist_ok=True)
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"Saved benchmark results to {args.output_json}")


if __name__ == "__main__":
    main()
