import React from 'react';
import { RiskLevel } from '../types/forensics';

interface ScoreMeterProps {
  score: number;
  riskLevel: RiskLevel;
  assessment: string;
  confidenceScore?: number;
  size?: number;
  hideDetails?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  riskLevel,
  assessment,
  confidenceScore = 0.9,
  size = 200,
  hideDetails = false
}) => {
  const radius = size * 0.42;
  const strokeWidth = size * 0.08;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = 'var(--risk-low)'; // green (low risk / high authenticity)
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (riskLevel === 'High Risk' || score <= 30) {
    strokeColor = 'var(--risk-high)'; // red
    glowColor = 'rgba(239, 68, 68, 0.4)';
  } else if (riskLevel === 'Medium Risk' || score <= 60) {
    strokeColor = 'var(--risk-medium)'; // amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else if (riskLevel === 'Uncertain') {
    strokeColor = 'var(--text-muted)'; // gray
    glowColor = 'rgba(148, 163, 184, 0.3)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#151f33"
            strokeWidth={strokeWidth}
          />
          {/* Animated score meter */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 10px ${glowColor})`
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
            pointerEvents: 'none'
          }}
        >
          {size >= 110 ? (
            <>
              <span style={{ fontSize: Math.max(9, size * 0.11), color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                Authenticity
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontSize: Math.round(size * 0.28), fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                  {score}
                </span>
                <span style={{ fontSize: Math.round(size * 0.11), color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginLeft: '2px' }}>
                  /100
                </span>
              </div>
              <span style={{ fontSize: Math.max(8, size * 0.08), color: 'var(--blue-soft)', fontFamily: 'var(--font-mono)' }}>
                Conf: {Math.round(confidenceScore * 100)}%
              </span>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: `${Math.round(size * 0.36)}px`, fontWeight: 800, fontFamily: 'var(--font-mono)', color: strokeColor, lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: `${Math.max(7, Math.round(size * 0.13))}px`, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.5px', marginTop: '1px' }}>
                /100
              </span>
            </div>
          )}
        </div>
      </div>

      {!hideDetails && (
        <div style={{ marginTop: '14px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: strokeColor,
              textShadow: `0 0 12px ${glowColor}`
            }}
          >
            {assessment}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.4px' }}>
            MODEL-BASED AUTHENTICITY ASSESSMENT
          </div>
        </div>
      )}
    </div>
  );
};
