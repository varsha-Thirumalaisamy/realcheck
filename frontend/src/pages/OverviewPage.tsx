import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
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
  Zap,
  Fingerprint,
  Cpu
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';
import { useInvestigation } from '../contexts/InvestigationContext';

interface OverviewPageProps {
  onNavigate: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onSelectCase }) => {
  const { isDemoMode } = useInvestigation();

  // 4 Multimodal Cards Data
  const modalityCards = [
    {
      id: 'image',
      title: 'IMAGE',
      subtitle: 'Spatial & Fourier Frequency Forensics',
      icon: ImageIcon,
      count: '612',
      latestCaseId: 'RC-2026-0042',
      latestFile: 'synthetic_portrait.jpg',
      latestResult: 'LIKELY AI-GENERATED',
      evidenceSummary: 'PRNU residual mismatch, high-frequency anomaly',
      status: 'Analyzed',
      isAnomaly: true,
      color: 'var(--magenta-vivid)',
      tech: 'PRNU &bull; ELA &bull; Fourier &bull; C2PA'
    },
    {
      id: 'video',
      title: 'VIDEO',
      subtitle: 'Temporal Consistency & Optical Flow',
      icon: VideoIcon,
      count: '340',
      latestCaseId: 'RC-2026-0043',
      latestFile: 'face_swap.mp4',
      latestResult: 'LIKELY MANIPULATED',
      evidenceSummary: 'Inter-frame delta jitter, temporal discontinuity',
      status: 'Analyzed',
      isAnomaly: true,
      color: 'var(--violet-electric)',
      tech: 'Landmarks &bull; Optical Flow &bull; Frame Delta'
    },
    {
      id: 'audio',
      title: 'AUDIO',
      subtitle: 'Mel-Spectrogram & Acoustic Features',
      icon: Mic,
      count: '284',
      latestCaseId: 'RC-2026-0044',
      latestFile: 'synthetic_voice.wav',
      latestResult: 'LIKELY AI-GENERATED',
      evidenceSummary: 'Vocoder roll-off anomaly, low spectral variance',
      status: 'Analyzed',
      isAnomaly: true,
      color: '#38BDF8',
      tech: 'Spectrogram &bull; Roll-Off &bull; ZCR &bull; Pitch'
    },
    {
      id: 'text',
      title: 'TEXT',
      subtitle: 'Stylometry, Perplexity & Burstiness',
      icon: FileText,
      count: '192',
      latestCaseId: 'RC-2026-0045',
      latestFile: 'executive_brief_memo.txt',
      latestResult: 'LIKELY AI-GENERATED',
      evidenceSummary: 'Low surprisal, compressed sentence burstiness',
      status: 'Analyzed',
      isAnomaly: true,
      color: '#A78BFA',
      tech: 'Surprisal &bull; Burstiness &bull; TTR &bull; Stylometry'
    }
  ];

  // Recent Investigations table records
  const recentInvestigations = [
    {
      id: 'RC-2026-0042',
      media: 'Image',
      mediaType: 'IMAGE',
      fileName: 'synthetic_portrait.jpg',
      assessment: 'LIKELY AI-GENERATED',
      signals: 'MSCN anomaly, PRNU residual mismatch',
      integrity: 'SHA-256 Validated',
      status: 'Analyzed',
      isAnomaly: true,
      isDemo: true
    },
    {
      id: 'RC-2026-0044',
      media: 'Audio',
      mediaType: 'AUDIO',
      fileName: 'synthetic_voice.wav',
      assessment: 'LIKELY AI-GENERATED',
      signals: 'Vocoder roll-off anomaly, spectral cutoff',
      integrity: 'SHA-256 Validated',
      status: 'Analyzed',
      isAnomaly: true,
      isDemo: true
    },
    {
      id: 'RC-2026-0043',
      media: 'Video',
      mediaType: 'VIDEO',
      fileName: 'face_swap.mp4',
      assessment: 'LIKELY MANIPULATED',
      signals: 'Inter-frame delta jitter, temporal anomaly',
      integrity: 'SHA-256 Validated',
      status: 'Analyzed',
      isAnomaly: true,
      isDemo: true
    },
    {
      id: 'RC-2026-0045',
      media: 'Text',
      mediaType: 'TEXT',
      fileName: 'executive_brief_memo.txt',
      assessment: 'LIKELY AI-GENERATED',
      signals: 'Low perplexity, compressed burstiness',
      integrity: 'SHA-256 Validated',
      status: 'Analyzed',
      isAnomaly: true,
      isDemo: true
    },
    {
      id: 'RC-2026-0046',
      media: 'Image',
      mediaType: 'IMAGE',
      fileName: 'nikon_raw.jpg',
      assessment: 'LIKELY REAL',
      signals: 'Hardware EXIF match, natural PRNU',
      integrity: 'SHA-256 Validated',
      status: 'Analyzed',
      isAnomaly: false,
      isDemo: true
    },
    {
      id: 'RC-2026-0047',
      media: 'Video',
      mediaType: 'VIDEO',
      fileName: 'authentic_video.mp4',
      assessment: 'LIKELY REAL',
      signals: 'Smooth optical flow, natural frame delta',
      integrity: 'SHA-256 Validated',
      status: 'Analyzed',
      isAnomaly: false,
      isDemo: true
    }
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* 1. HERO HEADER */}
      <section style={{ textAlign: 'center', padding: '20px 16px 28px', position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(157, 78, 221, 0.15)',
            border: '1px solid rgba(157, 78, 221, 0.35)',
            borderRadius: '9999px',
            padding: '5px 16px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: 'var(--magenta-vivid)',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}
        >
          <Sparkles size={13} />
          <span>REALCHECK AI &bull; MULTIMODAL DIGITAL FORENSICS</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            color: '#FFFFFF',
            maxWidth: '850px',
            margin: '0 auto 12px',
            textAlign: 'center'
          }}
        >
          Unified Forensic Investigation Platform
        </h1>

        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            maxWidth: '720px',
            margin: '0 auto 24px',
            textAlign: 'center'
          }}
        >
          Comprehensive cross-modal digital authenticity auditing across Image, Video, Audio, and Text. Combines deep neural representations, spatial-temporal continuity, and cryptographic provenance.
        </p>

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('image')}
            className="btn-cyber-primary"
            style={{ padding: '10px 22px', fontSize: '12px', fontWeight: 800 }}
          >
            <span>LAUNCH IMAGE FORENSICS</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className="btn-cyber-secondary"
            style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700 }}
          >
            <Layers size={14} />
            <span>INVESTIGATION WORKSPACE</span>
          </button>
        </div>
      </section>

      {/* 2. FOUR MAIN MULTIMODAL CARDS */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.4px' }}>
              MULTIMODAL FORENSIC MODULES
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Four specialized micro-engines engineered for verifiable authenticity assessment
            </p>
          </div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: isDemoMode ? '#F472B6' : '#34D399',
              background: isDemoMode ? 'rgba(199, 36, 177, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              padding: '4px 10px',
              borderRadius: '9999px',
              border: `1px solid ${isDemoMode ? 'var(--magenta-vivid)' : '#10B981'}`
            }}
          >
            {isDemoMode ? 'MODE: FAST DEMO (3-5s)' : 'MODE: LIVE DETECTOR API'}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {modalityCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => {
                  onSelectCase(card.latestCaseId);
                  onNavigate(card.id);
                }}
                className="glass-panel"
                style={{
                  padding: '22px',
                  borderRadius: '20px',
                  border: '1px solid rgba(157, 78, 221, 0.28)',
                  background: '#1F132B',
                  boxShadow: 'var(--clay-box-shadow)',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.28)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Header: Icon & Analysis Count */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: 'rgba(157, 78, 221, 0.2)',
                        border: `1px solid ${card.color}55`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.6px' }}>
                        {card.title}
                      </h3>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        {card.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                      {card.count}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Analyzed
                    </div>
                  </div>
                </div>

                {/* Latest Result Banner */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#150C20',
                    border: '1px solid rgba(157, 78, 221, 0.18)',
                    marginBottom: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Latest Result
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.18)',
                        color: '#34D399',
                        fontWeight: 800
                      }}
                    >
                      {card.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 800, color: card.isAnomaly ? '#FF4B72' : '#10B981', letterSpacing: '0.3px' }}>
                    {card.latestResult}
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: card.isAnomaly ? '#F472B6' : '#34D399', fontWeight: 800 }}>✓</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.evidenceSummary}
                    </span>
                  </div>
                </div>

                {/* Technical Footprint */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid rgba(157, 78, 221, 0.15)', paddingTop: '10px' }}>
                  <div dangerouslySetInnerHTML={{ __html: card.tech }} />
                  <div style={{ color: card.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>Launch</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. RECENT INVESTIGATIONS BENCHMARK TABLE */}
      <section
        style={{
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(157, 78, 221, 0.28)',
          background: '#1F132B',
          boxShadow: 'var(--clay-box-shadow)',
          marginBottom: '36px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.4px' }}>
              RECENT INVESTIGATIONS
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Standardized forensic investigations docket with deterministic demonstration benchmarks
            </p>
          </div>

          <button
            onClick={() => onNavigate('workspace')}
            className="btn-cyber-secondary"
            style={{ fontSize: '11px', padding: '6px 14px' }}
          >
            <span>Open Workspace Board</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(157, 78, 221, 0.2)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Case ID</th>
                <th style={{ padding: '12px 14px' }}>Modality</th>
                <th style={{ padding: '12px 14px' }}>Evidence Target</th>
                <th style={{ padding: '12px 14px' }}>Forensic Assessment</th>
                <th style={{ padding: '12px 14px' }}>Primary Forensic Evidence</th>
                <th style={{ padding: '12px 14px' }}>Integrity</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {recentInvestigations.map((inv) => {
                return (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: '1px solid rgba(157, 78, 221, 0.12)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(157, 78, 221, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--magenta-vivid)', fontWeight: 800 }}>
                      {inv.id}
                    </td>

                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#FFFFFF', fontWeight: 700 }}>
                      {inv.media}
                    </td>

                    <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {inv.fileName}
                    </td>

                    <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 800, color: inv.isAnomaly ? '#FF4B72' : '#10B981' }}>
                      {inv.assessment}
                    </td>

                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#E2E8F0' }}>
                      {inv.signals}
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#34D399' }}>
                      {inv.integrity}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            fontWeight: 800,
                            background: 'rgba(16, 185, 129, 0.18)',
                            color: '#34D399'
                          }}
                        >
                          {inv.status}
                        </span>
                        {inv.isDemo && (
                          <span
                            style={{
                              fontSize: '9px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(199, 36, 177, 0.2)',
                              color: '#F472B6',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700
                            }}
                          >
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          onSelectCase(inv.id);
                          onNavigate(inv.mediaType.toLowerCase());
                        }}
                        style={{
                          background: 'rgba(157, 78, 221, 0.2)',
                          border: '1px solid rgba(157, 78, 221, 0.35)',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
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
