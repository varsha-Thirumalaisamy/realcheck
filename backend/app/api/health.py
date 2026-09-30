from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["System"])

@router.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "REALCHECK AI Forensic Platform",
        "timestamp": datetime.utcnow().isoformat(),
        "active_engines": ["IMAGE", "VIDEO", "AUDIO", "TEXT", "EVIDENCE_FUSION", "EXPLAINABLE_AI"]
    }

@router.get("/models")
def get_model_insights():
    return {
        "models": [
            {
                "id": "model-img-01",
                "name": "Vision Transformer + Spectral ResNet",
                "type": "CNN + ViT Hybrid",
                "input_type": "IMAGE",
                "version": "v1.0.4-forensic",
                "status": "Active",
                "training_status": "Fine-tuned on GenImage & FaceForensics++",
                "confidence_avg": "92.4%",
                "inference_time": "142 ms",
                "features": ["Fourier artifacts", "PRNU sensor correlation", "Demosaicing covariance", "Facial gradient continuity"]
            },
            {
                "id": "model-vid-01",
                "name": "Spatial-Temporal CNN + Landmark RNN",
                "type": "3D-CNN + Temporal GRU",
                "input_type": "VIDEO",
                "version": "v1.0.2-temporal",
                "status": "Active",
                "training_status": "Trained on DFDC & Celeb-DF v2",
                "confidence_avg": "89.8%",
                "inference_time": "420 ms / 10s",
                "features": ["Optical flow landmark stability", "Lip-sync viseme alignment", "Blink dynamics", "Boundary seam blending"]
            },
            {
                "id": "model-aud-01",
                "name": "Spectrogram CNN + Wav2Vec2 Acoustic Classifier",
                "type": "Acoustic Transformer",
                "input_type": "AUDIO",
                "version": "v1.0.1-acoustic",
                "status": "Active",
                "training_status": "Trained on ASVspoof 2021 & In-The-Wild Deepfake Voice",
                "confidence_avg": "91.1%",
                "inference_time": "88 ms",
                "features": ["Formant trajectory continuity", "Pitch micro-jitter detection", "Breath inhalation presence", "High-frequency vocoder phase"]
            },
            {
                "id": "model-txt-01",
                "name": "Transformer Encoders + Stylometric Profiler",
                "type": "Stylometric NLP Transformer",
                "input_type": "TEXT",
                "version": "v1.0.3-nlp",
                "status": "Active",
                "training_status": "Calibrated on RAID & MGTBench",
                "confidence_avg": "84.5%",
                "inference_time": "45 ms",
                "features": ["Sentence burstiness", "Token perplexity entropy", "Discourse transition repetitiveness", "Lexical variance"]
            }
        ]
    }
