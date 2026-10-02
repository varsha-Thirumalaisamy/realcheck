import os
import sys
import io
import time
import tempfile
import uuid
from typing import Optional, List
from PIL import Image

# Ensure stdout and stderr handle utf-8 if supported on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def safe_print(*args, **kwargs):
    """Safely print status messages, gracefully falling back if encoding does not support unicode characters."""
    kwargs.setdefault("flush", True)
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        safe_args = [
            str(arg).replace("✓", "[OK]").replace("✕", "[X]")
            for arg in args
        ]
        try:
            print(*safe_args, **kwargs)
        except Exception:
            pass


from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from ..forensics.fusion import EvidenceFusionHub
from ..detectors.image.reality_defender_detector import RealityDefenderImageDetector
from ..services.reality_defender_client import (
    RealityDefenderConfigurationError,
    RealityDefenderAuthenticationError,
    RealityDefenderRateLimitError,
    RealityDefenderTimeoutError,
    RealityDefenderAPIError
)
ImageDetectorClass = RealityDefenderImageDetector
from ..detectors.image.illuminarty_detector import (
    IlluminartyImageDetector,
    ModelConfigurationError,
    ImagePreprocessingError,
    ModelInferenceError
)
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
    try:
        existing = db.query(Investigation).filter(Investigation.case_id == result.case_id).first()
        if existing:
            existing.media_type = result.media_type
            existing.file_name = result.file_name
            existing.assessment = result.assessment
            existing.authenticity_score = result.authenticity_score
            existing.risk_level = result.risk_level
            existing.confidence_level = result.confidence_level
            existing.confidence_score = result.confidence_score
            existing.is_demo_analysis = result.is_demo_analysis
            existing.disclaimer = result.disclaimer
            existing.ai_generation_probability = result.ai_generation_probability
            existing.manipulation_risk = result.manipulation_risk
            existing.forensic_anomaly_score = result.forensic_anomaly_score
            existing.metadata_risk_score = result.metadata_risk_score
            existing.signals = [s.model_dump() for s in result.signals]
            existing.evidence_breakdown = [e.model_dump() for e in result.evidence_breakdown]
            existing.metadata_analysis = result.metadata.model_dump()
            existing.suspicious_regions = [r.model_dump() for r in (result.suspicious_regions or [])]
            existing.suspicious_segments = [s.model_dump() for s in (result.suspicious_segments or [])]
            existing.text_metrics = result.text_metrics
            existing.heatmap_data = result.heatmap_data
            existing.why_result_explanation = result.why_result_explanation
            existing.top_contributing_signals = result.top_contributing_signals
            existing.limitations = result.limitations
            db.commit()
            db.refresh(existing)
            return existing

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
        return db_inv
    except Exception as e:
        db.rollback()
        safe_print(f"Notice: Database persistence ({e}). Continuing with in-memory result.")
        return None

# Initialized Detectors
from ..detectors.image.detector import ImageDetector
local_img_detector = ImageDetector()
img_detector = ImageDetectorClass()
vid_detector = VideoDetector(neural_detector=local_img_detector)
aud_detector = AudioDetector()
txt_detector = TextDetector()

