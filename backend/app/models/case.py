import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="OPEN")
    
    owner_id = Column(String, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", backref="cases")
    media_files = relationship("MediaFile", back_populates="case", cascade="all, delete-orphan")
