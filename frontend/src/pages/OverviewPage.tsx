import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Sliders, 
  AlertTriangle, 
  Activity, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText, 
  CheckCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { AuthenticityCore } from '../components/AuthenticityCore';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';

interface OverviewPageProps {
  onNavigate: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onSelectCase }) => {
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<number | null>(0);

  const pipelineStages = [
    { name: 'DIGITAL CONTENT', desc: 'Raw ingestion of Image, Video, Audio, or Text documents.' },
    { name: 'FILE VALIDATION', desc: 'MIME validation, hex magic byte verification & SHA-256 hashing.' },
    { name: 'MEDIA CLASSIFICATION', desc: 'Routing stream to designated specialized forensic micro-service.' },
    { name: 'SPECIALIZED ENGINE', desc: 'Spatial-temporal, Fourier frequency, or NLP tokenizer processing.' },
    { name: 'FEATURE EXTRACTION', desc: 'Deriving PRNU noise residuals, biometrics, landmark optical flow.' },
    { name: 'AI MODEL INFERENCE', desc: 'ViT, 3D-CNN, Wav2Vec2, and Transformer Stylometry neural networks.' },
    { name: 'FORENSIC SIGNALS', desc: 'Individual probabilistic metrics scored with calibration weights.' },
    { name: 'EVIDENCE FUSION', desc: 'Cross-evidence mathematical synthesis and conflict resolution.' },
    { name: 'EXPLAINABLE AI', desc: 'Grad-CAM heatmaps, token saliency & temporal attribution paths.' },
    { name: 'AUTHENTICITY ASSESSMENT', desc: 'Probabilistic determination (Likely Real / AI-Generated / Uncertain).' },
    { name: 'FORENSIC REPORT', desc: 'Cryptographically timestamped PDF docket, JSON, and CSV export.' }
  ];

  const recentCases = Object.values(SAMPLE_CASES);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '20px clamp(16px, 3vw, 28px) 80px', width: '100%' }}>
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '24px 16px 20px', position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-body-pattern-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '5px 16px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--cyan-primary)',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}
        >
          <Sparkles size={12} />
          <span>One Platform &bull; Four Media Types &bull; Explainable Digital Authenticity</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            fontWeight: 800,
            lineHeight: 1.22,
            letterSpacing: '-0.5px',
            color: 'var(--text-main)',
            maxWidth: '850px',
            margin: '0 auto 14px',
            textAlign: 'center'
          }}
        >
          Digital Content Can Look Real.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--cyan-primary) 0%, var(--blue-soft) 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              marginTop: '4px'
            }}
          >
            Evidence Tells the Story.
          </span>
        </h1>

        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            maxWidth: '740px',
            margin: '0 auto 22px',
            textAlign: 'center'
          }}
        >
          REALCHECK AI investigates images, videos, audio and text using specialized AI and forensic analysis — then explains the evidence behind every authenticity assessment.
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            onClick={() => onNavigate('image')}
            className="btn-cyber-primary"
            style={{ padding: '11px 22px', fontSize: '13px' }}
          >
            <span>START INVESTIGATION</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => onNavigate('ai-hub')}
            className="btn-cyber-secondary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            <Layers size={15} />
            <span>EXPLORE FORENSICS</span>
          </button>
        </div>

        {/* Hero Visual: Digital Evidence Core */}
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
          <AuthenticityCore onNavigateEngine={(engine) => onNavigate(engine)} />
        </div>
      </section>

      {/* 2. OVERVIEW DASHBOARD METRICS */}
      <section style={{ marginTop: '24px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              INVESTIGATION PULSE & METRICS
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Live telemetry aggregated across all four forensic inspection micro-engines
            </p>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
            UPDATED: JUST NOW
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px'
          }}
        >
          {[
            { label: 'Total Investigations', value: '1,428', sub: '+38 today', color: 'var(--cyan-primary)' },
            { label: 'Images Analyzed', value: '612', sub: 'ViT + FFT', color: 'var(--blue-soft)' },
            { label: 'Videos Analyzed', value: '340', sub: 'Spatial-Temporal', color: '#60a5fa' },
            { label: 'Audio Analyzed', value: '284', sub: 'Spectrogram + Vocoder', color: 'var(--cyan-muted)' },
            { label: 'Texts Analyzed', value: '192', sub: 'Stylometric NLP', color: '#818cf8' },
            { label: 'High-Risk Findings', value: '241', sub: 'Elevated anomalies', color: 'var(--risk-high)' },
            { label: 'Uncertain Findings', value: '48', sub: 'Mixed signals', color: 'var(--text-dim)' },
          ].map((metric, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '14px 16px',
                borderLeft: `4px solid ${metric.color}`,
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-main)',
                  margin: '4px 0 2px'
                }}
              >
                {metric.value}
              </div>
              <div style={{ fontSize: '10px', color: metric.color, fontFamily: 'var(--font-mono)' }}>
                {metric.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MAIN FORENSIC PIPELINE INTERACTIVE MAP */}
      <section className="glass-panel forensic-corner" style={{ padding: '24px', marginBottom: '36px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
            SPECIALIZED FORENSIC PIPELINE ARCHITECTURE
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click any processing stage to inspect the technical data contract and evidence extraction criteria
          </p>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px'
          }}
        >
          {pipelineStages.map((stage, idx) => {
            const isSelected = selectedPipelineStage === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPipelineStage(idx)}
                style={{
                  minWidth: '130px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isSelected ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isSelected ? 'var(--cyan-primary)' : 'var(--text-dim)' }}>
                  STEP {String(idx + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)', marginTop: '2px' }}>
                  {stage.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        {selectedPipelineStage !== null && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-body-pattern-1)',
              borderLeft: '4px solid var(--cyan-primary)',
              border: '1px solid var(--border-subtle)',
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--cyan-primary)',
              borderRadius: '0 8px 8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                STAGE {selectedPipelineStage + 1}: {pipelineStages[selectedPipelineStage].name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                {pipelineStages[selectedPipelineStage].desc}
              </div>
            </div>

            <button
              onClick={() => onNavigate('about')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--cyan-primary)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Read Specification
            </button>
          </div>
        )}
      </section>

      {/* 4. RECENT INVESTIGATIONS BENCHMARK TABLE */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              RECENT FORENSIC INVESTIGATIONS
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Standardized probabilistic cases ready for immediate examination
            </p>
          </div>

          <button
            onClick={() => onNavigate('workspace')}
            className="btn-cyber-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <span>Open Multi-Media Case Board</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Case ID</th>
                <th style={{ padding: '12px 14px' }}>Target File</th>
                <th style={{ padding: '12px 14px' }}>Media Type</th>
                <th style={{ padding: '12px 14px' }}>Model Assessment</th>
                <th style={{ padding: '12px 14px' }}>Score</th>
                <th style={{ padding: '12px 14px' }}>Risk</th>
                <th style={{ padding: '12px 14px' }}>Confidence</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((c) => {
                const isHighRisk = c.authenticity_score <= 30;
                const isMediumRisk = c.authenticity_score > 30 && c.authenticity_score <= 60;
                const riskBadge = isHighRisk ? 'badge-risk-high' : (isMediumRisk ? 'badge-risk-medium' : 'badge-risk-low');

                return (
                  <tr
                    key={c.case_id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-body-pattern-1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan-primary)', fontWeight: 600 }}>
                      {c.case_id}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>
                      {c.file_name}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {c.media_type === 'IMAGE' && <ImageIcon size={14} color="var(--cyan-primary)" />}
                        {c.media_type === 'VIDEO' && <VideoIcon size={14} color="var(--blue-soft)" />}
                        {c.media_type === 'AUDIO' && <Mic size={14} color="var(--cyan-muted)" />}
                        {c.media_type === 'TEXT' && <FileText size={14} color="#60a5fa" />}
                        {c.media_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: isHighRisk ? 'var(--risk-high)' : (isMediumRisk ? 'var(--risk-medium)' : 'var(--risk-low)') }}>
                      {c.assessment}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {c.authenticity_score}/100
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={riskBadge}>{c.risk_level}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {c.confidence_level} ({Math.round(c.confidence_score * 100)}%)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          onSelectCase(c.case_id);
                          onNavigate(c.media_type.toLowerCase());
                        }}
                        style={{
                          background: 'var(--bg-body-pattern-1)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--cyan-primary)',
                          padding: '5px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
