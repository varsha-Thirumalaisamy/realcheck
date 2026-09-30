from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from ..forensics.fusion import EvidenceFusionHub
from ..detectors.image.detector import ImageDetector
from ..detectors.video.detector import VideoDetector
from ..detectors.audio.detector import AudioDetector
from ..detectors.text.detector import TextDetector
from ..core.batch_worker import process_batch_task
from ..core.database import SessionLocal, get_db
from ..models.job import Batch, Job
from ..models.investigation import Investigation
from ..schemas.forensics import InvestigationResult

router = APIRouter(tags=["Analysis"])

def save_investigation_to_db(result: InvestigationResult, db: Session):
    db_inv = Investigation(
        case_id=result.case_id,
        media_type=result.media_type,
        file_name=result.file_name,
        assessment=result.assessment,
        authenticity_score=result.authenticity_score,
        risk_level=result.risk_level,
        confidence_level=result.confidence_level,
        confidence_score=result.confidence_score,
        is_demo_analysis=result.is_demo_analysis,
        disclaimer=result.disclaimer,
        ai_generation_probability=result.ai_generation_probability,
        manipulation_risk=result.manipulation_risk,
        forensic_anomaly_score=result.forensic_anomaly_score,
        metadata_risk_score=result.metadata_risk_score,
        signals=[s.model_dump() for s in result.signals],
        evidence_breakdown=[e.model_dump() for e in result.evidence_breakdown],
        metadata_analysis=result.metadata.model_dump(),
        suspicious_regions=[r.model_dump() for r in (result.suspicious_regions or [])],
        suspicious_segments=[s.model_dump() for s in (result.suspicious_segments or [])],
        text_metrics=result.text_metrics,
        heatmap_data=result.heatmap_data,
        why_result_explanation=result.why_result_explanation,
        top_contributing_signals=result.top_contributing_signals,
        limitations=result.limitations
    )
    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)

# Initialized Detectors
img_detector = ImageDetector()
vid_detector = VideoDetector()
aud_detector = AudioDetector()
txt_detector = TextDetector()

@router.post("/analyze/image")
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if sample_id:
        existing = db.query(Investigation).filter(Investigation.case_id == sample_id).first()
        if existing:
            from .cases import db_model_to_pydantic
            return db_model_to_pydantic(existing)
        
    import tempfile
    import os
    
    file_name = file.filename if file else "uploaded_image.png"
    size_str = f"{file.size / (1024*1024):.1f} MB" if file and file.size else "2.1 MB"
    
    tmp_path = None
    if file:
        fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(file_name)[1])
        with os.fdopen(fd, 'wb') as f:
            content = await file.read()
            f.write(content)
            
    try:
        result = img_detector.analyze(tmp_path, {"file_name": file_name, "file_size": size_str})
        
        save_investigation_to_db(result, db)
        
        _trigger_celery_check("IMAGE", file_name, size_str)
        
        return result
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/analyze/video")
async def analyze_video(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if sample_id:
        existing = db.query(Investigation).filter(Investigation.case_id == sample_id).first()
        if existing:
            from .cases import db_model_to_pydantic
            return db_model_to_pydantic(existing)
        
    import tempfile
    import os
    
    file_name = file.filename if file else "uploaded_video.mp4"
    size_str = f"{file.size / (1024*1024):.1f} MB" if file and file.size else "14.2 MB"
    
    tmp_path = None
    if file:
        fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(file_name)[1])
        with os.fdopen(fd, 'wb') as f:
            content = await file.read()
            f.write(content)
            
    try:
        result = vid_detector.analyze(tmp_path, {"file_name": file_name, "file_size": size_str})
        save_investigation_to_db(result, db)
        
        _trigger_celery_check("VIDEO", file_name, size_str)
        
        return result
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/analyze/audio")
async def analyze_audio(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if sample_id:
        existing = db.query(Investigation).filter(Investigation.case_id == sample_id).first()
        if existing:
            from .cases import db_model_to_pydantic
            return db_model_to_pydantic(existing)
        
    import tempfile
    import os
    
    file_name = file.filename if file else "uploaded_audio.wav"
    size_str = f"{file.size / (1024*1024):.1f} MB" if file and file.size else "4.8 MB"
    
    tmp_path = None
    if file:
        fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(file_name)[1])
        with os.fdopen(fd, 'wb') as f:
            content = await file.read()
            f.write(content)
            
    try:
        result = aud_detector.analyze(tmp_path, {"file_name": file_name, "file_size": size_str})
        save_investigation_to_db(result, db)
        _trigger_celery_check("AUDIO", file_name, size_str)
        return result
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/analyze/text")
async def analyze_text(
    text: str = Form(...),
    file_name: Optional[str] = Form("analyzed_document.txt"),
    sample_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if sample_id:
        existing = db.query(Investigation).filter(Investigation.case_id == sample_id).first()
        if existing:
            from .cases import db_model_to_pydantic
            return db_model_to_pydantic(existing)
        
    result = txt_detector.analyze(text, {"file_name": file_name})
    save_investigation_to_db(result, db)
    _trigger_celery_check("TEXT", file_name, "0.1 MB", text)
    return result

@router.post("/investigations/fuse")
def fuse_cases(case_ids: List[str], db: Session = Depends(get_db)):
    from .cases import db_model_to_pydantic
    db_items = db.query(Investigation).filter(Investigation.case_id.in_(case_ids)).all()
    items = [db_model_to_pydantic(item) for item in db_items]
    if not items:
        raise HTTPException(status_code=400, detail="No valid case IDs found for fusion")
    return EvidenceFusionHub.fuse_investigations(items)

def _trigger_celery_check(media_type: str, file_name: str, size_str: str, text_content: str = None):
    # Bypass celery since no broker is running locally
    return
    try:
        batch_id = str(uuid.uuid4())
        job_id = str(uuid.uuid4())
        
        batch = Batch(id=batch_id, status="PENDING")
        db.add(batch)
        job = Job(id=job_id, batch_id=batch_id, status="PENDING")
        db.add(job)
        db.commit()
        
        jobs_data = [{
            "job_id": job_id,
            "media_type": media_type,
            "file_path": None,
            "text_content": text_content,
            "metadata": {"file_name": file_name, "file_size": size_str, "verification_only": True}
        }]
        process_batch_task.delay(batch_id, jobs_data)
    except Exception as e:
        print(f"Failed to trigger Celery task: {e}")
    finally:
        if 'db' in locals():
            db.close()
