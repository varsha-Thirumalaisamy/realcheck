"""
Evidence Fusion Hub for RealCheck AI
Combines multi-modal signals from Image, Video, Audio, and Text detectors
into a unified probabilistic authenticity assessment.
"""
from typing import List, Dict, Any, Optional
from ..schemas.forensics import InvestigationResult, ForensicSignal

class EvidenceFusionHub:
    """
    Central Evidence Fusion engine that aggregates specialized forensic engine outputs.
    Ensures that AI detection is never presented as absolute proof, handles signal disagreements,
    and produces explainable cross-media assessments.
    """
    
    @staticmethod
    def fuse_investigations(investigations: List[InvestigationResult], case_title: str = "Cross-Media Investigation") -> Dict[str, Any]:
        if not investigations:
            return {"error": "No investigations provided for fusion"}

        total_signals = []
        scores = []
        ai_probs = []
        manip_risks = []
        media_types = set()

        for inv in investigations:
            media_types.add(inv.media_type)
            scores.append(inv.authenticity_score)
            ai_probs.append(inv.ai_generation_probability)
            manip_risks.append(inv.manipulation_risk)
            total_signals.extend(inv.signals)

        # Weighted calculation
        avg_authenticity = sum(scores) / len(scores)
        avg_ai_prob = sum(ai_probs) / len(ai_probs)
        avg_manip_risk = sum(manip_risks) / len(manip_risks)

        # Conflict & Uncertainty Detection
        score_spread = max(scores) - min(scores) if len(scores) > 1 else 0
        is_uncertain = score_spread > 45  # e.g., one media is score 90, another is 20

        if is_uncertain:
            assessment = "Uncertain / Mixed Evidence"
            risk_level = "Uncertain"
            fusion_explanation = "Available signals do not provide sufficient agreement for a strong assessment. Independent media channels exhibit contradictory authenticity indicators."
        elif avg_authenticity <= 30:
            assessment = "Likely AI-Generated / Manipulated"
            risk_level = "High Risk"
            fusion_explanation = f"Multiple independent media signals ({', '.join(media_types)}) indicate elevated synthetic-content risk with consistent forensic anomalies."
        elif avg_authenticity <= 60:
            assessment = "Likely AI-Assisted / Partially Manipulated"
            risk_level = "Medium Risk"
            fusion_explanation = f"Cross-media evidence reveals moderate synthetic indicators across {', '.join(media_types)}, suggesting partial synthetic intervention."
        else:
            assessment = "Likely Authentic"
            risk_level = "Low Risk"
            fusion_explanation = f"Consistent physical capture signatures and natural sensor noise observed across analyzed media files ({', '.join(media_types)})."

        # Sort top signals
        sorted_signals = sorted(total_signals, key=lambda s: s.score * s.weight, reverse=True)
        top_signals = [
            {
                "name": s.name,
                "category": s.category,
                "score": s.score,
                "strength": s.strength,
                "status": s.status,
                "explanation": s.explanation,
                "impact": s.strength
            }
            for s in sorted_signals[:6]
        ]

        return {
            "case_title": case_title,
            "media_types_analyzed": list(media_types),
            "files_analyzed_count": len(investigations),
            "unified_authenticity_score": round(avg_authenticity),
            "assessment": assessment,
            "risk_level": risk_level,
            "average_ai_generation_probability": round(avg_ai_prob, 1),
            "average_manipulation_risk": round(avg_manip_risk, 1),
            "uncertainty_detected": is_uncertain,
            "signal_variance_spread": round(score_spread, 1),
            "fusion_explanation": fusion_explanation,
            "top_contributing_signals": top_signals,
            "disclaimer": "AI-assisted forensic assessment based on fused cross-media signals — not definitive proof.",
            "participating_cases": [
                {
                    "case_id": inv.case_id,
                    "file_name": inv.file_name,
                    "media_type": inv.media_type,
                    "assessment": inv.assessment,
                    "score": inv.authenticity_score,
                    "risk": inv.risk_level
                }
                for inv in investigations
            ]
        }
