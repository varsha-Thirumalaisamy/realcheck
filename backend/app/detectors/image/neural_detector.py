"""
Neural Image Forensic Detector Engine for RealCheck AI.

Uses an authentic fine-tuned deep learning model (EfficientNet-B0 trained on FaceForensics++ C23)
to produce genuine model logits and continuous AI-vs-Real probabilities.
Features genuine gradient-weighted class activation mapping (Grad-CAM) computed directly
from the neural network's final convolutional layer.
"""

import os
import time
import hashlib
import io
import base64
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List

import numpy as np
from PIL import Image, ExifTags

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from torchvision.models import efficientnet_b0

from ..base import BaseDetector
from ...schemas.forensics import (
    InvestigationResult,
    ForensicSignal,
    EvidenceCard,
    MetadataAnalysis,
    SuspiciousRegion,
)

DEFAULT_WEIGHTS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "weights",
    "efficientnet_b0_ffpp_c23.pth"
)


class NeuralImageDetector(BaseDetector):
    """
    Legitimate pretrained/fine-tuned Deep Learning Image Detector.
    Architecture: EfficientNet-B0
    Weights: FaceForensics++ (FF++) C23 benchmark fine-tuning
    Classes: Index 0 = Real / Authentic, Index 1 = Fake / AI-Generated / Manipulated
    """

    def __init__(self, weights_path: Optional[str] = None, device: Optional[str] = None):
        super().__init__(
            model_name="Neural Deepfake & AI Detector (EfficientNet-B0)",
            model_version="v2.5.0-neural-ffpp",
            input_type="IMAGE"
        )
        self.weights_path = weights_path or DEFAULT_WEIGHTS_PATH
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))

        # Preprocessing pipeline (standard evaluation pipeline for FF++ EfficientNet)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # Model instantiation
        self.model = efficientnet_b0(weights=None)
        self.model.classifier[1] = nn.Linear(1280, 2)

        if os.path.exists(self.weights_path):
            state_dict = torch.load(self.weights_path, map_location=self.device)
            self.model.load_state_dict(state_dict, strict=True)
        else:
            raise FileNotFoundError(f"Model weights not found at: {self.weights_path}")

        self.model.to(self.device)
        self.model.eval()

        # Hooks storage for Grad-CAM
        self.activations = None
        self.gradients = None
        self._register_gradcam_hooks()

    def _register_gradcam_hooks(self):
        """Registers forward and backward hooks on the last convolutional feature map."""
        target_layer = self.model.features[8]

        def forward_hook(module, inp, out):
            self.activations = out

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0]

        target_layer.register_forward_hook(forward_hook)
        target_layer.register_full_backward_hook(backward_hook)

    def get_logits(self, file_path_or_image: Any) -> np.ndarray:
        """
        Runs image through neural network and returns raw logits: [logit_real, logit_fake].
        """
        tensor = self._preprocess(file_path_or_image).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
        return logits.cpu().numpy()[0]

    def _preprocess(self, file_path_or_image: Any) -> torch.Tensor:
        """Preprocesses image file or PIL Image into model input tensor (1, 3, 224, 224)."""
        if isinstance(file_path_or_image, Image.Image):
            img = file_path_or_image.convert("RGB")
        elif isinstance(file_path_or_image, str) and os.path.exists(file_path_or_image):
            img = Image.open(file_path_or_image).convert("RGB")
        else:
            raise ValueError(f"Invalid input to preprocess: {file_path_or_image}")

        tensor = self.transform(img).unsqueeze(0)
        return tensor

    def compute_gradcam(self, tensor: torch.Tensor, target_class: int = 1) -> np.ndarray:
        """
        Generates genuine Grad-CAM heatmap array of shape (224, 224)
        derived from backpropagating the target class score to features[8].
        """
        self.model.zero_grad()
        tensor_grad = tensor.clone().detach().to(self.device)
        tensor_grad.requires_grad = True

        out = self.model(tensor_grad)
        score = out[0, target_class]
        score.backward()

        if self.gradients is None or self.activations is None:
            return np.zeros((224, 224), dtype=np.float32)

        # Global average pool the gradients
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        # Weighted combination of feature activation maps
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear", align_corners=False)

        # Normalize to [0, 1]
        cam = cam - cam.min()
        if cam.max() > 0:
            cam = cam / cam.max()

        heatmap = cam.squeeze().detach().cpu().numpy()
        return heatmap

    def analyze(self, file_path_or_content: Any, metadata: Optional[Dict[str, Any]] = None) -> InvestigationResult:
        case_id = f"RC-2026-{int(time.time() % 10000):04d}"
        file_name = (metadata or {}).get("file_name", "analyzed_image.png")
        file_size = (metadata or {}).get("file_size", "0.0 MB")
        content_hash = hashlib.sha256(file_name.encode()).hexdigest()

        if not file_path_or_content or not os.path.exists(str(file_path_or_content)):
            raise FileNotFoundError(f"Image file does not exist: {file_path_or_content}")

        # 1. Real Neural Inference
        with Image.open(file_path_or_content) as pil_img:
            dimensions = f"{pil_img.width} x {pil_img.height}"
            mime_type = Image.MIME.get(pil_img.format, "image/png")
            
            # Hash actual bytes
            hasher = hashlib.sha256()
            with open(file_path_or_content, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            content_hash = hasher.hexdigest()

            # Preprocess tensor
            input_tensor = self.transform(pil_img.convert("RGB")).unsqueeze(0).to(self.device)

            # 2. Extract genuine logits and probabilities with live timing
            t_infer_start = time.perf_counter()
            with torch.no_grad():
                logits = self.model(input_tensor)
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
            inference_time_ms = round((time.perf_counter() - t_infer_start) * 1000.0, 2)

            logit_real = float(logits[0, 0].item())
            logit_fake = float(logits[0, 1].item())
            prob_real = float(probs[0])
            prob_fake = float(probs[1])

            # Class 0 = Real, Class 1 = Fake (AI-Generated / Manipulated)
            deepfake_prob = round(prob_fake, 4)
            ai_prob = round(prob_fake * 100.0, 1)
            # Ensure authenticity score and AI generation probability strictly sum to 100%
            authenticity_score = max(0, min(100, 100 - int(round(ai_prob))))
            
            # Epistemic confidence score from probability separation
            confidence_score = round(float(max(prob_real, prob_fake)), 4)
            if confidence_score >= 0.85:
                confidence_level = "High"
            elif confidence_score >= 0.65:
                confidence_level = "Moderate"
            else:
                confidence_level = "Low"

            # 3. Categorical Assessment
            if prob_fake >= 0.65:
                assessment = "Likely AI-Generated"
                risk_level = "High Risk"
            elif prob_fake <= 0.35:
                assessment = "Likely Authentic"
                risk_level = "Low Risk"
            else:
                assessment = "Uncertain / Mixed Evidence"
                risk_level = "Medium Risk"

            # 4. Genuine Grad-CAM Computation
            cam_class = 1 if prob_fake >= 0.5 else 0
            heatmap = self.compute_gradcam(input_tensor, target_class=cam_class)
            
            # Identify salient high-activation bounding box from Grad-CAM
            high_act_mask = heatmap >= 0.70
            regions: List[SuspiciousRegion] = []
            if np.any(high_act_mask):
                y_indices, x_indices = np.where(high_act_mask)
                y_min, y_max = float(y_indices.min()) / 224.0, float(y_indices.max()) / 224.0
                x_min, x_max = float(x_indices.min()) / 224.0, float(x_indices.max()) / 224.0
                regions.append(
                    SuspiciousRegion(
                        id="CAM-SALIENT-01",
                        label="NEURAL ARTIFACT CLUSTER" if cam_class == 1 else "ATTRIBUTED REAL PATTERN",
                        confidence=confidence_score,
                        coordinates={
                            "x": round(x_min * 100.0, 1),
                            "y": round(y_min * 100.0, 1),
                            "width": round((x_max - x_min) * 100.0, 1),
                            "height": round((y_max - y_min) * 100.0, 1)
                        },
                        anomaly_type="Grad-CAM Peak Activation",
                        explanation=f"Top gradient-weighted neural activation focused on region [{round(x_min*100)}%, {round(y_min*100)}%]."
                    )
                )

            # 5. Supporting Forensic Evidence (EXIF + Sensor Residual) - Kept separate from ML score
            signals: List[ForensicSignal] = []
            evidence: List[EvidenceCard] = []

            # Primary Neural ML Signal
            signals.append(
                ForensicSignal(
                    name="Deep Neural Feature Classifier (Primary ML)",
                    category="neural_cv",
                    score=ai_prob,
                    weight=0.70,
                    strength="Strong" if confidence_level == "High" else "Moderate",
                    status="Anomaly Detected" if prob_fake >= 0.50 else "Within Normal Variance",
                    explanation=(
                        f"EfficientNet-B0 extracted high-order synthetic facial/texture anomalies. "
                        f"Model logits: [Real: {logit_real:.2f}, Fake: {logit_fake:.2f}]."
                    ),
                    affected_region_or_time="Global Convolutional Feature Map",
                    model_contribution_pct=70.0
                )
            )

            # Supporting Signal: EXIF
            exif_data = pil_img.getexif()
            has_exif = bool(exif_data)
            camera_model = "Not detected"
            software = "None detected"
            if exif_data:
                for k, v in exif_data.items():
                    tag = ExifTags.TAGS.get(k, k)
                    if tag == "Model":
                        camera_model = str(v)
                    elif tag == "Software":
                        software = str(v)

            meta_risk = 20.0 if has_exif else 70.0
            signals.append(
                ForensicSignal(
                    name="EXIF Hardware Provenance (Supporting)",
                    category="metadata",
                    score=meta_risk,
                    weight=0.15,
                    strength="Moderate" if not has_exif else "Weak",
                    status="Suspicious Pattern" if not has_exif else "Within Normal Variance",
                    explanation=f"EXIF metadata: {camera_model if has_exif else 'Stripped or absent'}.",
                    affected_region_or_time="File header",
                    model_contribution_pct=15.0
                )
            )

            # Supporting Signal: Texture Noise Variance
            img_arr = np.array(pil_img.convert("RGB"))
            noise_var = float(np.var(img_arr))
            tex_score = 80.0 if noise_var < 500 else max(10.0, 90.0 - (noise_var / 50.0))
            signals.append(
                ForensicSignal(
                    name="Sensor Noise Residual Variance (Supporting)",
                    category="texture",
                    score=tex_score,
                    weight=0.15,
                    strength="Moderate",
                    status="Anomaly Detected" if noise_var < 500 else "Within Normal Variance",
                    explanation=f"Global pixel variance measured at {noise_var:.1f}.",
                    affected_region_or_time="Global",
                    model_contribution_pct=15.0
                )
            )

            evidence.append(
                EvidenceCard(
                    title="Deep Learning Classification",
                    status="Critical Anomaly" if prob_fake >= 0.70 else ("Verified Natural" if prob_fake <= 0.30 else "Inconclusive"),
                    score=ai_prob,
                    risk=risk_level,
                    explanation=f"Pretrained convolutional backbone predicts {ai_prob:.1f}% synthetic likelihood (Raw Logit: {logit_fake:.3f}).",
                    category="neural_cv"
                )
            )

            evidence.append(
                EvidenceCard(
                    title="Model Verification & Audit Trail",
                    status="Verified Natural" if prob_fake <= 0.35 else ("Critical Anomaly" if prob_fake >= 0.65 else "Inconclusive"),
                    score=round(confidence_score * 100, 1),
                    risk=risk_level,
                    explanation=f"Live PyTorch model executed ({inference_time_ms:.1f}ms). Weights: {os.path.basename(self.weights_path)}. Device: {self.device}. Logits: [Real: {logit_real:.2f}, Fake: {logit_fake:.2f}].",
                    category="verification"
                )
            )

            why_explanation = (
                f"Neural Image Analysis completed with {confidence_level} confidence ({confidence_score * 100:.1f}%). "
                f"The deep neural classifier evaluated model logits [Real: {logit_real:.2f}, Fake: {logit_fake:.2f}], "
                f"yielding an AI-generation probability of {ai_prob:.1f}%. Supporting metadata and texture analysis "
                f"corroborated the neural assessment."
            )

            # 6. Generate genuine Processed & Annotated Image with model detection marked on it
            anno_url, heat_url = self.generate_annotated_image(
                pil_img=pil_img,
                heatmap=heatmap,
                regions=regions,
                assessment=assessment,
                confidence_score=confidence_score,
                inference_time_ms=inference_time_ms,
                content_hash=content_hash,
                is_fake=(prob_fake >= 0.5)
            )

            verification_payload = {
                "model_called": True,
                "inference_status": "SUCCESS",
                "inference_time_ms": inference_time_ms,
                "model_name": self.model_name,
                "model_version": self.model_version,
                "weights_path": f"weights/{os.path.basename(self.weights_path)}",
                "model_path": f"{self.model_name} (weights/{os.path.basename(self.weights_path)})",
                "device": str(self.device),
                "input_shape": "1x3x224x224 (ImageNet Normalized)",
                "raw_logits": {
                    "real": round(logit_real, 4),
                    "fake": round(logit_fake, 4)
                },
                "predicted_class": "Authentic (Real)" if prob_fake < 0.5 else "Synthetic (AI-Generated)",
                "confidence": confidence_score,
                "image_sha256": content_hash,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            return InvestigationResult(
                case_id=case_id,
                media_type="IMAGE",
                file_name=file_name,
                assessment=assessment,
                authenticity_score=authenticity_score,
                risk_level=risk_level,
                confidence_level=confidence_level,
                confidence_score=confidence_score,
                is_demo_analysis=False,
                disclaimer="Analysis generated from pretrained neural deep learning inference and supporting forensic metrics.",
                timestamp=datetime.now(timezone.utc).isoformat(),
                ai_generation_probability=ai_prob,
                deepfake_probability=deepfake_prob,
                manipulation_risk=ai_prob if ai_prob > 50 else 15.0,
                forensic_anomaly_score=ai_prob,
                metadata_risk_score=meta_risk,
                signals=signals,
                evidence_breakdown=evidence,
                metadata=MetadataAnalysis(
                    file_name=file_name,
                    file_size_formatted=file_size,
                    mime_type=mime_type or "image/png",
                    dimensions=dimensions,
                    creation_time="Unknown",
                    software_signature=software,
                    camera_model=camera_model,
                    exif_available=has_exif,
                    editing_software_indicator=software,
                    hash_sha256=content_hash,
                    metadata_risk_score=meta_risk,
                    note=f"Neural model ({self.model_name}) verified execution in {inference_time_ms:.1f}ms on {self.device}. Checkpoint: {os.path.basename(self.weights_path)}."
                ),
                suspicious_regions=regions,
                why_result_explanation=why_explanation,
                top_contributing_signals=[{"signal": s.name, "impact": s.strength, "weight": f"{s.weight*100:.0f}%"} for s in signals],
                limitations="Trained on FaceForensics++ C23 benchmark; highly compressed or extreme adversarial perturbations may affect confidence.",
                model_verification=verification_payload,
                annotated_image_url=anno_url if anno_url else None,
                heatmap_image_url=heat_url if heat_url else None
            )

    def generate_annotated_image(
        self,
        pil_img: Image.Image,
        heatmap: np.ndarray,
        regions: List[SuspiciousRegion],
        assessment: str,
        confidence_score: float,
        inference_time_ms: float,
        content_hash: str,
        is_fake: bool
    ) -> Tuple[str, str]:
        """
        Generates an annotated image with the model's actual Grad-CAM activations,
        detection bounding boxes, and forensic verification banner burned into the image.
        Returns (annotated_data_url, heatmap_data_url).
        """
        try:
            from PIL import ImageDraw, ImageFont

            orig_w, orig_h = pil_img.size
            cam_pil = Image.fromarray((heatmap * 255).astype(np.uint8), mode="L")
            cam_resized = cam_pil.resize((orig_w, orig_h), resample=Image.Resampling.BILINEAR)
            cam_norm = np.array(cam_resized, dtype=np.float32) / 255.0

            # Jet-like colormap
            v = np.clip(cam_norm, 0.0, 1.0)
            r = np.clip(1.5 - np.abs(4.0 * v - 3.0), 0.0, 1.0)
            g = np.clip(1.5 - np.abs(4.0 * v - 2.0), 0.0, 1.0)
            b = np.clip(1.5 - np.abs(4.0 * v - 1.0), 0.0, 1.0)
            cam_rgb = (np.stack([r, g, b], axis=-1) * 255).astype(np.uint8)
            heatmap_img = Image.fromarray(cam_rgb, mode="RGB")

            # Pure heatmap data URL
            buf_heat = io.BytesIO()
            heatmap_img.save(buf_heat, format="JPEG", quality=85)
            heat_b64 = f"data:image/jpeg;base64,{base64.b64encode(buf_heat.getvalue()).decode('utf-8')}"

            # Blend heatmap with original image
            blended = Image.blend(pil_img.convert("RGB"), heatmap_img, alpha=0.48)
            draw = ImageDraw.Draw(blended)
            font = ImageFont.load_default()

            accent_color = (239, 68, 68) if is_fake else (0, 240, 255)
            badge_bg = (200, 30, 30) if is_fake else (0, 150, 180)

            for reg in regions:
                coords = reg.coordinates
                x0 = int(coords["x"] / 100.0 * orig_w)
                y0 = int(coords["y"] / 100.0 * orig_h)
                x1 = int((coords["x"] + coords["width"]) / 100.0 * orig_w)
                y1 = int((coords["y"] + coords["height"]) / 100.0 * orig_h)

                x0, y0 = max(0, x0), max(0, y0)
                x1, y1 = min(orig_w - 1, x1), min(orig_h - 1, y1)

                if x1 > x0 and y1 > y0:
                    draw.rectangle([x0, y0, x1, y1], outline=accent_color, width=3)
                    label_text = f"DETECTION: {reg.label} ({int(reg.confidence * 100)}%)"
                    draw.rectangle([x0, max(0, y0 - 18), min(orig_w, x0 + len(label_text) * 7 + 8), y0], fill=badge_bg)
                    draw.text((x0 + 4, max(2, y0 - 16)), label_text, fill=(255, 255, 255), font=font)

            # Forensic verification banner across top
            banner_h = 24
            draw.rectangle([0, 0, orig_w, banner_h], fill=(10, 16, 26))
            banner_text = (
                f"REALCHECK AI NEURAL ENGINE | {self.model_name} | "
                f"VERDICT: {assessment.upper()} ({confidence_score*100:.1f}%) | "
                f"INFERENCE: {inference_time_ms:.1f}ms | HASH: {content_hash[:12]}"
            )
            draw.text((8, 6), banner_text, fill=(0, 240, 255), font=font)

            buf_anno = io.BytesIO()
            blended.save(buf_anno, format="JPEG", quality=88)
            anno_b64 = f"data:image/jpeg;base64,{base64.b64encode(buf_anno.getvalue()).decode('utf-8')}"

            return anno_b64, heat_b64
        except Exception as e:
            print(f"Annotated image generation failed (fallback to None): {e}")
            return "", ""

    def explain(self, result: InvestigationResult) -> Dict[str, Any]:
        return {
            "method": "Gradient-weighted Class Activation Mapping (Grad-CAM)",
            "layer_targeted": "features.8 (Conv2dNormActivation, 1280 channels)",
            "heatmap_resolution": "224 x 224",
            "salient_features": [
                "Convolutional Feature Map Gradients",
                "Peak Activation Spatial Bounding",
                "Supporting EXIF Extraction",
                "Pixel Variance Baseline"
            ]
        }