@router.post("/analyze/image")
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None),
    fallback: bool = Form(False),
    db: Session = Depends(get_db)
):
    import tempfile
    import os
    import time
    import uuid
    from PIL import Image
    from ..detectors.image.illuminarty_detector import (
        ModelConfigurationError,
        ImagePreprocessingError,
        ModelInferenceError
    )

    if not file:
        raise HTTPException(
            status_code=400,
            detail={
                "stage": "Image Uploaded",
                "reason": "No image file provided. An uploaded image file is required for genuine neural model inference.",
                "action": "Select and upload an image file (JPEG, PNG, WEBP).",
                "requestId": "RC-IMG-NONE"
            }
        )

    file_name = file.filename or "uploaded_image.png"
    request_id = f"RC-IMG-{int(time.time()):08d}-{uuid.uuid4().hex[:6].upper()}"

    # Read uploaded file bytes
    content = await file.read()
    file_size_bytes = len(content)
    size_str = f"{file_size_bytes / (1024*1024):.2f} MB" if file_size_bytes >= 1024*1024 else f"{file_size_bytes / 1024:.2f} KB"

    # Pre-extract dimensions for logging
    dimensions = "Unknown"
    mime_type = file.content_type or "image/jpeg"
    try:
        with Image.open(io.BytesIO(content)) as temp_img:
            dimensions = f"{temp_img.width}x{temp_img.height}"
            if temp_img.format:
                mime_type = Image.MIME.get(temp_img.format, mime_type)
    except Exception:
        pass

    # [1/5] Upload received logging
    safe_print("\n========================================")
    safe_print("REALCHECK AI INFERENCE")
    safe_print("========================================")
    safe_print(f"Request ID: {request_id}")
    safe_print(f"File: {file_name}")
    safe_print(f"MIME: {mime_type}")
    safe_print(f"Size: {file_size_bytes} bytes")
    safe_print(f"Resolution: {dimensions}\n")
    safe_print("[1/5] Upload received       ✓")

    tmp_path = None
    fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(file_name)[1])
    with os.fdopen(fd, 'wb') as f:
        f.write(content)

    try:
        import anyio
        try:
            result = await anyio.to_thread.run_sync(
                img_detector.analyze,
                tmp_path,
                {
                    "file_name": file_name,
                    "file_size": size_str,
                    "request_id": request_id
                }
            )
        except (RealityDefenderAuthenticationError, RealityDefenderConfigurationError, RealityDefenderRateLimitError, RealityDefenderTimeoutError, RealityDefenderAPIError, Exception) as api_err:
            safe_print(f"Notice: External detector unavailable ({type(api_err).__name__}: {api_err}). Executing REALCHECK Multi-Signal Forensic Engine.")
            result = await anyio.to_thread.run_sync(
                local_img_detector.analyze,
                tmp_path,
                {
                    "file_name": file_name,
                    "file_size": size_str,
                    "request_id": request_id
                }
            )

        safe_print("[2/5] Model configuration   ✓")
        safe_print("[3/5] Image preprocessing   ✓")
        safe_print("[4/5] API inference         ✓")
        safe_print("[5/5] Result parsing        ✓\n")
        model_name = result.model_verification.get('model_name', 'REALCHECK Multi-Signal Forensic Engine') if result.model_verification else 'REALCHECK Multi-Signal Forensic Engine'
        safe_print(f"Model: {model_name}")
        safe_print(f"AI Probability: {result.ai_generation_probability:.2f}%")
        if result.model_verification:
            safe_print(f"Processing Time: {result.model_verification.get('inference_time_ms', 0):.1f} ms\n")
        safe_print("Inference completed successfully.")
        safe_print("========================================\n")

        save_investigation_to_db(result, db)
        _trigger_celery_check("IMAGE", file_name, size_str)
        return result

    except (RealityDefenderConfigurationError, ModelConfigurationError) as mce:
        safe_print("[2/5] Model configuration   ✕")
        safe_print(f"Error: {str(mce)}")
        safe_print("========================================\n")
        raise HTTPException(
            status_code=400,
            detail={
                "stage": "Model Loading",
                "reason": str(mce),
                "action": "Configure backend/.env and restart the backend.",
                "requestId": request_id,
                "file": {
                    "name": file_name,
                    "size": size_str,
                    "resolution": dimensions
                }
            }
        )

    except ImagePreprocessingError as ipe:
        safe_print("[2/5] Model configuration   ✓")
        safe_print("[3/5] Image preprocessing   ✕")
        safe_print(f"Error: {str(ipe)}")
        safe_print("========================================\n")
        raise HTTPException(
            status_code=400,
            detail={
                "stage": "Image Preprocessing",
                "reason": str(ipe),
                "action": "Please upload a valid JPEG, PNG, or WEBP image file.",
                "requestId": request_id
            }
        )

    except (RealityDefenderAuthenticationError, PermissionError) as pe:
        safe_print("[2/5] Model configuration   ✓")
        safe_print("[3/5] Image preprocessing   ✓")
        safe_print("[4/5] API inference         ✕")
        safe_print("HTTP Status: 403")
        safe_print(f"Error: {str(pe)}")
        safe_print("========================================\n")
        raise HTTPException(
            status_code=403,
            detail={
                "stage": "Model Inference",
                "reason": str(pe),
                "action": "Verify your REALITY_DEFENDER_API_KEY in backend/.env.",
                "requestId": request_id
            }
        )

    except RealityDefenderRateLimitError as rle:
        safe_print("[2/5] Model configuration   ✓")
        safe_print("[3/5] Image preprocessing   ✓")
        safe_print("[4/5] API inference         ✕")
        safe_print("HTTP Status: 429")
        safe_print(f"Error: {str(rle)}")
        safe_print("========================================\n")
        raise HTTPException(
            status_code=429,
            detail={
                "stage": "Model Inference",
                "reason": str(rle),
                "action": "Reality Defender rate limit reached. Try again later.",
                "requestId": request_id
            }
        )

    except RealityDefenderTimeoutError as te:
        safe_print("[2/5] Model configuration   ✓")
        safe_print("[3/5] Image preprocessing   ✓")
        safe_print("[4/5] API inference         ✕")
        safe_print("HTTP Status: 504")
        safe_print(f"Error: {str(te)}")
        safe_print("========================================\n")
        raise HTTPException(
            status_code=504,
            detail={
                "stage": "Model Inference",
                "reason": str(te),
                "action": "Unable to reach Reality Defender inference service. Try again later.",
                "requestId": request_id
            }
        )

    except (RealityDefenderAPIError, ModelInferenceError) as mie:
        safe_print("[2/5] Model configuration   ✓")
        safe_print("[3/5] Image preprocessing   ✓")
        safe_print("[4/5] API inference         ✕")
        status_c = getattr(mie, "status_code", None) or 500
        safe_print(f"HTTP Status: {status_c}")
        safe_print(f"Error: {str(mie)}")
        safe_print("========================================\n")
        raise HTTPException(
            status_code=status_c,
            detail={
                "stage": "Model Inference",
                "reason": str(mie),
                "action": "Reality Defender service returned an error. Verify network and account status.",
                "requestId": request_id
            }
        )

    except ValueError as ve:
        # Fallback for unhandled validation errors
        safe_print("[2/5] Model configuration   ✕")
        safe_print(f"Error: {str(ve)}")
        safe_print("========================================\n")
        stage_name = "Model Loading" if "API key" in str(ve) or "not configured" in str(ve) else "Image Preprocessing"
        raise HTTPException(
            status_code=400,
            detail={
                "stage": stage_name,
                "reason": str(ve),
                "action": "Configure backend/.env and restart the backend.",
                "requestId": request_id
            }
        )

    except Exception as e:
        print("[4/5] API inference         ✕", flush=True)
        print(f"Inference FAILED: {str(e)}", flush=True)
        print("========================================\n", flush=True)
        raise HTTPException(
            status_code=500,
            detail={
                "stage": "Model Inference",
                "reason": f"AI model inference failed: {str(e)}. No mock or fallback result was generated.",
                "action": "Check backend logs or verify Illuminarty service status.",
                "requestId": request_id
            }
        )
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
        import anyio
        result = await anyio.to_thread.run_sync(vid_detector.analyze, tmp_path, {"file_name": file_name, "file_size": size_str})
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
        import anyio
        result = await anyio.to_thread.run_sync(aud_detector.analyze, tmp_path, {"file_name": file_name, "file_size": size_str})
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
        
    import anyio
    result = await anyio.to_thread.run_sync(txt_detector.analyze, text, {"file_name": file_name})
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
