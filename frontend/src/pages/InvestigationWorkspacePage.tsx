import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { forensicApi } from '../services/api';
import { InvestigationResult } from '../types/forensics';
import { Loader2 } from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { LoadingState, EmptyState } from '../components/AppStates';

interface InvestigationWorkspacePageProps {
  onNavigate: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
  onGenerateReport: (caseId: string) => void;
}

type FilterType = 'All' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT';
type ViewState = 'list' | 'detail';

export const InvestigationWorkspacePage: React.FC<InvestigationWorkspacePageProps> = ({
  onNavigate,
  onSelectCase,
  onGenerateReport
}) => {
  const [cases, setCases] = useState<InvestigationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedCase, setSelectedCase] = useState<InvestigationResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    forensicApi.getInvestigations()
      .then(data => {
        if (isMounted) {
          setCases(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesFilter = activeFilter === 'All' || c.media_type === activeFilter;
    const matchesSearch = c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon size={14} />;
      case 'VIDEO': return <VideoIcon size={14} />;
      case 'AUDIO': return <Mic size={14} />;
      case 'TEXT': return <FileText size={14} />;
      default: return <FolderKanban size={14} />;
    }
  };

  const deriveStatus = (c: InvestigationResult) => {
    if (c.risk_level === 'High Risk' || c.risk_level === 'Medium Risk') return 'Review';
    return 'Completed';
  };

  const handleViewCase = (c: InvestigationResult) => {
    setSelectedCase(c);
    setViewState('detail');
  };

  if (isLoading) {
    return <LoadingState message="Loading workspace..." />;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px', width: '100%' }}>
      
      {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
      {viewState === 'list' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Investigation Workspace</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage, review, and report on forensic investigations.</p>
            </div>
            <button
              onClick={() => onNavigate('new-investigation')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            >
              <Plus size={16} /> New Investigation
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px' }}>
            
            {/* CASES TABLE */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Active Cases</h2>
              
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '4px' }}>
                  {(['All', 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'] as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      style={{
                        background: activeFilter === f ? 'var(--bg-body-pattern-1)' : 'transparent',
                        color: activeFilter === f ? 'var(--text-main)' : 'var(--text-muted)',
                        border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    placeholder="Search cases or files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px',
                      padding: '8px 12px 8px 34px', color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {filteredCases.length > 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-body-pattern-1)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
                        <th style={{ padding: '14px 16px', fontWeight: 600 }}>Case ID</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600 }}>Media</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600 }}>Filename</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600 }}>Created</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600 }}>Result</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((c, i) => {
                        const status = deriveStatus(c);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: 'transparent', transition: 'background 0.2s' }}>
                            <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)', fontWeight: 600 }}>
                              {c.case_id}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                {getMediaIcon(c.media_type)}
                                <span style={{ fontSize: '12px' }}>{c.media_type.charAt(0) + c.media_type.slice(1).toLowerCase()}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.file_name}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                              {new Date(c.timestamp).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                                background: c.risk_level === 'High Risk' ? 'rgba(239,68,68,0.1)' : c.risk_level === 'Medium Risk' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                color: c.risk_level === 'High Risk' ? 'var(--risk-high)' : c.risk_level === 'Medium Risk' ? 'var(--risk-medium)' : 'var(--risk-low)'
                              }}>
                                {c.risk_level}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: status === 'Review' ? 'var(--risk-medium)' : 'var(--text-muted)' }}>
                                {status === 'Review' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                                <span>{status}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleViewCase(c)}
                                style={{ background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon="folder"
                  title="No investigations found"
                  message="There are no cases matching your filters."
                  actionLabel="+ Start New Investigation"
                  onAction={() => onNavigate('new-investigation')}
                />
              )}
            </div>

            {/* REPORTS SECTION */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Generated Reports</h2>
              {filteredCases.filter(c => c.risk_level === 'High Risk').length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {filteredCases.filter(c => c.risk_level === 'High Risk').map((c, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <FileSpreadsheet size={16} />
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>Forensic Report</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{new Date(c.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{c.file_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{c.case_id}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', color: 'var(--risk-low)', borderRadius: '12px', fontWeight: 600 }}>Completed</span>
                        <button onClick={() => onGenerateReport(c.case_id)} style={{ background: 'none', border: 'none', color: 'var(--cyan-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Download PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="file"
                  title="No reports generated yet"
                  message="Open a case to generate a forensic report."
                />
              )}
            </div>
            
          </div>
        </>
      )}

      {/* ── DETAIL VIEW ──────────────────────────────────────────────────────── */}
      {viewState === 'detail' && selectedCase && (
        <>
          <button
            onClick={() => setViewState('list')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', marginBottom: '24px', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to Cases
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedCase.case_id}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{selectedCase.media_type} Investigation</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{selectedCase.file_name}</h1>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  onSelectCase(selectedCase.case_id);
                  onNavigate(selectedCase.media_type.toLowerCase());
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Open in Engine
              </button>
              <button
                onClick={() => onGenerateReport(selectedCase.case_id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--btn-primary-bg)', border: 'none', color: 'var(--btn-primary-text)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                <FileSpreadsheet size={16} /> Generate Report
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Media & AI Analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                  <Cpu size={16} /> AI Forensic Analysis
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <ScoreMeter
                    score={selectedCase.authenticity_score}
                    riskLevel={selectedCase.risk_level}
                    assessment={selectedCase.assessment}
                    confidenceScore={selectedCase.confidence_score}
                    size={200}
                  />
                </div>

                <div style={{ background: 'var(--bg-body-pattern-1)', borderRadius: '8px', padding: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Forensic Conclusion</strong>
                  {selectedCase.why_result_explanation}
                </div>

                {selectedCase.top_contributing_signals && selectedCase.top_contributing_signals.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>Primary Signals</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedCase.top_contributing_signals.map((sig, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-high)', marginTop: '5px', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{sig.signal}</span>
                            <span style={{ color: 'var(--text-muted)' }}> — {sig.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Metadata & Provenance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--blue-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                  <Fingerprint size={16} /> C2PA Provenance & Cryptography
                </div>
                
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px dashed var(--border-subtle)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <ShieldCheck size={24} color={selectedCase.metadata.software_signature ? 'var(--risk-low)' : 'var(--text-dim)'} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Content Credentials</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {selectedCase.metadata.software_signature ? 'Cryptographic provenance data found.' : 'No C2PA manifest attached to this file.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>Extracted Metadata</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  {[
                    { label: 'Filename', value: selectedCase.metadata.file_name },
                    { label: 'File Size', value: selectedCase.metadata.file_size_formatted },
                    { label: 'MIME Type', value: selectedCase.metadata.mime_type },
                    { label: 'Date Created', value: selectedCase.metadata.creation_time || 'Unknown' },
                    { label: 'Software', value: selectedCase.metadata.software_signature || 'None detected' },
                    { label: 'SHA-256 Hash', value: selectedCase.metadata.hash_sha256.slice(0, 16) + '...', mono: true },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{row.label}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: row.mono ? 'var(--font-mono)' : 'inherit' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                  Investigation Notes
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Automated intake completed via REALCHECK Hub. Case status is set to {deriveStatus(selectedCase)}. Media preserved in isolated environment. Report generation available via export.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <Clock size={12} /> Last updated: {new Date(selectedCase.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
