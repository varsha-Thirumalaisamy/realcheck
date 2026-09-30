import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Investigation(Base):
    """
    Production SQLAlchemy model for persistent forensic cases.
    Replaces the mock in-memory INVESTIGATIONS_DB.
    """
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, unique=True, index=True, nullable=False)
    
    # Optional mapping to the parent Case umbrella if applicable
    parent_case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    
    media_type = Column(String, nullable=False)  # 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'
    file_name = Column(String, nullable=False)
    
    assessment = Column(String, nullable=False)
    authenticity_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence_level = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    is_demo_analysis = Column(Boolean, default=False)
    disclaimer = Column(String, nullable=True)
    
    # Probability matrix
    ai_generation_probability = Column(Float, nullable=False)
    manipulation_risk = Column(Float, nullable=False)
    forensic_anomaly_score = Column(Float, nullable=False)
    metadata_risk_score = Column(Float, nullable=False)
    
    # JSON mapped complex structures
    signals = Column(JSON, default=list)
    evidence_breakdown = Column(JSON, default=list)
    metadata_analysis = Column(JSON, default=dict)
    
    suspicious_regions = Column(JSON, nullable=True)
    suspicious_segments = Column(JSON, nullable=True)
    text_metrics = Column(JSON, nullable=True)
    heatmap_data = Column(JSON, nullable=True)
    
    # Textual explanations
    why_result_explanation = Column(String, nullable=True)
    top_contributing_signals = Column(JSON, default=list)
    limitations = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
