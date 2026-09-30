import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  MapPin, 
  Newspaper, 
  Lock, 
  Building2, 
  Globe, 
  Scale, 
  ArrowRight,
  Sparkles,
  Milestone,
  CheckCircle2
} from 'lucide-react';

interface ArchitectureAboutPageProps {
  onNavigate: (tab: string) => void;
}

export const ArchitectureAboutPage: React.FC<ArchitectureAboutPageProps> = ({ onNavigate }) => {
  const roadmapPhases = [
    { phase: 'PHASE 1', title: 'Image Forensics Engine', desc: 'Fourier 2D FFT spectral decomposition and sensor PRNU residual extraction.', status: 'Completed' },
    { phase: 'PHASE 2', title: 'Video Deepfake Detection', desc: 'Spatial-temporal landmark optical flow and audio-visual viseme synchronization.', status: 'Completed' },
    { phase: 'PHASE 3', title: 'Audio Authenticity Lab', desc: 'Mel-spectrogram formant continuity and neural vocoder high-frequency phase analysis.', status: 'Completed' },
    { phase: 'PHASE 4', title: 'Text Stylometry Profiler', desc: 'Syntactic burstiness, token perplexity distribution, and trope repetition metrics.', status: 'Completed' },
    { phase: 'PHASE 5', title: 'Cross-Media Evidence Fusion', desc: 'Unified multi-modal Bayesian aggregation and conflict/uncertainty resolution.', status: 'Active / Deployed' },
    { phase: 'PHASE 6', title: 'Enterprise REST & C2PA API', desc: 'Cryptographic provenance manifest verification and high-throughput batch API.', status: 'Q3 2026' },
    { phase: 'PHASE 7', title: 'Browser Extension & Social Verification', desc: 'Zero-latency on-hover forensic overlay for major news and social platforms.', status: 'Q4 2026' },
    { phase: 'PHASE 8', title: 'Mobile Forensic Suite', desc: 'On-device camera sensor calibration and direct capture chain-of-custody verification.', status: '2027' }
  ];

  const useCases = [
    { title: 'Investigative Journalism', icon: Newspaper, desc: 'Verify leaked imagery, whistleblower recordings, and citizen journalism before publishing.' },
    { title: 'Cybersecurity SOC & Threat Intel', icon: Lock, desc: 'Defend against executive deepfake voice cloning wire-fraud and spear-phishing campaigns.' },
    { title: 'Legal & Digital Forensics', icon: Scale, desc: 'Establish chain-of-custody evidentiary records with transparent mathematical signal decomposition.' },
    { title: 'Social Platforms & Moderation', icon: Globe, desc: 'Detect coordinated synthetic propaganda blitzes and automated disinfo campaigns at scale.' },
    { title: 'E-Commerce & Identity Proofing', icon: Building2, desc: 'Validate government ID photos and merchant documentation against generative spoofing.' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
            PLATFORM MISSION & ARCHITECTURE
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SYSTEM DESIGN SPECIFICATION</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginTop: '2px' }}>
          REALCHECK AI: THE FORENSIC PARADIGM
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '850px', lineHeight: 1.6 }}>
          “Don’t just detect. Investigate, explain, and verify.” The internet has transitioned from an era of verifiable physical media into an era of synthetic plausibility. REALCHECK AI replaces naive black-box classification with explainable forensic evidence trails.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-panel forensic-corner" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--risk-high)', marginBottom: '10px' }}>
            THE CRITICAL PROBLEM
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--risk-uncertain-text)', lineHeight: 1.6 }}>
            Modern diffusion algorithms, neural voice cloners, and real-time deepfake lip-sync generators can effortlessly fool the human eye and ear. Existing commercial detectors merely display a binary “REAL” or “FAKE” label with zero explainability, causing catastrophic false accusations or blind trust.
          </p>
        </div>

        <div className="glass-panel forensic-corner" style={{ padding: '24px', borderLeft: '4px solid #00f0ff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cyan-primary)', marginBottom: '10px' }}>
            THE REALCHECK AI SOLUTION
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--risk-uncertain-text)', lineHeight: 1.6 }}>
            REALCHECK AI establishes a unified 4-media architecture (Image, Video, Audio, Text). Every assessment is probabilistic, localized to exact timestamps or spatial coordinates, decomposed into distinct forensic signals (PRNU noise, Fourier FFT, viseme alignment, burstiness), and synthesized into an auditable evidence report.
          </p>
        </div>
      </div>

      {/* Architecture Visual Diagram */}
      <section className="glass-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginBottom: '16px' }}>
          CORE FORENSIC ARCHITECTURE SPECIFICATION
        </h2>

        <div
          style={{
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'var(--blue-soft)',
            overflowX: 'auto'
          }}
        >
          <pre>{`
             DIGITAL CONTENT (Image / Video / Audio / Text)
                                    ↓
                     FILE VALIDATION & MIME CHECKSUM
                                    ↓
                      MEDIA ROUTING CLASSIFICATION
                                    ↓
    ┌───────────────────────┬───────────────────────┬───────────────────────┐
    ↓                       ↓                       ↓                       ↓
IMAGE FORENSICS        VIDEO ANALYSIS      AUDIO AUTHENTICITY       TEXT STYLOMETRY
• Fourier 2D FFT        • 3D-CNN Optical Flow • Mel-Spectrogram Formant • Burstiness
• PRNU Sensor Residual  • Lip-Sync Viseme     • Pitch Micro-Jitter      • Perplexity
• Pixel Block Covariance• Landmark Warping    • High-Freq Vocoder Phase • Trope Frequency
    └───────────────────────┴───────────────────────┴───────────────────────┘
                                    ↓
                     EVIDENCE EXTRACTION & WEIGHTING
                                    ↓
                     CENTRALIZED EXPLAINABLE AI HUB
                     (Grad-CAM, Saliency, Temporal Maps)
                                    ↓
                     CROSS-MEDIA EVIDENCE FUSION
                    (Bayesian Multi-Signal Synthesis)
                                    ↓
                    AUTHENTICITY ENGINE (0 - 100)
    ┌───────────────────────┬───────────────────────┬───────────────────────┐
    ↓                       ↓                       ↓                       ↓
CALIBRATED SCORE     RISK CLASSIFICATION     EXPLAINABILITY      LIMITATIONS NOTICE
    └───────────────────────┴───────────────────────┴───────────────────────┘
                                    ↓
            CRYPTOGRAPHIC FORENSIC REPORT (PDF / JSON / CSV)
          `}</pre>
        </div>
      </section>

      {/* 8-Phase Future Roadmap */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Milestone size={20} color="#00f0ff" />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
            8-PHASE SYSTEM ROADMAP
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px'
          }}
        >
          {roadmapPhases.map((r, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '16px 18px',
                borderLeft: r.status.includes('Completed') || r.status.includes('Active') ? '3px solid #10b981' : '3px solid #38bdf8'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan-primary)', fontWeight: 700 }}>
                  {r.phase}
                </span>
                <span className={r.status.includes('Completed') || r.status.includes('Active') ? 'badge-risk-low' : 'badge-risk-medium'}>
                  {r.status}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {r.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginBottom: '16px' }}>
          REAL-WORLD ENTERPRISE & SOCIETAL USE CASES
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}
        >
          {useCases.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div key={idx} className="glass-panel" style={{ padding: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Icon size={18} color="#00f0ff" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {uc.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {uc.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ethical Commitment & Limitations */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '8px',
          padding: '24px',
          fontSize: '12px',
          color: 'var(--risk-uncertain-text)',
          lineHeight: 1.7
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-primary)', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
          <ShieldCheck size={18} />
          <span>OUR ETHICAL STANDARD: PROBABILISTIC FORENSICS OVER DOGMA</span>
        </div>
        <p>
          REALCHECK AI explicitly rejects claims of 100% absolute proof in digital media detection. High-compression artifacts, camera sensor noise variations, and creative editing pipelines can mimic synthetic signatures. Our mission is to equip human analysts, journalists, and trust &amp; safety officers with comprehensive mathematical evidence trails so informed judgments can be made with humility and rigor.
        </p>
      </div>
    </div>
  );
};
