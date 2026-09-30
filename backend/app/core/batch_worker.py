import os
from typing import Dict, Any, List
from .celery_app import celery_app
from .database import SessionLocal
from ..models.job import Batch, Job

@celery_app.task(name="app.core.batch_worker.process_batch_task")
def process_batch_task(batch_id: str, jobs_data: List[Dict[str, Any]]):
    db = SessionLocal()
    try:
        # Mark batch as PROCESSING
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            return
        
        batch.status = "PROCESSING"
        db.commit()
        
        for job_data in jobs_data:
            job_id = job_data["job_id"]
            db_job = db.query(Job).filter(Job.id == job_id).first()
            if not db_job:
                continue
                
            db_job.status = "PROCESSING"
            db.commit()
            
            media_type = job_data["media_type"].upper()
            file_path = job_data.get("file_path")
            metadata = job_data.get("metadata", {})
            
            result = None
            try:
                from ..api.analysis import img_detector, vid_detector, aud_detector, txt_detector
                if media_type == "IMAGE":
                    result = img_detector.analyze(file_path, metadata)
                elif media_type == "VIDEO":
                    result = vid_detector.analyze(file_path, metadata)
                elif media_type == "AUDIO":
                    result = aud_detector.analyze(file_path, metadata)
                elif media_type == "TEXT":
                    result = txt_detector.analyze(job_data.get("text_content"), metadata)
                
                if result:
                    from ..api.analysis import save_investigation_to_db
                    save_investigation_to_db(result, db)
                    db_job.status = "COMPLETED"
                    db_job.result_id = result.case_id
                else:
                    db_job.status = "FAILED"
                    db_job.error = "Detector returned no result"
            except Exception as e:
                db_job.status = "FAILED"
                db_job.error = str(e)
            finally:
                db.commit()
                # Cleanup temporary file if present
                if file_path and os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
        
        # Check if all jobs are done
        batch.status = "COMPLETED"
        db.commit()
    finally:
        db.close()
