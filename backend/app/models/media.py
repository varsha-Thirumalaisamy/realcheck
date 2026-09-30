import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    storage_path = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", back_populates="media_files")
