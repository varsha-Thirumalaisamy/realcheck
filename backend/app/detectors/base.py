"""
Base Detector Interface for RealCheck AI
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..schemas.forensics import InvestigationResult

class BaseDetector(ABC):
    """
    Standard interface for all specialized forensic engines.
    Actual deep learning models (PyTorch / ONNX / TensorRT / HuggingFace)
    subclass this interface and adhere to the unified output structure.
    """
    def __init__(self, model_name: str, model_version: str, input_type: str):
        self.model_name = model_name
        self.model_version = model_version
        self.input_type = input_type
        self.is_active = True

    @abstractmethod
    def analyze(self, file_path_or_content: Any, metadata: Optional[Dict[str, Any]] = None) -> InvestigationResult:
        """Execute forensic extraction, inference, and evidence generation."""
        pass

    @abstractmethod
    def explain(self, result: InvestigationResult) -> Dict[str, Any]:
        """Generate explainable AI artifacts (Grad-CAM, token attributions, spectrogram highlights)."""
        pass
