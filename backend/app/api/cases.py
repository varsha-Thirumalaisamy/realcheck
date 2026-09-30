import json
from fastapi import APIRouter, HTTPException, Response, Depends
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..models.investigation import Investigation
from ..reports.generator import ForensicReportGenerator
from ..schemas.forensics import InvestigationResult

router = APIRouter(prefix="/investigations", tags=["Cases"])

def db_model_to_pydantic(db_inv: Investigation) -> InvestigationResult:
    return InvestigationResult(
        case_id=db_inv.case_id,
        media_type=db_inv.media_type,
        file_name=db_inv.file_name,
        assessment=db_inv.assessment,
        authenticity_score=db_inv.authenticity_score,
        risk_level=db_inv.risk_level,
        confidence_level=db_inv.confidence_level,
        confidence_score=db_inv.confidence_score,
        is_demo_analysis=db_inv.is_demo_analysis,
        disclaimer=db_inv.disclaimer,
        timestamp=db_inv.created_at.isoformat() + "Z" if db_inv.created_at else None,
        ai_generation_probability=db_inv.ai_generation_probability,
        manipulation_risk=db_inv.manipulation_risk,
        forensic_anomaly_score=db_inv.forensic_anomaly_score,
        metadata_risk_score=db_inv.metadata_risk_score,
        signals=db_inv.signals or [],
        evidence_breakdown=db_inv.evidence_breakdown or [],
        metadata=db_inv.metadata_analysis or {},
        suspicious_regions=db_inv.suspicious_regions or [],
        suspicious_segments=db_inv.suspicious_segments or [],
        text_metrics=db_inv.text_metrics,
        heatmap_data=db_inv.heatmap_data,
        why_result_explanation=db_inv.why_result_explanation,
        top_contributing_signals=db_inv.top_contributing_signals or [],
        limitations=db_inv.limitations
    )

@router.get("/")
def list_investigations(db: Session = Depends(get_db)):
    investigations = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    return [db_model_to_pydantic(inv) for inv in investigations]

@router.get("/{case_id}")
def get_investigation(case_id: str, db: Session = Depends(get_db)):
    investigation = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if not investigation:
        raise HTTPException(status_code=404, detail=f"Case ID {case_id} not found")
    return db_model_to_pydantic(investigation)

@router.get("/reports/{case_id}")
def get_report(case_id: str, format: str = "json", db: Session = Depends(get_db)):
    investigation = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if not investigation:
        raise HTTPException(status_code=404, detail="Case not found")
        
    result = db_model_to_pydantic(investigation)
    
    if format == "csv":
        csv_content = ForensicReportGenerator.generate_csv(result)
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=report_{case_id}.csv"})
    elif format == "html":
        html_content = ForensicReportGenerator.generate_html_docket(result)
        return Response(content=html_content, media_type="text/html")
    else:
        return json.loads(ForensicReportGenerator.generate_json(result))
