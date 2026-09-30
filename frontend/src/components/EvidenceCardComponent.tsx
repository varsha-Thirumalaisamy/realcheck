import React from 'react';
import { EvidenceCardItem } from '../types/forensics';
import { AlertCircle, CheckCircle, HelpCircle, Activity } from 'lucide-react';

interface EvidenceCardComponentProps {
  card: EvidenceCardItem;
  onClick?: () => void;
}

export const EvidenceCardComponent: React.FC<EvidenceCardComponentProps> = ({ card, onClick }) => {
  const isHighRisk = card.risk === 'High Risk' || card.score > 70;
  const isMediumRisk = card.risk === 'Medium Risk' || (card.score > 40 && card.score <= 70);
  const isLowRisk = card.risk === 'Low Risk' || card.score <= 40;

  const barColor = isHighRisk ? 'var(--risk-high)' : (isMediumRisk ? 'var(--risk-medium)' : (card.risk === 'Uncertain' ? 'var(--text-muted)' : 'var(--risk-low)'));
  const badgeClass = isHighRisk ? 'badge-risk-high' : (isMediumRisk ? 'badge-risk-medium' : (card.risk === 'Uncertain' ? 'badge-risk-uncertain' : 'badge-risk-low'));

  return (
    <div
      className="glass-panel"
      onClick={onClick}
      style={{
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.3px' }}>
            {card.title}
          </div>
          <span className={badgeClass}>
            {card.status}
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
          {card.explanation}
        </p>
      </div>

      <div>
        {/* Score indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
            Anomaly Indicator
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: barColor }}>
            {card.score.toFixed(0)}%
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#151f33',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(5, card.score))}%`,
              backgroundColor: barColor,
              boxShadow: `0 0 8px ${barColor}`
            }}
          />
        </div>
      </div>
    </div>
  );
};
