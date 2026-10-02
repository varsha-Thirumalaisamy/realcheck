import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  RotateCcw,
  Upload
} from 'lucide-react';

export type PipelineStepStatus = 'pending' | 'processing' | 'success' | 'error';

export interface PipelineStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle?: string;
  status: PipelineStepStatus;
}

export interface PipelineMetadata {
  fileName?: string;
  fileSize?: string;
  dimensionsOrDuration?: string;
  modelName?: string;
  inferenceTimeMs?: number;
}

export interface PipelineErrorDetails {
  stage: string;
  reason: string;
  action?: string;
  requestId?: string;
}

interface ForensicPipelineProps {
  steps: PipelineStep[];
  overallPhase: 'idle' | 'uploaded' | 'loading' | 'preprocessing' | 'inference' | 'completed' | 'error';
  metadata?: PipelineMetadata;
  hasInput: boolean;
  inputBadgeText?: string;
  error?: PipelineErrorDetails | null;
  onClearError?: () => void;
  onRetry?: () => void;
  onContinueWithDemo?: () => void;
}

export const ForensicPipeline: React.FC<ForensicPipelineProps> = ({
  steps,
  overallPhase,
  metadata,
  hasInput,
  inputBadgeText,
  error,
  onClearError,
  onRetry,
  onContinueWithDemo
}) => {
  const isCompleted = overallPhase === 'completed';
  const isRunning = ['uploaded', 'loading', 'preprocessing', 'inference'].includes(overallPhase);
  const isError = overallPhase === 'error';

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Error state card if analysis failed */}
      {error && (
        <div
          className="glass-panel"
          style={{
            marginBottom: '16px',
            padding: '18px 22px',
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.14) 0%, rgba(26, 12, 18, 0.95) 100%)',
            border: '1px solid var(--risk-high)',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid var(--risk-high)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f87171', letterSpacing: '0.5px', margin: 0 }}>
                  FORENSIC INFERENCE FAILED
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Execution stopped at Stage: <strong style={{ color: '#f87171' }}>{error.stage}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {onContinueWithDemo && (
                <button
                  onClick={onContinueWithDemo}
                  style={{
                    fontSize: '11px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(199, 36, 177, 0.4)'
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Continue with Demo Analysis</span>
                </button>
              )}
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="btn-cyber-secondary"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  <RotateCcw size={12} style={{ marginRight: '5px' }} />
                  Clear
                </button>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="btn-cyber-primary"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  <Upload size={12} style={{ marginRight: '5px' }} />
                  Retry
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>Failed Stage</div>
              <div style={{ color: '#fca5a5', fontWeight: 700 }}>{error.stage}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>Reason</div>
              <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{error.reason}</div>
            </div>
            {error.action && (
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>Recommended Action</div>
                <div style={{ color: '#fed7aa', fontWeight: 600 }}>{error.action}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Glassmorphic/Claymorphic Pipeline Container */}
      <div
        style={{
          padding: '18px 22px',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--clay-box-shadow)'
        }}
      >
        {/* Upper status header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            marginBottom: '14px'
          }}
        >
          {/* Input status badge & file metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: hasInput 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)' 
                  : 'rgba(255, 75, 114, 0.15)',
                border: `1px solid ${hasInput ? 'var(--risk-low)' : 'var(--risk-high)'}`,
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                color: hasInput ? '#34D399' : '#FF6B8B',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)'
              }}
            >
              {hasInput ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>{inputBadgeText || (hasInput ? 'UPLOAD SUCCESSFUL' : 'AWAITING INPUT')}</span>
            </div>

            {metadata?.fileName && (
              <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>FILE:</span>
                <span style={{ color: 'var(--magenta-vivid)', fontFamily: 'var(--font-mono)' }}>{metadata.fileName}</span>
              </div>
            )}

            {metadata?.dimensionsOrDuration && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-dim)', marginRight: '4px' }}>METRIC:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{metadata.dimensionsOrDuration}</span>
                {metadata.fileSize && (
                  <>
                    <span style={{ margin: '0 6px', color: 'var(--text-dim)' }}>&bull;</span>
                    <span style={{ color: 'var(--text-dim)', marginRight: '4px' }}>SIZE:</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{metadata.fileSize}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Model information & Inference status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>MODEL:</span>
              <span style={{ color: 'var(--violet-electric)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {metadata?.modelName || 'REALCHECK Multi-Signal Forensic Engine'}
              </span>
            </div>

            <div
              style={{
                background: isCompleted
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)'
                  : isError
                    ? 'rgba(255, 75, 114, 0.2)'
                    : isRunning
                      ? 'linear-gradient(135deg, rgba(199, 36, 177, 0.25) 0%, rgba(157, 78, 221, 0.25) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${
                  isCompleted
                    ? 'var(--risk-low)'
                    : isError
                      ? 'var(--risk-high)'
                      : isRunning
                        ? 'var(--magenta-vivid)'
                        : 'rgba(255, 255, 255, 0.1)'
                }`,
                padding: '4px 12px',
                borderRadius: '9999px',
                color: isCompleted
                  ? '#34D399'
                  : isError
                    ? '#FF6B8B'
                    : isRunning
                      ? '#FFFFFF'
                      : 'var(--text-dim)',
                fontWeight: 800,
                fontSize: '10px',
                letterSpacing: '0.6px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)'
              }}
            >
              {isCompleted
                ? 'INFERENCE COMPLETED'
                : isError
                  ? 'INFERENCE STOPPED'
                  : isRunning
                    ? 'INFERENCE RUNNING'
                    : 'AWAITING PIPELINE'}
            </div>
          </div>
        </div>

        {/* Dynamic Stepper Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(170px, 1fr))`,
            gap: '8px'
          }}
        >
          {steps.map((step) => {
            const isDone = step.status === 'success';
            const isActive = step.status === 'processing';
            const isStepErr = step.status === 'error';
            const isPending = step.status === 'pending';

            const borderColor = isStepErr
              ? 'var(--risk-high)'
              : (isDone 
                ? 'var(--risk-low)' 
                : (isActive 
                  ? 'var(--border-active)' 
                  : 'rgba(157, 78, 221, 0.15)'));

            const bgColor = isStepErr
              ? 'rgba(255, 75, 114, 0.12)'
              : (isDone
                ? 'rgba(16, 185, 129, 0.12)'
                : (isActive
                  ? 'linear-gradient(135deg, rgba(199, 36, 177, 0.22) 0%, rgba(157, 78, 221, 0.22) 100%)'
                  : '#150C20'));

            const iconBg = isStepErr
              ? '#FF4B72'
              : (isDone
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : (isActive
                  ? 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)'
                  : 'rgba(157, 78, 221, 0.2)'));

            const textColor = isStepErr
              ? '#FF6B8B'
              : (isDone
                ? '#34D399'
                : (isActive
                  ? '#FFFFFF'
                  : 'var(--text-muted)'));

            return (
              <div
                key={step.id}
                style={{
                  padding: '11px 13px',
                  borderRadius: '14px',
                  border: `1px solid ${borderColor}`,
                  background: bgColor,
                  boxShadow: isActive
                    ? '0 8px 18px rgba(157, 78, 221, 0.35), inset 2px 2px 4px rgba(255, 255, 255, 0.2), inset -2px -2px 5px rgba(0, 0, 0, 0.5)'
                    : 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '9px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: '23px',
                    height: '23px',
                    borderRadius: '50%',
                    background: iconBg,
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isDone || isActive || isStepErr ? '0 2px 8px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.4)' : 'none',
                    marginTop: '1px'
                  }}
                >
                  {isDone ? (
                    '✓'
                  ) : isStepErr ? (
                    '✕'
                  ) : isActive ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    step.stepNumber
                  )}
                </div>

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: textColor,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isPending ? 'var(--text-dim)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      marginTop: '2px'
                    }}
                  >
                    {step.subtitle || (isDone ? 'Complete' : isActive ? 'Processing...' : 'Awaiting')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
