import hashlib
import time
import re
from datetime import datetime
from typing import Dict, Any, Optional
import math
from collections import Counter

from ..base import BaseDetector
from .walter_client import WalterWritesClient
from ...schemas.forensics import (
    InvestigationResult,
    ForensicSignal,
    EvidenceCard,
    MetadataAnalysis
)

class TextDetector(BaseDetector):
    _case_counter = 0

    def __init__(self, walter_client: Optional[WalterWritesClient] = None):
        super().__init__(
            model_name="Text Authenticity & Manipulation Analyzer",
            model_version="v3.0.0",
            input_type="TEXT"
        )
        self.walter_client = walter_client or WalterWritesClient()

    def analyze(self, file_path_or_content: Any, metadata: Optional[Dict[str, Any]] = None) -> InvestigationResult:
        import uuid
        case_id = (metadata or {}).get("request_id") or f"RC-2026-{int(time.time() % 10000):04d}-{uuid.uuid4().hex[:4].upper()}"
        file_name = (metadata or {}).get("file_name", "analyzed_document.txt")
        
        text_content = str(file_path_or_content) if file_path_or_content else ""
        content_hash = hashlib.sha256(text_content.encode('utf-8')).hexdigest()
        file_size = f"{len(text_content.encode('utf-8')) / 1024:.1f} KB"

        signals = []
        evidence = []
        
        # Validation checks
        if not text_content.strip():
            return self._build_result(
                case_id=case_id,
                file_name=file_name,
                file_size=file_size,
                content_hash=content_hash,
                assessment="Uncertain",
                confidence=0.0,
                why_explanation="Classification: Uncertain\n\nConfidence: 0%\n\nReason:\nText is empty.",
                signals=[self._create_signal(
                    "Insufficient Text Length",
                    "stylometric",
                    0.0,
                    0.0,
                    "Inconclusive",
                    "Inconclusive"
                )],
                evidence=[],
                metrics={}
            )

        # Preprocessing & Tokenization
        # Preserve punctuation for analysis
        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +|\n+', text_content) if s.strip()]
        sentence_count = len(sentences)
        
        words = re.findall(r'\b\w+\b', text_content.lower())
        word_count = len(words)
        unique_words = set(words)
        unique_word_count = len(unique_words)
        
        characters = len(text_content)
        
        # Validation for short text
        if word_count < 5:
            return self._build_result(
                case_id=case_id,
                file_name=file_name,
                file_size=file_size,
                content_hash=content_hash,
                assessment="Uncertain",
                confidence=0.15,
                why_explanation="Classification: Uncertain\n\nConfidence: 15%\n\nReason:\nText is too short for reliable analysis.",
                signals=[self._create_signal(
                    "Insufficient Text Length",
                    "stylometric",
                    0.0,
                    0.0,
                    "Inconclusive",
                    "Inconclusive"
                )],
                evidence=[],
                metrics={"characters": characters, "word_count": word_count, "sentence_count": sentence_count}
            )

        # Feature Extraction & Linguistic Analysis
        sentence_lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences]
        
        burstiness = 0.0
        if sentence_count > 1:
            mean_length = sum(sentence_lengths) / sentence_count
            variance = sum((x - mean_length) ** 2 for x in sentence_lengths) / sentence_count
            std_dev = math.sqrt(variance)
            burstiness = std_dev / mean_length if mean_length > 0 else 0.0
            
        lexical_diversity = unique_word_count / word_count if word_count > 0 else 0.0
        avg_word_length = sum(len(w) for w in words) / word_count if word_count > 0 else 0.0

        # Manipulation Indicators
        manipulation_score = 0
        ai_score = 0
        
        # 1. Repeated sentences
        sentence_counts = Counter(sentences)
        repeated_sentences = sum(1 for count in sentence_counts.values() if count > 1)
        if repeated_sentences > 0:
            manipulation_score += 40
            signals.append(self._create_signal("Repeated sentence detected.", "manipulation", 80, 0.4, "Strong", "Suspicious Pattern"))

        # 2. Repeated phrases (n-grams)
        if word_count >= 10:
            phrases = [' '.join(words[i:i+3]) for i in range(len(words)-2)]
            phrase_counts = Counter(phrases)
            repeated_phrases = sum(1 for count in phrase_counts.values() if count > 2)
            if repeated_phrases > 0:
                manipulation_score += 20
                signals.append(self._create_signal("Unusually repeated phrases detected.", "manipulation", 60, 0.3, "Moderate", "Suspicious Pattern"))
        
        # 3. Unicode / Formatting anomalies
        suspicious_chars = re.findall(r'[^\x00-\x7F]', text_content)
        if len(suspicious_chars) > word_count * 0.1:  # Unusual if highly non-ascii in english context
             manipulation_score += 15
             signals.append(self._create_signal("Suspicious Unicode characters detected.", "metadata", 50, 0.2, "Moderate", "Anomaly Detected"))

        upper_case_count = sum(1 for c in text_content if c.isupper())
        if upper_case_count > len(text_content) * 0.3 and len(text_content) > 20:
             manipulation_score += 10
             signals.append(self._create_signal("Unusual formatting (excessive uppercase).", "stylometric", 40, 0.2, "Moderate", "Anomaly Detected"))

        # AI-Generated Indicators
        # 1. Low sentence variation (Burstiness)
        if sentence_count >= 5:
            if burstiness < 0.25:
                ai_score += 45
                signals.append(self._create_signal("Extremely low variation in sentence length", "stylometric", 85, 0.45, "Strong", "Suspicious Pattern"))
            elif burstiness < 0.35:
                ai_score += 30
                signals.append(self._create_signal("Low variation in sentence length", "stylometric", 70, 0.3, "Moderate", "Suspicious Pattern"))
            elif burstiness > 0.6:
                signals.append(self._create_signal("High sentence length variation (Human-like)", "stylometric", 15, 0.2, "Normal", "Within Normal Variance"))
                ai_score = max(0, ai_score - 15)

        # 2. Lexical diversity (scaled by length)
        expected_ttr = 0.8 if word_count < 50 else (0.7 if word_count < 100 else 0.5)
        if word_count > 30:
            if lexical_diversity < expected_ttr * 0.7:
                ai_score += 35
                signals.append(self._create_signal("Unusually constrained vocabulary", "lexical", 75, 0.35, "Strong", "Suspicious Pattern"))
            elif lexical_diversity > expected_ttr * 1.2:
                signals.append(self._create_signal("Rich vocabulary diversity", "lexical", 15, 0.2, "Normal", "Within Normal Variance"))
                ai_score = max(0, ai_score - 10)

        # 3. AI-typical vocabulary and transitions
        ai_vocabulary = [
            "delve", "tapestry", "multifaceted", "testament", "intricate", 
            "crucial", "landscape", "moreover", "furthermore", "additionally", 
            "in conclusion", "it is important to note", "firstly", "secondly"
        ]
        found_ai_words = sum(1 for p in ai_vocabulary if p in text_content.lower())
        if found_ai_words >= 3:
            ai_score += 50
            signals.append(self._create_signal("High density of AI-typical phrasing", "stylometric", 80, 0.4, "Strong", "Suspicious Pattern"))
        elif found_ai_words >= 1 and word_count < 50:
            ai_score += 25
            signals.append(self._create_signal("Predictable transition phrasing", "stylometric", 55, 0.25, "Moderate", "Suspicious Pattern"))

        # 4. Human indicators (Contractions, informalities)
        contractions = ["can't", "won't", "doesn't", "didn't", "i'm", "you're", "they're", "it's"]
        found_contractions = sum(1 for p in contractions if p in text_content.lower())
        if found_contractions >= 2:
            signals.append(self._create_signal("Informal contractions present", "stylometric", 10, 0.1, "Normal", "Within Normal Variance"))
            ai_score = max(0, ai_score - 20)

        # 5. External Neural AI Detection API (e.g., Walter Writes AI) - requires 50+ words
        if self.walter_client and self.walter_client.is_configured and word_count >= 50:
            walter_res = self.walter_client.detect_ai(text_content)
            if walter_res and walter_res.get("status") == "SUCCESS" and walter_res.get("ai_score") is not None:
                ext_ai_score = float(walter_res["ai_score"])
                ai_score = (ai_score * 0.65) + (ext_ai_score * 0.35)
                sig_strength = "Strong" if ext_ai_score >= 70 else ("Moderate" if ext_ai_score >= 40 else "Normal")
                sig_status = "Suspicious Pattern" if ext_ai_score >= 50 else "Within Normal Variance"
                signals.append(self._create_signal(
                    "External Neural AI Detection (Walter Writes)",
                    "neural_api",
                    round(ext_ai_score, 1),
                    0.35,
                    sig_strength,
                    sig_status
                ))

        # Classification Logic
        assessment = "Inconclusive"
        confidence = 0.5
        
        if manipulation_score >= 40:
            assessment = "Likely AI-Generated"
            confidence = min(0.95, 0.4 + (manipulation_score / 100))
        elif ai_score >= 60 and manipulation_score >= 20:
            assessment = "Likely AI-Generated"
            confidence = min(0.9, 0.5 + ((ai_score + manipulation_score) / 200))
        elif ai_score >= 45:
            assessment = "Likely AI-Generated"
            confidence = min(0.98, 0.5 + (ai_score / 150))
        elif ai_score <= 30 and manipulation_score < 20 and word_count >= 20:
            assessment = "Likely Human-Written"
            confidence = min(0.95, 0.6 + burstiness)
        else:
            assessment = "Inconclusive"
            confidence = 0.4

        if word_count < 20:
            confidence = min(confidence, 0.4)

        # Proxy perplexity heuristic
        perplexity_proxy = 0.0
        if word_count > 10:
            perplexity_proxy = 20 + (lexical_diversity * 100) + (burstiness * 20)
            if found_ai_words > 0:
                perplexity_proxy -= (found_ai_words * 5)
            perplexity_proxy = max(5.0, min(150.0, perplexity_proxy))

        metrics = {
            "characters": characters,
            "word_count": word_count,
            "sentence_count": sentence_count,
            "burstiness_score": burstiness,
            "vocabulary_richness_ttr": lexical_diversity,
            "perplexity_score": round(perplexity_proxy, 1),
            "sentence_length_std_dev": burstiness * (sum(sentence_lengths) / sentence_count) if sentence_count > 0 else 0
        }

        # Populate evidence cards based on signals
        for sig in signals:
            if sig.status == "Suspicious Pattern" or sig.status == "Anomaly Detected":
                evidence.append(EvidenceCard(
                    title=sig.name,
                    status="Elevated Risk",
                    score=sig.score,
                    risk="High Risk" if sig.score > 70 else "Medium Risk",
                    explanation=f"Detected pattern: {sig.name}",
                    category=sig.category
                ))

        # Build detailed explanation
        explanation_lines = []
        explanation_lines.append(f"Classification: {assessment}")
        explanation_lines.append("")
        explanation_lines.append(f"Confidence: {int(confidence * 100)}%")
        explanation_lines.append("")
        
        explanation_lines.append("Reason:")
        
        if assessment == "AI-Generated":
            explanation_lines.append("The text contains several linguistic patterns associated with AI-generated writing.")
        elif assessment == "AI-Edited":
            explanation_lines.append("The text shows signs of both human and AI characteristics, suggesting it may have been edited or heavily modified by AI tools.")
        elif assessment == "Manipulated":
            explanation_lines.append("The text contains highly suspicious patterns, such as repeated sentences or phrases, formatting anomalies, or unusual character sets.")
        elif assessment == "Human-Written":
            explanation_lines.append("The linguistic patterns, such as natural sentence variance and vocabulary richness, are consistent with human writing.")
        else:
            if word_count < 20:
                explanation_lines.append("Text is too short for reliable analysis.")
            else:
                explanation_lines.append("The analysis is uncertain due to insufficient or conflicting indicators.")
            
        why = "\n".join(explanation_lines)

        if not signals:
            if word_count < 20:
                signals.append(self._create_signal(
                    "Insufficient Text Length", 
                    "stylometric", 
                    0.0, 
                    0.0, 
                    "Inconclusive", 
                    "Inconclusive"
                ))
            else:
                signals.append(self._create_signal(
                    "No Significant Anomalies Detected", 
                    "stylometric", 
                    0.0, 
                    0.0, 
                    "Normal", 
                    "Within Normal Variance"
                ))

        return self._build_result(
            case_id=case_id,
            file_name=file_name,
            file_size=file_size,
            content_hash=content_hash,
            assessment=assessment,
            confidence=confidence,
            why_explanation=why,
            signals=signals,
            evidence=evidence,
            metrics=metrics,
            ai_prob=ai_score,
            manip_risk=manipulation_score
        )
        
    def _create_signal(self, name: str, category: str, score: float, weight: float, strength: str, status: str) -> ForensicSignal:
        return ForensicSignal(
            name=name,
            category=category,
            score=score,
            weight=weight,
            strength=strength,
            status=status,
            explanation=name,
            affected_region_or_time="Text Structure",
            model_contribution_pct=weight * 100
        )

    def _build_result(self, case_id, file_name, file_size, content_hash, assessment, confidence, why_explanation, signals, evidence, metrics, ai_prob=0.0, manip_risk=0.0) -> InvestigationResult:
        auth_score = int(confidence * 100) if assessment == "Human-Written" else int((1.0 - confidence) * 100)
        if assessment == "Uncertain":
            auth_score = 50
            
        risk_level = "Low Risk"
        if assessment in ["AI-Generated", "Manipulated"]:
            risk_level = "High Risk"
        elif assessment == "AI-Edited":
            risk_level = "Medium Risk"
        elif assessment == "Uncertain":
            risk_level = "Uncertain"

        return InvestigationResult(
            case_id=case_id,
            media_type="TEXT",
            file_name=file_name,
            assessment=assessment,
            authenticity_score=auth_score,
            risk_level=risk_level,
            confidence_level="High" if confidence > 0.8 else ("Moderate" if confidence > 0.5 else "Low"),
            confidence_score=confidence,
            is_demo_analysis=False,
            disclaimer="Analysis generated from local heuristics based on text properties.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            ai_generation_probability=min(99.0, ai_prob),
            manipulation_risk=min(99.0, manip_risk),
            forensic_anomaly_score=manip_risk,
            metadata_risk_score=0.0,
            signals=signals,
            evidence_breakdown=evidence,
            text_metrics=metrics,
            metadata=MetadataAnalysis(
                file_name=file_name,
                file_size_formatted=file_size,
                mime_type="text/plain",
                hash_sha256=content_hash,
                metadata_risk_score=0.0,
                note="Computed directly from uploaded text.",
                exif_available=False
            ),
            why_result_explanation=why_explanation,
            top_contributing_signals=[{"signal": s.name, "impact": s.strength, "weight": f"{s.weight*100:.0f}%"} for s in signals],
            limitations="Stylometry is based on statistical probabilities and heuristic indicators."
        )

    def explain(self, result: InvestigationResult) -> Dict[str, Any]:
        return {
            "method": "Heuristic & NLP Analysis",
            "layer_targeted": "N/A",
            "heatmap_resolution": "N/A",
            "salient_features": [
                "Sentence Length Variance",
                "Vocabulary Repetition",
                "Structural Predictability"
            ]
        }
