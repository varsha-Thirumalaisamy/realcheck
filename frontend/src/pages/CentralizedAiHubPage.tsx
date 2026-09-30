import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface CentralizedAiHubPageProps {
  onNavigate: (tab: string) => void;
}

export const CentralizedAiHubPage: React.FC<CentralizedAiHubPageProps> = ({ onNavigate }) => {
  const [selectedNode, setSelectedNode] = useState<{
    name: string;
    strength: string;
    whyMatters: string;
    affected: string;
    contribution: string;
    category: string;
  }>({
    name: 'Facial Boundary Continuity',
    strength: 'Strong (89.4%)',
    whyMatters: 'Diffusion model blending creates subtle gradient tears and resolution mismatch along anatomical contours.',
    affected: 'Facial perimeter (x: 32%, y: 22%)',
    contribution: '34.0% of final prediction weight',
    category: 'Spatial Texture Gradient'
  });

  const engineStatuses = [
    { name: 'Image Engine (ViT + Spectral ResNet)', status: 'Online / Ready', latency: '142ms', color: 'var(--cyan-primary)' },
    { name: 'Video Engine (Spatial-Temporal 3D-CNN)', status: 'Online / Ready', latency: '420ms', color: 'var(--blue-soft)' },
    { name: 'Audio Engine (Spectrogram Classifier)', status: 'Online / Ready', latency: '88ms', color: 'var(--cyan-muted)' },
    { name: 'NLP Stylometry Engine (Transformer)', status: 'Online / Ready', latency: '45ms', color: '#818cf8' },
    { name: 'Evidence Fusion Hub', status: 'Online / Active', latency: '12ms', color: 'var(--risk-low)' },
    { name: 'Explainability & Attribution Engine', status: 'Online / Active', latency: '35ms', color: 'var(--risk-medium)' },
  ];

  const evidenceNodes = [
    {
      name: 'Facial Boundary Continuity',
      strength: 'Strong (89.4%)',
      whyMatters: 'Diffusion models struggle to resolve biological transition between epidermal skin and ambient lighting vectors.',
      affected: 'Face perimeter contour (x: 32%, y: 22%)',
      contribution: '34.0%',
      category: 'Spatial Texture'
    },
    {
      name: 'Fourier 2D High-Frequency Roll-Off',
      strength: 'Strong (84.2%)',
      whyMatters: 'Latent upsampling generates discrete harmonic frequency checkerboards absent in physical CMOS sensors.',
      affected: 'Global Fourier spectrum (>12 kHz equivalent)',
      contribution: '26.0%',
      category: 'Frequency FFT'
    },
    {
      name: 'Temporal Face Landmark Stability',
      strength: 'Strong (91.0%)',
      whyMatters: 'Non-rigid inter-frame face swapping exhibits optical flow micro-jitter during speech transitions.',
      affected: 'Frames 240-330 (00:08 - 00:11)',
      contribution: '38.0%',
      category: 'Temporal Optical Flow'
    },
    {
      name: 'Mel-Spectrogram Formant Gliding',
      strength: 'Strong (92.3%)',
      whyMatters: 'Neural vocoders lack biological articulatory vocal tract inertia, creating hyper-smooth pitch contours.',
      affected: 'Time slice 00:17 - 00:21',
      contribution: '42.0%',
      category: 'Acoustic Biometrics'
    },
    {
      name: 'Syntactic Uniformity & Burstiness',
      strength: 'Moderate (78.0%)',
      whyMatters: 'Constricted sentence length variance and formulaic discourse connectives characterize LLM drafting.',
      affected: 'Full document body (std dev: 2.1 words)',
      contribution: '38.0%',
      category: 'Stylometric NLP'
    },
    {
      name: 'Sensor PRNU Noise Fingerprint',
      strength: 'Moderate (76.8%)',
      whyMatters: 'Absence of camera silicon photo-response non-uniformity confirms synthetic pixels.',
      affected: 'Midtone & background pixel patches',
      contribution: '22.0%',
      category: 'Sensor Hardware Residual'
    }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
            CENTRALIZED EXPLAINABLE AI ARCHITECTURE
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TRANSPARENT REASONING ENGINE</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginTop: '2px' }}>
          CENTRALIZED EXPLAINABLE AI & EVIDENCE FUSION HUB
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Visualizing how four independent forensic engines funnel evidence into the central Explainable AI Hub, culminating in unified probabilistic verification.
        </p>
      </div>

      {/* Real-time Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        {engineStatuses.map((eng, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '12px 14px',
              borderLeft: `3px solid ${eng.color}`
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
              {eng.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--risk-low)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--risk-low)' }} />
                <span>{eng.status}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                {eng.latency}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Visual: Architecture Flow Diagram & Interactive Evidence Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Architecture Pipeline Tree */}
        <div className="glass-panel forensic-corner" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--cyan-primary)', letterSpacing: '0.5px', marginBottom: '18px' }}>
            VERTICAL EVIDENCE CONVERGENCE PIPELINE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {/* 4 Media Engines Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
              {[
                { name: 'IMAGE ENGINE', sub: 'Fourier & PRNU', color: 'var(--cyan-primary)', tab: 'image' },
                { name: 'VIDEO ENGINE', sub: 'Temporal & Viseme', color: 'var(--blue-soft)', tab: 'video' },
                { name: 'AUDIO ENGINE', sub: 'Spectrogram & Vocoder', color: 'var(--cyan-muted)', tab: 'audio' },
                { name: 'TEXT ENGINE', sub: 'Burstiness & Entropy', color: '#818cf8', tab: 'text' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate(item.tab)}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${item.color}`,
                    borderRadius: '6px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: item.color }}>{item.name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Connecting arrows */}
            <ArrowDown size={18} color="#00f0ff" />

            {/* Central Evidence Extraction */}
            <div
              style={{
                width: '80%',
                padding: '10px',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--risk-uncertain-text)'
              }}
            >
              EVIDENCE EXTRACTION &amp; CALIBRATION WEIGHTING
            </div>

            <ArrowDown size={18} color="#00f0ff" />

            {/* Evidence Fusion Hub */}
            <div
              className="glass-panel-glow"
              style={{
                width: '90%',
                padding: '14px',
                textAlign: 'center',
                backgroundColor: '#0c162d',
                borderColor: 'var(--cyan-primary)',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                CORE INTELLIGENCE LAYER
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                CENTRALIZED EXPLAINABLE AI HUB
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cross-Modal Attention &bull; Saliency Attributions &bull; Conflict Resolver
              </div>
            </div>

            <ArrowDown size={18} color="#00f0ff" />

            {/* Authenticity Engine */}
            <div
              style={{
                width: '80%',
                padding: '10px',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--risk-uncertain-text)'
              }}
            >
              AUTHENTICITY ENGINE (PROBABILISTIC SCORING 0-100)
            </div>

            <ArrowDown size={18} color="#00f0ff" />

            {/* Forensic Report */}
            <div
              style={{
                width: '70%',
                padding: '10px',
                textAlign: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--risk-low)'
              }}
            >
              CRYPTOGRAPHIC FORENSIC REPORT &amp; EXPORT
            </div>
          </div>
        </div>

        {/* Right: Interactive Evidence Node Inspector */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--blue-soft)', letterSpacing: '0.5px', marginBottom: '8px' }}>
            INTERACTIVE EVIDENCE ATTRIBUTION GRAPH
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Click an evidence node to evaluate how individual forensic signals contribute to the final probability assessment:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {evidenceNodes.map((node, idx) => {
              const isSelected = selectedNode.name === node.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? '1px solid #00f0ff' : '1px solid rgba(56, 189, 248, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--cyan-primary)' : 'var(--text-main)' }}>
                      {node.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Category: {node.category}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--risk-high)', fontWeight: 700 }}>
                      {node.strength}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Weight: {node.contribution}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Node Detail Card */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderLeft: '4px solid #00f0ff',
              borderRadius: '0 6px 6px 0',
              fontSize: '12px'
            }}
          >
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--cyan-primary)', fontWeight: 700, marginBottom: '2px' }}>
              Why This Signal Matters
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '4px' }}>
              {selectedNode.name}
            </div>
            <div style={{ color: 'var(--risk-uncertain-text)', lineHeight: 1.5, marginBottom: '8px' }}>
              {selectedNode.whyMatters}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              <strong>Affected Region / Slice:</strong> {selectedNode.affected}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
