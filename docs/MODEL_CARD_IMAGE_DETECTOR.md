# Model Card: REALCHECK AI Image Forensic Detector

> **Document Version:** 1.0.0  
> **Status:** Benchmark Ready &mdash; Evaluation Pending ML Model Integration (Member 1)  
> **Maintainers:** REALCHECK AI Team (Member 1: Model Architecture & Training; Member 2: Evaluation, Calibration & Benchmarking)

---

## 1. Model Details

- **Model Name:** REALCHECK AI Image Forensics Classifier
- **Model Type:** Deep Learning / Vision Feature Extractor (Supervised Binary Classifier)
- **Model Version:** *Pending Member 1 ML Model Integration* (Current baseline in repository is an analytical pixel-variance and EXIF heuristic; production model will be integrated via the standard `BaseDetector` interface).
- **Target Architecture:** Pretrained / Fine-tuned Neural Vision Model (e.g. Vision Transformer / ResNet-based Forensic Backbone).
- **Framework:** PyTorch / ONNX Runtime / Hugging Face Transformers.
- **License:** MIT License.

---

## 2. Intended Use

- **Primary Application:** Automated forensic screening and probabilistic authenticity assessment of digital still images to detect AI synthesis (latent diffusion, GANs, autoregressive generators) vs. authentic camera photographs.
- **Intended Users:** Digital forensic investigators, journalists, disinformation researchers, trust & safety moderators, and legal verification specialists.
- **Out-of-Scope Use Cases:**
  - Absolute legal proof of guilt or innocence without corroborating forensic signals.
  - Identification of specific individuals or face recognition.
  - Detection on low-resolution micro-thumbnails (< 64x64 px) where optical sensor signatures are destroyed.

---

## 3. Input & Output Specification

### Input Format
- **Data Modality:** Single still image file.
- **Supported Formats:** JPEG, PNG, WEBP, TIFF, BMP.
- **Color Space:** RGB (3 channels), normalized to model input tensors.
- **Target Resolution:** Dynamic resolution or resized to standard forensic patch resolutions (e.g. 224x224, 512x512).
- **Metadata Handling:** Optional EXIF metadata passed to forensic evidence fusion.

### Output Classes
- **Binary Classification Scheme:**
  - **Class 0 (`Real` / `Authentic`):** Digital photographs captured by physical optical sensors with natural photon noise and camera hardware provenance.
  - **Class 1 (`AI-Generated` / `Synthetic`):** Images wholly generated or substantially synthesized by generative models (Diffusion models, GANs, neural upsamplers).
- **Prediction Outputs:**
  - Raw Model Logits: $z \in (-\infty, +\infty)$
  - Calibrated Probability: $p = \sigma(z / T) \in [0.0, 1.0]$
  - Categorical Assessment:
    - $p < 0.35$: `"Likely Authentic"`
    - $0.35 \le p \le 0.65$: `"Uncertain / Mixed Evidence"`
    - $p > 0.65$: `"Likely AI-Generated"`

---

## 4. Evaluation Dataset Protocol

Evaluation is conducted strictly using the manifest management system (`backend/evaluation/dataset.py`) to prevent data leakage and benchmark contamination.

- **Candidate Evaluation Corpora:**
  - **Authentic (Class 0):** Uncompressed and standard compressed photographic datasets with verified physical sensor origins (e.g., RAISE, Flickr30k raw subsets, Camera-Direct verified captures).
  - **Synthetic (Class 1):** Multi-generator synthetic corpora representing contemporary generative pipelines (e.g., GenImage, CIFAKE test split, Stable Diffusion 1.5/2.1/XL, Midjourney, DALL-E 3).
- **Split Separation (Anti-Leakage Mandate):**
  - **Calibration Split:** Dedicated subset (e.g. 20%) used solely for post-hoc confidence calibration (Temperature Scaling / Platt Scaling).
  - **Test Split:** Held-out test set (e.g. 80%) used strictly for final metric measurement.
  - *Calibrators must NEVER be fitted on the test split.*
