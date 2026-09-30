import React, { useState } from 'react';
import { Image, Video, Mic, FileText, Zap } from 'lucide-react';

interface AuthenticityCoreProps {
  onNavigateEngine: (engine: string) => void;
  activeScore?: number;
  activeAssessment?: string;
}

export const AuthenticityCore: React.FC<AuthenticityCoreProps> = ({
  onNavigateEngine,
  activeScore = 78
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '820px',
        height: '350px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* SVG Connecting Flow Lines */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id="coreLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--cyan-primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--blue-soft)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Orbit Rings */}
        <circle cx="50%" cy="50%" r="142" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="50%" cy="50%" r="92" fill="none" stroke="var(--border-active)" strokeWidth="1.2" opacity="0.6" />
        
        {/* Radar beam in background */}
        <line x1="50%" y1="50%" x2="68%" y2="28%" stroke="var(--cyan-primary)" strokeWidth="1.5" opacity="0.4" className="radar-sweep" />

        {/* 4 connecting lines from engines to center */}
        {/* Top-Right: Image */}
        <line x1="68%" y1="20%" x2="50%" y2="50%" stroke="var(--cyan-primary)" strokeWidth="1.5" className="flow-connector" />
        {/* Bottom-Right: Video */}
        <line x1="68%" y1="80%" x2="50%" y2="50%" stroke="var(--blue-soft)" strokeWidth="1.5" className="flow-connector" />
        {/* Bottom-Left: Audio */}
        <line x1="32%" y1="80%" x2="50%" y2="50%" stroke="var(--cyan-muted)" strokeWidth="1.5" className="flow-connector" />
        {/* Top-Left: Text */}
        <line x1="32%" y1="20%" x2="50%" y2="50%" stroke="#60a5fa" strokeWidth="1.5" className="flow-connector" />
      </svg>

      {/* Central Authenticity Core Node */}
      <div
        className="glass-panel-glow pulse-node"
        onClick={() => onNavigateEngine('ai-hub')}
        style={{
          width: '136px',
          height: '136px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card-solid)',
          border: '2px solid var(--cyan-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px var(--border-glow)',
          cursor: 'pointer',
          zIndex: 10,
          textAlign: 'center',
          padding: '10px',
          userSelect: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <Zap size={20} color="var(--cyan-primary)" />
        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 700 }}>
          EVIDENCE CORE
        </span>
        <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', lineHeight: 1.1 }}>
          {activeScore}%
        </div>
        <span style={{ fontSize: '9px', color: 'var(--blue-soft)', letterSpacing: '0.4px', fontWeight: 600 }}>
          AUTHENTICITY
        </span>
      </div>

      {/* 4 Orbiting Media Nodes */}
      {/* 1. Image (Top-Right) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('image')}
        onMouseEnter={() => setHoveredNode('image')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          top: '14px',
          right: '24px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: hoveredNode === 'image' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
          background: 'var(--bg-card-solid)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'image' ? '0 0 18px var(--border-glow)' : '0 2px 10px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={15} color="var(--cyan-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--text-main)' }}>IMAGE ENGINE</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fourier FFT &bull; PRNU Noise</div>
          </div>
        </div>
      </div>

      {/* 2. Video (Bottom-Right) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('video')}
        onMouseEnter={() => setHoveredNode('video')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          bottom: '14px',
          right: '24px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: hoveredNode === 'video' ? '1px solid var(--blue-soft)' : '1px solid var(--border-subtle)',
          background: 'var(--bg-card-solid)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'video' ? '0 0 18px rgba(56, 189, 248, 0.3)' : '0 2px 10px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={15} color="var(--blue-soft)" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--text-main)' }}>VIDEO ANALYSIS</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lip-Sync &bull; Landmark Warping</div>
          </div>
        </div>
      </div>

      {/* 3. Audio (Bottom-Left) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('audio')}
        onMouseEnter={() => setHoveredNode('audio')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '24px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: hoveredNode === 'audio' ? '1px solid var(--cyan-muted)' : '1px solid var(--border-subtle)',
          background: 'var(--bg-card-solid)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'audio' ? '0 0 18px rgba(6, 182, 212, 0.3)' : '0 2px 10px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={15} color="var(--cyan-muted)" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--text-main)' }}>AUDIO AUTHENTICITY</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mel Spectrogram &bull; Jitter</div>
          </div>
        </div>
      </div>

      {/* 4. Text (Top-Left) */}
      <div
        className="glass-panel"
        onClick={() => onNavigateEngine('text')}
        onMouseEnter={() => setHoveredNode('text')}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          top: '14px',
          left: '24px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: hoveredNode === 'text' ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
          background: 'var(--bg-card-solid)',
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: hoveredNode === 'text' ? '0 0 18px rgba(96, 165, 250, 0.3)' : '0 2px 10px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={15} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--text-main)' }}>TEXT STYLOMETRY</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Burstiness &bull; Perplexity</div>
          </div>
        </div>
      </div>
    </div>
  );
};
