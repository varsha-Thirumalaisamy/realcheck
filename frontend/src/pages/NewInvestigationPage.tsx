import React from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  FileText,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface NewInvestigationPageProps {
  onNavigate: (tab: string) => void;
}

const MEDIA_OPTIONS = [
  {
    id: 'image',
    label: 'Image',
    sub: 'Visual authenticity and manipulation analysis',
    icon: ImageIcon,
    color: '#00f0ff',
    detail: 'Detect AI-generated imagery, Grad-CAM heatmaps, FFT frequency analysis, PRNU noise residuals, and EXIF metadata forensics.'
  },
  {
    id: 'video',
    label: 'Video',
    sub: 'Temporal and deepfake analysis',
    icon: VideoIcon,
    color: '#38bdf8',
    detail: 'Detect deepfakes, face-swap artifacts, lip-sync drift, optical flow anomalies, and temporal 3D-CNN inference across frames.'
  },
  {
    id: 'audio',
    label: 'Audio',
    sub: 'Acoustic and voice authenticity analysis',
    icon: Mic,
    color: '#06b6d4',
    detail: 'Detect voice cloning, vocoder artifacts, spectral inconsistencies, and acoustic splice boundaries using Wav2Vec2 analysis.'
  },
  {
    id: 'text',
    label: 'Text',
    sub: 'Stylometric and AI-writing analysis',
    icon: FileText,
    color: '#60a5fa',
    detail: 'Analyze writing style, perplexity, burstiness, authorship consistency, and AI-writing probability using NLP transformer models.'
  }
];

export const NewInvestigationPage: React.FC<NewInvestigationPageProps> = ({ onNavigate }) => {
  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '48px 24px 80px',
        width: '100%'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 240, 255, 0.07)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--cyan-primary)',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}
        >
          <ShieldCheck size={12} />
          REALCHECK AI
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '10px',
            letterSpacing: '0.3px'
          }}
        >
          New Investigation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
          Select the type of content you want to investigate. Each engine applies
          specialized forensic analysis and produces an explainable authenticity assessment.
        </p>
      </div>

      {/* Media Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
        {MEDIA_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onNavigate(opt.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px 24px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = opt.color;
              e.currentTarget.style.transform = 'translateX(3px)';
              e.currentTarget.style.boxShadow = `0 4px 20px ${opt.color}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: `${opt.color}14`,
                border: `1px solid ${opt.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <opt.icon size={22} color={opt.color} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '4px'
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5
                }}
              >
                {opt.sub}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  lineHeight: 1.5,
                  marginTop: '6px'
                }}
              >
                {opt.detail}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* Divider + secondary link */}
      <div
        style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Looking for multi-media case management?
        </p>
        <button
          onClick={() => onNavigate('workspace')}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--cyan-primary)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          Open Cases Workspace
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
