import React from 'react';
import { X, HelpCircle, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { InvestigationResult } from '../types/forensics';

interface WhyThisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: InvestigationResult;
  onInvestigateDeeper?: () => void;
}

export const WhyThisResultModal: React.FC<WhyThisResultModalProps> = ({
  isOpen,
  onClose,
  result,
  onInvestigateDeeper
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-glow forensic-corner"
        style={{
          width: '740px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: '#0c1324',
          borderColor: 'rgba(0, 240, 255, 0.4)',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle size={18} color="#00f0ff" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                Why Did REALCHECK AI Reach This Assessment?
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                EXPLAINABLE AI EVIDENCE TRAIL &bull; CASE {result.case_id}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Executive Assessment Box */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              Final Authenticity Determination
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: result.authenticity_score <= 30 ? 'var(--risk-high)' : (result.authenticity_score <= 60 ? 'var(--risk-medium)' : 'var(--risk-low)'), marginTop: '2px' }}>
              {result.assessment}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)' }}>
              {result.authenticity_score} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence: {Math.round(result.confidence_score * 100)}%</div>
          </div>
        </div>

        {/* Section 1: Top Contributing Signals */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue-soft)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Top Contributing Forensic Signals
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.top_contributing_signals.map((sig, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan-primary)', fontWeight: 700 }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    {sig.signal}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    className={
                      sig.impact.toLowerCase().includes('strong')
                        ? 'badge-risk-high'
                        : sig.impact.toLowerCase().includes('mod')
                        ? 'badge-risk-medium'
                        : 'badge-risk-low'
                    }
                  >
                    {sig.impact} Impact
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                    {sig.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Human-Language Interpretation */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue-soft)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Plain-English Forensic Interpretation
          </div>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderLeft: '4px solid #00f0ff',
              padding: '14px 18px',
              borderRadius: '0 6px 6px 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--risk-uncertain-text)',
              whiteSpace: 'pre-wrap'
            }}
          >
            {result.why_result_explanation}
          </div>
        </div>

        {/* Section 3: Limitations & Disclaimer */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '11px',
            color: '#fca5a5',
            lineHeight: 1.5,
            display: 'flex',
            gap: '10px'
          }}
        >
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Forensic Limitations Notice:</strong> {result.limitations} AI detection is probabilistic and should be corroborated by human digital forensic investigators rather than treated as definitive proof.
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn-cyber-secondary">
            Close Panel
          </button>
          {onInvestigateDeeper && (
            <button
              onClick={() => {
                onClose();
                onInvestigateDeeper();
              }}
              className="btn-cyber-primary"
            >
              <span>Investigate Deeper</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
