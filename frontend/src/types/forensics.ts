/**
 * TypeScript Interfaces for REALCHECK AI Forensic Platform
 */

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT';

export type AuthenticityAssessment = 
  | 'Likely Authentic'
  | 'Likely AI-Generated'
  | 'Likely AI-Assisted'
  | 'Likely AI-Manipulated'
  | 'Likely Manipulated'
  | 'Uncertain / Mixed Evidence';

export type RiskLevel = 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Uncertain';
export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';

export interface ForensicSignal {
  name: string;
  category: 'texture' | 'frequency' | 'temporal' | 'metadata' | 'acoustic' | 'stylometric' | 'cv' | 'multimodal' | 'nlp' | 'pixel';
  score: number;        // 0-100 anomaly / suspicion score
  weight: number;       // contribution weight (0.0 - 1.0)
  strength: 'Strong' | 'Moderate' | 'Weak' | 'Normal';
  status: 'Anomaly Detected' | 'Suspicious Pattern' | 'Within Normal Variance' | 'Inconclusive';
  explanation: string;
  affected_region_or_time?: string;
  model_contribution_pct: number;
}

export interface EvidenceCardItem {
  title: string;
  status: string;
  score: number;
  risk: RiskLevel;
  explanation: string;
  category: string;
}

export interface SuspiciousRegion {
  id: string;
  label: 'FACE REGION' | 'HAIR BOUNDARY' | 'BACKGROUND' | 'OBJECT EDGE' | 'EYE/CORNEA' | 'SEAM BOUNDARY';
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  anomaly_type: string;
  explanation: string;
}

export interface SuspiciousTimeSegment {
  start_time: string;
  end_time: string;
  start_seconds: number;
  end_seconds: number;
  risk_level: 'High' | 'Amber' | 'Normal';
  anomaly_type: string;
  description: string;
}

export interface MetadataAnalysis {
  file_name: string;
  file_size_formatted: string;
  mime_type: string;
  dimensions?: string;
  duration?: string;
  creation_time?: string;
  software_signature?: string;
  camera_model?: string;
  exif_available: boolean;
  editing_software_indicator?: string;
  hash_sha256: string;
  metadata_risk_score: number;
  note: string;
}

export interface TextMetrics {
  word_count: number;
  sentence_count: number;
  avg_sentence_length: number;
  sentence_length_std_dev: number;
  perplexity_score: number;
  burstiness_score: number;
  repeated_phrases_count: number;
  vocabulary_richness_ttr: number;
  analyzed_text_sample: string;
}

export interface InvestigationResult {
  case_id: string;
  media_type: MediaType;
  file_name: string;
  assessment: AuthenticityAssessment;
  authenticity_score: number;  // 0-100 (0-30 High Risk, 31-60 Medium Risk, 61-100 Lower Risk)
  risk_level: RiskLevel;
  confidence_level: ConfidenceLevel;
  confidence_score: number;
  is_demo_analysis: boolean;
  disclaimer: string;
  timestamp: string;

  ai_generation_probability: number;
  manipulation_risk: number;
  forensic_anomaly_score: number;
  metadata_risk_score: number;

  signals: ForensicSignal[];
  evidence_breakdown: EvidenceCardItem[];
  metadata: MetadataAnalysis;

  suspicious_regions?: SuspiciousRegion[];
  suspicious_segments?: SuspiciousTimeSegment[];
  text_metrics?: TextMetrics;

  why_result_explanation: string;
  top_contributing_signals: {
    signal: string;
    impact: string;
    weight: string;
  }[];
  limitations: string;
  preview_url?: string;
  sample_type?: 'ai' | 'real';
}

export interface CrossMediaFusionResult {
  case_title: string;
  media_types_analyzed: MediaType[];
  files_analyzed_count: number;
  unified_authenticity_score: number;
  assessment: string;
  risk_level: RiskLevel;
  average_ai_generation_probability: number;
  average_manipulation_risk: number;
  uncertainty_detected: boolean;
  signal_variance_spread: number;
  fusion_explanation: string;
  top_contributing_signals: {
    name: string;
    category: string;
    score: number;
    strength: string;
    status: string;
    explanation: string;
    impact: string;
  }[];
  disclaimer: string;
  participating_cases: {
    case_id: string;
    file_name: string;
    media_type: MediaType;
    assessment: string;
    score: number;
    risk: RiskLevel;
  }[];
}

export interface ModelInsightItem {
  id: string;
  name: string;
  type: string;
  input_type: MediaType;
  version: string;
  status: string;
  training_status: string;
  confidence_avg: string;
  inference_time: string;
  features: string[];
}
