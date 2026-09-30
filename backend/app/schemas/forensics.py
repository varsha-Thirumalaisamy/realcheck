"""
Pydantic Schemas for RealCheck AI Forensic Platform
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ForensicSignal(BaseModel):
    name: str
    category: str  # e.g., 'texture', 'frequency', 'temporal', 'metadata', 'acoustic', 'stylometric'
    score: float   # 0 to 100 anomaly / suspicion score
    weight: float  # contribution weight in fusion
    strength: str  # 'Strong', 'Moderate', 'Weak', 'Normal'
    status: str    # 'Anomaly Detected', 'Suspicious Pattern', 'Within Normal Variance', 'Inconclusive'
    explanation: str
    affected_region_or_time: Optional[str] = None
    model_contribution_pct: float

class SuspiciousRegion(BaseModel):
    id: str
    label: str    # e.g., 'FACE REGION', 'HAIR BOUNDARY', 'BACKGROUND', 'OBJECT EDGE'
    confidence: float
    coordinates: Dict[str, float]  # x, y, width, height in %
    anomaly_type: str
    explanation: str

class SuspiciousTimeSegment(BaseModel):
    start_time: str
    end_time: str
    start_seconds: float
    end_seconds: float
    risk_level: str  # 'High', 'Amber', 'Normal'
    anomaly_type: str
    description: str

class MetadataAnalysis(BaseModel):
    file_name: str
    file_size_formatted: str
    mime_type: str
    dimensions: Optional[str] = None
    duration: Optional[str] = None
    creation_time: Optional[str] = None
    software_signature: Optional[str] = None
    camera_model: Optional[str] = None
    exif_available: bool = False
    editing_software_indicator: Optional[str] = None
    hash_sha256: str
    metadata_risk_score: float
    note: str = "Metadata is supporting evidence only and can be altered or removed."

class EvidenceCard(BaseModel):
    title: str
    status: str
    score: float
    risk: str  # 'High Risk', 'Medium Risk', 'Low Risk', 'Uncertain'
    explanation: str
    category: str

class InvestigationResult(BaseModel):
    case_id: str
    media_type: str  # 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'
    file_name: str
    assessment: str  # 'Likely Authentic', 'Likely AI-Generated', 'Likely AI-Assisted', 'Likely AI-Manipulated', 'Likely Manipulated', 'Uncertain / Mixed Evidence'
    authenticity_score: int  # 0 to 100 (0-30 High Risk, 31-60 Medium Risk, 61-100 Lower Risk)
    risk_level: str  # 'High Risk', 'Medium Risk', 'Low Risk', 'Uncertain'
    confidence_level: str  # 'High', 'Moderate', 'Low'
    confidence_score: float  # 0.0 to 1.0
    is_demo_analysis: bool = True
    disclaimer: str = "Prototype / Demonstration Analysis. Results are probabilistic forensic indicators, not absolute proof."
    timestamp: str

    # Probability matrix
    ai_generation_probability: float
    deepfake_probability: Optional[float] = None
    manipulation_risk: float
    forensic_anomaly_score: float
    metadata_risk_score: float

    # Detailed signals & breakdown
    signals: List[ForensicSignal]
    evidence_breakdown: List[EvidenceCard]
    metadata: MetadataAnalysis

    # Media specific details
    suspicious_regions: Optional[List[SuspiciousRegion]] = None
    suspicious_segments: Optional[List[SuspiciousTimeSegment]] = None
    text_metrics: Optional[Dict[str, Any]] = None
    heatmap_data: Optional[Dict[str, Any]] = None

    # Why did the model focus here & interpretation
    why_result_explanation: str
    top_contributing_signals: List[Dict[str, Any]]
    limitations: str
