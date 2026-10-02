import React from 'react';
import { RiskLevel } from '../types/forensics';

interface ScoreMeterProps {
  score: number; // 0-100 (Manipulation Likelihood or Authenticity)
  riskLevel?: RiskLevel;
  assessment?: string;
  confidenceScore?: number; // 0.0 - 1.0 or 0 - 100
  size?: number;
  hideDetails?: boolean;
  metricLabel?: string; // Default: 'MANIPULATION LIKELIHOOD'
  isLikelihoodMode?: boolean; // If true, higher score is more manipulated (red/magenta); if false, higher is more authentic (green)
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  riskLevel = 'High Risk',
  assessment = 'LIKELY MANIPULATED',
  confidenceScore = 0.91,
  size = 210,
  hideDetails = false,
  metricLabel = 'MANIPULATION LIKELIHOOD',
  isLikelihoodMode = true
}) => {
  const radius = size * 0.40;
  const strokeWidth = size * 0.075;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine stroke & glow color based on score and mode
  let strokeColor = '#FF4B72'; // manipulation crimson
  let glowColor = 'rgba(255, 75, 114, 0.45)';

  if (isLikelihoodMode) {
    if (normalizedScore >= 60) {
      strokeColor = '#FF4B72'; // high manipulation likelihood
      glowColor = 'rgba(255, 75, 114, 0.5)';
    } else if (normalizedScore >= 35) {
      strokeColor = '#FBBF24'; // moderate / uncertain
      glowColor = 'rgba(251, 191, 36, 0.4)';
    } else {
      strokeColor = '#10B981'; // low manipulation (authentic)
      glowColor = 'rgba(16, 185, 129, 0.45)';
    }
  } else {
    // Authenticity mode (higher is authentic)
    if (normalizedScore >= 70) {
      strokeColor = '#10B981';
      glowColor = 'rgba(16, 185, 129, 0.45)';
    } else if (normalizedScore >= 40) {
      strokeColor = '#FBBF24';
      glowColor = 'rgba(251, 191, 36, 0.4)';
    } else {
      strokeColor = '#FF4B72';
      glowColor = 'rgba(255, 75, 114, 0.5)';
    }
  }

  // Format confidence
  const confPercent = confidenceScore <= 1.0 
    ? Math.round(confidenceScore * 100) 
    : Math.round(confidenceScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={`meterGrad-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} />
              <stop offset="100%" stopColor="#C724B1" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Animated score meter */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={`url(#meterGrad-${score})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 12px ${glowColor})`
            }}
          />
        </svg>

        {/* Center score readout */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '10px',
            boxSizing: 'border-box'
          }}
        >
          {/* Main Percentage Number */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: `${Math.round(size * 0.24)}px`,
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#FFFFFF',
                letterSpacing: '-1px',
                lineHeight: 1
              }}
            >
              {Math.round(normalizedScore)}
            </span>
            <span
              style={{
                fontSize: `${Math.round(size * 0.12)}px`,
                fontWeight: 800,
                color: strokeColor,
                fontFamily: 'var(--font-mono)',
                marginLeft: '1px'
              }}
            >
              %
            </span>
          </div>

          {/* Metric Label */}
          <span
            style={{
              fontSize: `${Math.max(8.5, Math.round(size * 0.052))}px`,
              color: 'var(--text-muted)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontWeight: 800,
              marginTop: '4px',
              maxWidth: '85%',
              lineHeight: 1.2
            }}
          >
            {metricLabel}
          </span>

          {/* Confidence Underneath */}
          <div
            style={{
              marginTop: '6px',
              fontSize: `${Math.max(9, Math.round(size * 0.058))}px`,
              fontFamily: 'var(--font-mono)',
              color: 'rgba(255, 255, 255, 0.85)',
              background: 'rgba(255, 255, 255, 0.07)',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            Confidence: <strong style={{ color: '#34D399' }}>{confPercent}%</strong>
          </div>
        </div>
      </div>

      {!hideDetails && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              color: strokeColor,
              textTransform: 'uppercase',
              textShadow: `0 0 10px ${glowColor}`
            }}
          >
            {assessment}
          </div>
          <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
            MODEL AUDIT ASSESSMENT &bull; PROBABILISTIC FORENSIC ESTIMATE
          </div>
        </div>
      )}
    </div>
  );
};
