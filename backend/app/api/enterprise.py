import time
import uuid
import tempfile
import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from ..forensics.c2pa_verifier import C2PAVerifier
from ..core.batch_worker import process_batch_task
from ..core.database import get_db
from ..models.job import Batch, Job

router = APIRouter(prefix="/enterprise", tags=["Enterprise API"])

# Enterprise Security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_api_key(api_key: str = Depends(api_key_header)):
    # Simple static API key for demonstration
    if api_key != "rc_ent_2026_secure":
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return api_key

@router.post("/c2pa/verify")
async def verify_c2pa(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
):
    """
    High-speed endpoint dedicated to extracting and verifying C2PA manifests.
    """
    start_time = time.time()
    req_id = f"req_{uuid.uuid4().hex[:8]}"
    
    # Safe temporary file handling
    fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
    try:
        with os.fdopen(fd, 'wb') as f:
            content = await file.read()
            f.write(content)
            
        # Verify C2PA
        c2pa_result = C2PAVerifier.verify(tmp_path, file.filename)
        
        c2pa_result["request_id"] = req_id
        c2pa_result["processing_time_ms"] = round((time.time() - start_time) * 1000, 2)
        
        return c2pa_result
        
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/batch/analyze")
async def batch_analyze(
    files: List[UploadFile] = File(None),
    texts: List[str] = Form(None),
    api_key: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    High-throughput batch endpoint accepting multiple files.
    """
    if not files and not texts:
        raise HTTPException(status_code=400, detail="No files or texts provided")
        
    total_items = (len(files) if files else 0) + (len(texts) if texts else 0)
    if total_items > 50:
        raise HTTPException(status_code=413, detail="Batch size exceeds limit of 50 items")
        
    batch_id = f"batch_{uuid.uuid4().hex[:8]}"
    db_batch = Batch(id=batch_id, status="QUEUED")
    db.add(db_batch)
    
    jobs_data = []
    
    # Queue files
    if files:
        for file in files:
            fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
            with os.fdopen(fd, 'wb') as f:
                f.write(await file.read())
            
            ext = os.path.splitext(file.filename)[1].lower()
            media_type = "IMAGE"
            if ext in ['.mp4', '.mov', '.avi']:
                media_type = "VIDEO"
            elif ext in ['.wav', '.mp3']:
                media_type = "AUDIO"
                
            job_id = f"job_{uuid.uuid4().hex[:8]}"
            jobs_data.append({
                "job_id": job_id,
                "media_type": media_type,
                "file_path": tmp_path,
                "metadata": {"file_name": file.filename}
            })
            db.add(Job(id=job_id, batch_id=batch_id, media_type=media_type, status="QUEUED"))
            
    # Queue texts
    if texts:
        for text in texts:
            job_id = f"job_{uuid.uuid4().hex[:8]}"
            jobs_data.append({
                "job_id": job_id,
                "media_type": "TEXT",
                "text_content": text,
                "file_path": None,
                "metadata": {"file_name": "batch_text.txt"}
            })
            db.add(Job(id=job_id, batch_id=batch_id, media_type="TEXT", status="QUEUED"))
            
    db.commit()
    
    # Schedule processing in Celery
    process_batch_task.delay(batch_id, jobs_data)
    
    return {
        "batch_id": batch_id,
        "status": "QUEUED",
        "jobs": [{"job_id": j["job_id"], "media_type": j["media_type"], "status": "QUEUED"} for j in jobs_data]
    }

@router.get("/batch/{batch_id}")
async def get_batch_status(
    batch_id: str,
    api_key: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {
        "batch_id": batch.id,
        "status": batch.status,
        "jobs": [
            {
                "job_id": j.id,
                "status": j.status,
                "result_id": j.result_id,
                "error": j.error
            } for j in batch.jobs
        ]
    }
