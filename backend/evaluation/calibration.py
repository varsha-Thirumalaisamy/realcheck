"""
Confidence Calibration Module for RealCheck AI.

Implements:
1. Expected Calibration Error (ECE)
2. Brier Score
3. Reliability Curve / Binning Breakdown
4. Temperature Scaling (Post-hoc logit scaling)
5. Platt Scaling (Logistic calibration on logits)

CRITICAL USAGE RULES:
- Calibrators MUST be fit ONLY on a dedicated 'calibration' split (never on the 'test' split).
- Calibration MUST be applied to real continuous model logits/probabilities (e.g. from Member 1's ML model),
  NEVER on artificial heuristic step functions.
"""

import numpy as np
from typing import Dict, Any, Tuple, Optional
from scipy.optimize import minimize


def compute_brier_score(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    """
    Computes the Brier score (Mean Squared Error of probabilistic predictions).
    Lower is better (0.0 is perfect, 0.25 is uninformative coin toss).
    """
    y_true = np.asarray(y_true, dtype=np.float64)
    y_prob = np.asarray(y_prob, dtype=np.float64)
    if len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must have identical lengths")
    return float(np.mean((y_prob - y_true) ** 2))


def compute_ece(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
    """
    Computes Expected Calibration Error (ECE).
    Measures the difference between predicted confidence and empirical accuracy across bins.
    """
    y_true = np.asarray(y_true, dtype=np.float64)
    y_prob = np.asarray(y_prob, dtype=np.float64)
    if len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must have identical lengths")
    if len(y_true) == 0:
        return 0.0

    bins = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    n_samples = len(y_true)

    for i in range(n_bins):
        # Include right edge on the last bin
        if i == n_bins - 1:
            bin_mask = (y_prob >= bins[i]) & (y_prob <= bins[i + 1])
        else:
            bin_mask = (y_prob >= bins[i]) & (y_prob < bins[i + 1])

        bin_count = np.sum(bin_mask)
        if bin_count > 0:
            bin_acc = np.mean(y_true[bin_mask])
            bin_conf = np.mean(y_prob[bin_mask])
            ece += (bin_count / n_samples) * np.abs(bin_acc - bin_conf)

    return float(ece)


def compute_reliability_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10
) -> Dict[str, Any]:
    """
    Generates binned reliability data points for calibration curve inspection.
    """
    y_true = np.asarray(y_true, dtype=np.float64)
    y_prob = np.asarray(y_prob, dtype=np.float64)

    bins = np.linspace(0.0, 1.0, n_bins + 1)
    bin_centers = []
    bin_accuracies = []
    bin_confidences = []
    bin_counts = []

    for i in range(n_bins):
        if i == n_bins - 1:
            bin_mask = (y_prob >= bins[i]) & (y_prob <= bins[i + 1])
        else:
            bin_mask = (y_prob >= bins[i]) & (y_prob < bins[i + 1])

        bin_count = int(np.sum(bin_mask))
        bin_counts.append(bin_count)
        bin_center = float((bins[i] + bins[i + 1]) / 2.0)
        bin_centers.append(bin_center)

        if bin_count > 0:
            bin_accuracies.append(float(np.mean(y_true[bin_mask])))
            bin_confidences.append(float(np.mean(y_prob[bin_mask])))
        else:
            bin_accuracies.append(None)
            bin_confidences.append(None)

    ece = compute_ece(y_true, y_prob, n_bins)
    brier = compute_brier_score(y_true, y_prob)

    return {
        "n_bins": n_bins,
        "bin_edges": bins.tolist(),
        "bin_centers": bin_centers,
        "bin_accuracies": bin_accuracies,
        "bin_confidences": bin_confidences,
        "bin_counts": bin_counts,
        "ece": ece,
        "brier_score": brier,
    }


def _sigmoid(z: np.ndarray) -> np.ndarray:
    """Numerically stable sigmoid."""
    return np.where(z >= 0, 1 / (1 + np.exp(-z)), np.exp(z) / (1 + np.exp(z)))


def _probs_to_logits(probs: np.ndarray, eps: float = 1e-7) -> np.ndarray:
    """Safely converts probabilities in [0, 1] to unconstrained logits."""
    p_clipped = np.clip(probs, eps, 1.0 - eps)
    return np.log(p_clipped / (1.0 - p_clipped))


class TemperatureScaler:
    """
    Temperature Scaling for binary classification confidence calibration.
    Takes logits z and maps them to calibrated probabilities: p_calib = sigmoid(z / T).

    Optimization: Solves for T > 0 by minimizing Negative Log-Likelihood (NLL)
    exclusively on a held-out calibration/validation split.
    """

    def __init__(self):
        self.temperature: float = 1.0
        self.is_fitted: bool = False

    def fit(self, logits_calib: np.ndarray, y_calib: np.ndarray) -> "TemperatureScaler":
        """
        Fits temperature parameter T exclusively on calibration data.
        NEVER pass test data to this method.
        """
        logits = np.asarray(logits_calib, dtype=np.float64)
        y = np.asarray(y_calib, dtype=np.float64)

        if len(logits) != len(y):
            raise ValueError("Calibration logits and ground truth must have the same length")
        if len(logits) < 5:
            raise ValueError("At least 5 calibration samples required to reliably fit temperature")

        def _nll_loss(T_arr: np.ndarray) -> float:
            T = T_arr[0]
            if T <= 0:
                return 1e9
            scaled = logits / T
            # Numerically stable binary cross-entropy:
            # log(1 + exp(s)) - y * s  if s >= 0
            # log(1 + exp(-s)) - (1 - y) * (-s) if s < 0
            loss = np.where(
                scaled >= 0,
                np.log1p(np.exp(-scaled)) + (1 - y) * scaled,
                np.log1p(np.exp(scaled)) - y * scaled,
            )
            return float(np.mean(loss))

        res = minimize(
            _nll_loss,
            x0=np.array([1.0]),
            bounds=[(0.01, 50.0)],
            method="L-BFGS-B"
        )

        if res.success:
            self.temperature = float(res.x[0])
            self.is_fitted = True
        else:
            # Fallback to T=1.0 if optimization fails
            self.temperature = 1.0
            self.is_fitted = False

        return self

    def predict_proba(self, logits: np.ndarray) -> np.ndarray:
        """
        Transforms logits into calibrated probabilities using learned temperature T.
        """
        logits = np.asarray(logits, dtype=np.float64)
        return _sigmoid(logits / self.temperature)


class PlattScaler:
    """
    Platt Scaling (Logistic Calibration) on model logits:
    p_calib = sigmoid(A * z + B).

    Fitted on held-out calibration split using maximum likelihood.
    """

    def __init__(self):
        self.A: float = 1.0
        self.B: float = 0.0
        self.is_fitted: bool = False

    def fit(self, logits_calib: np.ndarray, y_calib: np.ndarray) -> "PlattScaler":
        """
        Fits slope A and intercept B on calibration split.
        """
        logits = np.asarray(logits_calib, dtype=np.float64)
        y = np.asarray(y_calib, dtype=np.float64)

        if len(logits) != len(y):
            raise ValueError("Calibration logits and ground truth must have identical lengths")

        def _nll_loss(params: np.ndarray) -> float:
            a, b = params
            scaled = a * logits + b
            loss = np.where(
                scaled >= 0,
                np.log1p(np.exp(-scaled)) + (1 - y) * scaled,
                np.log1p(np.exp(scaled)) - y * scaled,
            )
            return float(np.mean(loss))

        res = minimize(
            _nll_loss,
            x0=np.array([1.0, 0.0]),
            bounds=[(0.001, 20.0), (-20.0, 20.0)],
            method="L-BFGS-B"
        )

        if res.success:
            self.A = float(res.x[0])
            self.B = float(res.x[1])
            self.is_fitted = True
        else:
            self.A = 1.0
            self.B = 0.0
            self.is_fitted = False

        return self

    def predict_proba(self, logits: np.ndarray) -> np.ndarray:
        """
        Transforms logits into calibrated probabilities using learned (A, B).
        """
        logits = np.asarray(logits, dtype=np.float64)
        return _sigmoid(self.A * logits + self.B)


def run_calibration_experiment(
    logits_calib: np.ndarray,
    y_calib: np.ndarray,
    logits_test: np.ndarray,
    y_test: np.ndarray,
    method: str = "temperature",
    n_bins: int = 10
) -> Dict[str, Any]:
    """
    Executes a strict calibration experiment:
    1. Fits scaler (Temperature or Platt) ONLY on calibration split.
    2. Transforms test split logits to calibrated probabilities.
    3. Evaluates and compares uncalibrated vs. calibrated ECE & Brier score on the test split.
    """
    logits_calib = np.asarray(logits_calib, dtype=np.float64)
    y_calib = np.asarray(y_calib, dtype=int)
    logits_test = np.asarray(logits_test, dtype=np.float64)
    y_test = np.asarray(y_test, dtype=int)

    # Uncalibrated test probabilities (standard sigmoid)
    p_test_uncalib = _sigmoid(logits_test)
    uncalib_ece = compute_ece(y_test, p_test_uncalib, n_bins=n_bins)
    uncalib_brier = compute_brier_score(y_test, p_test_uncalib)

    scaler_info = {}
    if method == "temperature":
        scaler = TemperatureScaler()
        scaler.fit(logits_calib, y_calib)
        p_test_calib = scaler.predict_proba(logits_test)
        scaler_info = {
            "method": "Temperature Scaling",
            "temperature": round(scaler.temperature, 4),
            "is_fitted": scaler.is_fitted
        }
    elif method == "platt":
        scaler = PlattScaler()
        scaler.fit(logits_calib, y_calib)
        p_test_calib = scaler.predict_proba(logits_test)
        scaler_info = {
            "method": "Platt Scaling (Logistic)",
            "param_A": round(scaler.A, 4),
            "param_B": round(scaler.B, 4),
            "is_fitted": scaler.is_fitted
        }
    else:
        raise ValueError(f"Unknown calibration method '{method}'. Choose 'temperature' or 'platt'.")

    calib_ece = compute_ece(y_test, p_test_calib, n_bins=n_bins)
    calib_brier = compute_brier_score(y_test, p_test_calib)

    return {
        "scaler": scaler_info,
        "sample_counts": {
            "calibration_samples": len(y_calib),
            "test_samples": len(y_test),
        },
        "test_uncalibrated": {
            "ece": round(uncalib_ece, 4),
            "brier_score": round(uncalib_brier, 4),
        },
        "test_calibrated": {
            "ece": round(calib_ece, 4),
            "brier_score": round(calib_brier, 4),
            "ece_reduction": round(uncalib_ece - calib_ece, 4),
            "brier_reduction": round(uncalib_brier - calib_brier, 4),
        },
        "reliability_curve": compute_reliability_curve(y_test, p_test_calib, n_bins=n_bins)
    }
