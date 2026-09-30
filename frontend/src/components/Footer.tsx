import React from 'react';
import { Crosshair, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      className="no-print"
      style={{
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        backgroundColor: 'var(--bg-deep)',
        padding: '48px 24px 32px'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '36px' }}>
          {/* Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid #00f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Crosshair size={14} color="#00f0ff" />
              </div>
              <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)' }}>
                REALCHECK AI
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--cyan-primary)', fontWeight: 600, marginBottom: '6px' }}>
              “Don’t just detect. Investigate, explain, and verify.”
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              One Platform. Four Media Types. Explainable Digital Authenticity.
            </p>
          </div>

          {/* Quick Engine Links */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue-soft)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Forensic Engines
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span onClick={() => onNavigate('image')} style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Image Forensics (ViT + FFT)</span>
              <span onClick={() => onNavigate('video')} style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Video Analysis (Spatial-Temporal)</span>
              <span onClick={() => onNavigate('audio')} style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Audio Authenticity (Mel-Spectrogram)</span>
              <span onClick={() => onNavigate('text')} style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Text Stylometry (Burstiness NLP)</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue-soft)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Investigation &amp; Hub
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span onClick={() => onNavigate('workspace')} style={{ cursor: 'pointer' }}>Multi-Media Case Dossier</span>
              <span onClick={() => onNavigate('ai-hub')} style={{ cursor: 'pointer' }}>Centralized Explainable AI Hub</span>
              <span onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>Forensic Report Generator</span>
              <span onClick={() => onNavigate('models')} style={{ cursor: 'pointer' }}>Transparent Model Registry</span>
            </div>
          </div>

          {/* Forensic Philosophy */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue-soft)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Forensic Philosophy
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              <div>&bull; “Investigate the evidence.”</div>
              <div>&bull; “Detection is only the first step.”</div>
              <div>&bull; “See what the model sees.”</div>
              <div>&bull; “Evidence over assumptions.”</div>
              <div>&bull; “Multiple signals. One explainable assessment.”</div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div
          style={{
            borderTop: '1px solid rgba(56, 189, 248, 0.1)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '11px',
            color: 'var(--text-dim)'
          }}
        >
          <div>
            &copy; 2026 REALCHECK AI Forensic Platform &bull; MIT License. Built for rigorous digital authenticity research.
          </div>
          <div>
            “AI-assisted forensic assessment &mdash; not definitive proof.”
          </div>
        </div>
      </div>
    </footer>
  );
};
