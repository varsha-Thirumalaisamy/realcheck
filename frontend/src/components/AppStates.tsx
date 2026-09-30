import React from 'react';
import { Loader2, AlertTriangle, RotateCcw, FolderKanban, ShieldAlert, FileText, Settings, ServerCrash } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  stages?: { name: string; status: 'completed' | 'processing' | 'pending' }[];
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Analysis in progress...",
  stages
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', padding: '40px' }}>
      <Loader2 size={32} className="animate-spin" color="var(--cyan-primary)" style={{ marginBottom: '16px' }} />
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>
        {message}
      </div>

      {stages && stages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px', background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {stages.map((stage, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              {stage.status === 'completed' && <span style={{ color: 'var(--risk-low)', fontWeight: 700 }}>✓</span>}
              {stage.status === 'processing' && <Loader2 size={12} className="animate-spin" color="var(--cyan-primary)" />}
              {stage.status === 'pending' && <span style={{ color: 'var(--text-dim)' }}>○</span>}
              
              <span style={{ 
                color: stage.status === 'completed' ? 'var(--text-main)' : stage.status === 'processing' ? 'var(--cyan-primary)' : 'var(--text-dim)',
                fontWeight: stage.status === 'processing' ? 600 : 400
              }}>
                {stage.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Analysis couldn't be completed.", 
  message,
  onRetry 
}) => {
  // Sanitize message to prevent exposing stack traces or internal paths
  const safeMessage = (msg: string | undefined) => {
    if (!msg) return "An unexpected forensic engine error occurred.";
    if (msg.includes('Traceback') || msg.includes('Error:') || msg.includes('/var/') || msg.includes('C:\\') || msg.includes('SQL')) {
      return "A systemic error occurred during analysis. Please verify the media format and try again.";
    }
    return msg;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', padding: '40px', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <ServerCrash size={28} color="var(--risk-high)" />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.5, marginBottom: '24px' }}>
        {safeMessage(message)}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <RotateCcw size={14} /> Try Again
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: 'folder' | 'shield' | 'file' | 'settings';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = 'folder',
  title, 
  message, 
  actionLabel, 
  onAction 
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'shield': return <ShieldAlert size={36} />;
      case 'file': return <FileText size={36} />;
      case 'settings': return <Settings size={36} />;
      case 'folder':
      default: return <FolderKanban size={36} />;
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-subtle)', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>
        {getIcon()}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto 24px', lineHeight: 1.5 }}>{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{ background: 'var(--btn-primary-bg)', border: 'none', color: 'var(--btn-primary-text)', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