- **Verification Rule:** Every sample in the manifest records `source`, `license`, and `label_origin`. Samples carry `label_verified=false` until human or cryptographic audit confirms ground truth.

---

## 5. Benchmark Performance Metrics

> [!IMPORTANT]
> **Strict Transparency Notice:** The metrics below represent the official benchmark results for the upcoming ML Image Detector. In accordance with project policy, no synthetic or heuristic metric is published as a final model result.
>
> All values remain **Not yet evaluated** until Member 1's ML model is plugged into `backend/evaluation/benchmark.py` and evaluated on the verified benchmark test split.

### Overall Classification Performance

| Metric | Target Specification | Actual Measured Value | Measurement Status |
|---|---|---|---|
| **Accuracy** | $\ge 90.0\%$ | *Not yet evaluated* | Pending Member 1 ML model integration |
| **Precision (PPV)** | $\ge 88.0\%$ | *Not yet evaluated* | Pending Member 1 ML model integration |
| **Recall (TPR / Sensitivity)** | $\ge 90.0\%$ | *Not yet evaluated* | Pending Member 1 ML model integration |
| **F1-Score** | $\ge 89.0\%$ | *Not yet evaluated* | Pending Member 1 ML model integration |
| **Specificity (TNR)** | $\ge 88.0\%$ | *Not yet evaluated* | Pending Member 1 ML model integration |
| **Negative Predictive Value (NPV)** | $\ge 90.0\%$ | *Not yet evaluated* | Pending Member 1 ML model integration |

### Confusion Matrix (Test Split)

```
                       Predicted Authentic (0)     Predicted AI-Generated (1)
Actual Authentic (0)   TN = [Not yet evaluated]    FP = [Not yet evaluated]
Actual AI-Gen    (1)   FN = [Not yet evaluated]    TP = [Not yet evaluated]
```

*Total Test Samples:* `[Not yet evaluated]` &bull; *Class Balance:* `[Not yet evaluated]`

---

## 6. Confidence Calibration

Confidence calibration measures how reliably the model's predicted probabilities correspond to real-world accuracy.

- **Calibration Method:** Post-hoc Temperature Scaling ($p = \sigma(z / T)$) implemented in `backend/evaluation/calibration.py`.
- **Optimal Temperature ($T$):** *Not yet evaluated* (Requires calibration split logit optimization).
- **Uncalibrated Expected Calibration Error (ECE):** *Not yet evaluated*
- **Calibrated Expected Calibration Error (ECE):** *Not yet evaluated*
- **Brier Score (Mean Squared Probability Error):** *Not yet evaluated*

---

## 7. Limitations & Known Failure Cases

1. **Heavy Lossy Re-Compression:**
   Aggressive social media compression (WhatsApp, Twitter/X, Instagram) strips high-frequency Fourier harmonics and introduces JPEG macroblocking, which can cause false negatives or uncertain verdicts.
2. **Screenshots & Digital Re-Photography:**
   Taking a photograph of an AI-generated image displayed on an LCD monitor introduces genuine optical sensor noise and Moire patterns, which can mislead sensor residual (PRNU) detectors.
3. **Flat-Color Vector Art & Digital Illustrations:**
   Authentic digital drawings and flat UI assets exhibit naturally low pixel variance and lack optical noise, risking false positives if variance alone is consulted.
4. **Hybrid / Partially Inpainted Images:**
   Images where only a small localized region (e.g. replacing a face or an object) is AI-generated require localized patch-level inspection; global image-level classifiers may dilute the synthetic signal.
5. **Adversarial Perturbations:**
   Adversarial noise specifically optimized against neural feature extractors can bypass detection.

---

## 8. Reproducibility & Benchmark Instructions

To run the benchmark once Member 1's ML detector class is deployed:

```bash
# From the backend directory:
python -m evaluation.benchmark \
  --manifest evaluation/test_manifest.json \
  --detector app.detectors.image.neural_detector.NeuralImageDetector \
  --split test \
  --threshold 0.5 \
  --output-json ../reports/image_benchmark_results.json
```

To run metric unit tests on synthetic known arrays:
```bash
python test_benchmark.py
```
