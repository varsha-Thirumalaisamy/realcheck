from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="QUEUED")
    
    jobs = relationship("Job", back_populates="batch", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, index=True)
    batch_id = Column(String, ForeignKey("batches.id"))
    media_type = Column(String)
    status = Column(String, default="QUEUED")
    result_id = Column(String, nullable=True)
    error = Column(Text, nullable=True)
    
    batch = relationship("Batch", back_populates="jobs")
