import { forensicApi } from '../services/api';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';
import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, ShieldAlert, FileText, Image as ImageIcon, Video, Mic, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
  onNavigate: (tab: string, caseId?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectCase,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [allCases, setAllCases] = useState<InvestigationResult[]>(Object.values(SAMPLE_CASES));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      forensicApi.getInvestigations()
        .then((cases) => {
          if (cases && cases.length > 0) {
            setAllCases(cases);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Show High-Risk Videos (Deepfake Press Statement)', icon: Video, action: () => { onNavigate('video', 'RC-2026-0043'); onSelectCase('RC-2026-0043'); onClose(); } },
    { label: 'Find Suspicious Image Regions (Grad-CAM Diffusion)', icon: ImageIcon, action: () => { onNavigate('image', 'RC-2026-0042'); onSelectCase('RC-2026-0042'); onClose(); } },
    { label: 'Open Case RC-2026-0044 (AI Voice Clone Speech)', icon: Mic, action: () => { onNavigate('audio', 'RC-2026-0044'); onSelectCase('RC-2026-0044'); onClose(); } },
    { label: 'Analyze Text Stylometry (RC-2026-0045 Memo)', icon: FileText, action: () => { onNavigate('text', 'RC-2026-0045'); onSelectCase('RC-2026-0045'); onClose(); } },
    { label: 'Launch Cross-Media Evidence Workspace', icon: ShieldAlert, action: () => { onNavigate('workspace'); onClose(); } },
    { label: 'View Centralized Explainable AI Hub', icon: Sparkles, action: () => { onNavigate('ai-hub'); onClose(); } },
  ];

  const filteredCases = allCases.filter(c => {
    if (!c) return false;
    const q = query.toLowerCase();
    const id = String(c.case_id || '').toLowerCase();
    const name = String(c.file_name || '').toLowerCase();
    const assess = String(c.assessment || '').toLowerCase();
    const type = String(c.media_type || '').toLowerCase();
    return id.includes(q) || name.includes(q) || assess.includes(q) || type.includes(q);
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel forensic-corner"
        style={{
          width: '640px',
          maxWidth: '92vw',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 240, 255, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '12px',
            background: 'var(--bg-card-solid)'
          }}
        >
          <Search size={18} color="var(--cyan-primary)" style={{ flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search evidence, cases, files, findings... (e.g. 'deepfake', 'RC-2026-0042')"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              caretColor: 'var(--cyan-primary)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-dim)', cursor: 'pointer', padding: '3px 6px', fontSize: '10px' }}
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '14px 16px', background: 'var(--bg-card-solid)' }}>
          {query.trim() === '' ? (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', paddingLeft: '4px', fontWeight: 700 }}>
                Suggested Forensic Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={idx}
                      onClick={action.action}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'var(--bg-deep)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'var(--cyan-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-deep)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} color="var(--cyan-primary)" />
                        <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>{action.label}</span>
                      </div>
                      <ArrowRight size={14} color="var(--text-dim)" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', paddingLeft: '4px', fontWeight: 700 }}>
                Matching Investigations ({filteredCases.length})
              </div>
              {filteredCases.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                  No matching forensic records found for "{query}".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredCases.map((c) => (
                    <div
                      key={c.case_id}
                      onClick={() => {
                        onNavigate(String(c.media_type || 'overview').toLowerCase(), c.case_id || '');
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'var(--bg-deep)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cyan-primary)';
                        e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-deep)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                            {c.case_id}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>&bull; {c.media_type}</span>
                          <span
                            className={
                              c.authenticity_score <= 30
                                ? 'badge-risk-high'
                                : c.authenticity_score <= 60
                                ? 'badge-risk-medium'
                                : 'badge-risk-low'
                            }
                            style={{ fontSize: '10px', padding: '1px 6px' }}
                          >
                            {c.assessment}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>
                          {c.file_name}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                          {c.authenticity_score}/100
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--bg-deep)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-dim)'
          }}
        >
          <span>Use <strong>Esc</strong> to close</span>
          <span>REALCHECK AI Forensics Command Center</span>
        </div>
      </div>
    </div>
  );
};
