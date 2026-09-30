import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface LiveScanAnimationProps {
  mediaType: string;
  onComplete: () => void;
}

export const LiveScanAnimation: React.FC<LiveScanAnimationProps> = ({
  mediaType,
  onComplete
}) => {
  const steps = [
    { num: '01', title: 'FILE VALIDATION', desc: 'Validating MIME headers & SHA-256 cryptographic checksum' },
    { num: '02', title: 'MEDIA CLASSIFICATION', desc: `Detecting stream parameters for ${mediaType} processing` },
    { num: '03', title: 'FEATURE EXTRACTION', desc: 'Isolating spatial gradients, frequency spectrum & temporal cues' },
    { num: '04', title: 'AI MODEL ANALYSIS', desc: 'Running deep vision / acoustic / stylometric neural network' },
    { num: '05', title: 'FORENSIC ANALYSIS', desc: 'Checking PRNU sensor residuals, Fourier harmonics & artifacts' },
    { num: '06', title: 'EVIDENCE FUSION', desc: 'Aggregating probabilistic multi-signal cross-evidence vectors' },
    { num: '07', title: 'EXPLAINABILITY', desc: 'Synthesizing Grad-CAM heatmap & token/spectral attribution saliency' },
    { num: '08', title: 'AUTHENTICITY ASSESSMENT', desc: 'Calculating calibrated probability score & risk classification' },
    { num: '09', title: 'REPORT READY', desc: 'Compiling evidence dossier & cryptographic provenance docket' }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 380); // Total animation ~3.5 seconds

    return () => clearInterval(timer);
  }, [onComplete, steps.length]);

  const progressPct = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div
      className="glass-panel-glow forensic-corner"
      style={{
        padding: '32px',
        maxWidth: '720px',
        margin: '0 auto',
        backgroundColor: '#0a0f1d'
      }}
    >
      {/* Laser horizontal scanning line */}
      <div className="scanner-laser" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid #00f0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Activity size={20} color="#00f0ff" className="radar-sweep" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px', color: 'var(--text-main)' }}>
              FORENSIC PIPELINE IN EXECUTION
            </div>
            <div style={{ fontSize: '11px', color: 'var(--blue-soft)', letterSpacing: '0.5px' }}>
              MULTI-SIGNAL EVIDENCE EXTRACTION &bull; {mediaType} ENGINE
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)' }}>
            {progressPct}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>PROGRESS</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#151f33',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
            boxShadow: '0 0 10px #00f0ff',
            transition: 'width 0.35s ease'
          }}
        />
      </div>

      {/* Step Sequence List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '6px',
                background: isCurrent ? 'rgba(0, 240, 255, 0.1)' : (isDone ? 'rgba(16, 185, 129, 0.04)' : 'rgba(15, 23, 42, 0.4)'),
                border: isCurrent ? '1px solid rgba(0, 240, 255, 0.4)' : (isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'),
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isCurrent ? 'var(--cyan-primary)' : (isDone ? 'var(--risk-low)' : 'var(--text-dim)')
                  }}
                >
                  {step.num}
                </span>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.6px',
                      color: isCurrent ? 'var(--text-main)' : (isDone ? '#e2e8f0' : 'var(--text-dim)')
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={{ fontSize: '11px', color: isCurrent ? 'var(--blue-soft)' : 'var(--text-dim)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              <div>
                {isDone && <CheckCircle2 size={16} color="#10b981" />}
                {isCurrent && <Loader2 size={16} color="#00f0ff" style={{ animation: 'spin 1s linear infinite' }} />}
                {isPending && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--border-subtle)', display: 'inline-block' }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
