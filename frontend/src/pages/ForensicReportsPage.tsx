import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileCode,
  Share2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import { forensicApi } from '../services/api';
import { InvestigationResult } from '../types/forensics';
import { SAMPLE_CASES } from '../data/sampleCases';
import { LoadingState, ErrorState, EmptyState } from '../components/AppStates';

interface ForensicReportsPageProps {
  selectedCaseId?: string;
  onNavigate: (tab: string, caseId?: string) => void;
}

export const ForensicReportsPage: React.FC<ForensicReportsPageProps> = ({
  selectedCaseId,
  onNavigate
}) => {
  const { caseId: routeCaseId } = useParams<{ caseId?: string }>();
  
  // Available initial sample cases as fast in-memory fallback
  const sampleList = useMemo(() => Object.values(SAMPLE_CASES), []);
  
  // Derive effective initial ID
  const effectiveId = routeCaseId || selectedCaseId || (sampleList[0]?.case_id ?? '');

  const [activeId, setActiveId] = useState<string>(effectiveId);
  const [allCases, setAllCases] = useState<InvestigationResult[]>(sampleList);
  const [currentCase, setCurrentCase] = useState<InvestigationResult | null>(() => {
    return SAMPLE_CASES[effectiveId] || sampleList[0] || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!currentCase);
  const [error, setError] = useState<string | null>(null);

  // Switch report case smoothly with zero latency if already in memory
  const handleSelectReport = useCallback((caseId: string, updateUrl = true) => {
    setActiveId(caseId);
    setError(null);

    const cached = allCases.find((c) => c.case_id === caseId) || SAMPLE_CASES[caseId];
    if (cached) {
      setCurrentCase(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      forensicApi.getInvestigation(caseId)
        .then((fetched) => {
          setCurrentCase(fetched);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching report:', err);
          setError(`Unable to load investigation report for case ID: ${caseId}`);
          setIsLoading(false);
        });
    }

    if (updateUrl && onNavigate) {
      onNavigate('reports', caseId);
    }
  }, [allCases, onNavigate]);

  // Sync if route caseId changes externally
  useEffect(() => {
    const target = routeCaseId || selectedCaseId;
    if (target && target !== activeId && target !== 'undefined' && target !== 'null') {
      handleSelectReport(target, false);
    }
  }, [routeCaseId, selectedCaseId, activeId, handleSelectReport]);

  // Fetch full investigations from backend once on mount without blocking initial UI
  useEffect(() => {
    let isMounted = true;

    forensicApi.getInvestigations()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setAllCases(data);
          
          const currentId = activeId || data[0].case_id;
          const found = data.find((c) => c.case_id === currentId);
          if (found) {
            setCurrentCase(found);
            setIsLoading(false);
          } else if (!currentCase) {
            setCurrentCase(data[0]);
            setActiveId(data[0].case_id);
            setIsLoading(false);
          }
        } else if (!currentCase && sampleList.length === 0) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load investigations list:', err);
        if (isMounted) {
          if (!currentCase && sampleList.length === 0) {
            setError('Failed to load forensic reports from server.');
          }
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (currentCase?.case_id) {
      forensicApi.downloadJson(currentCase.case_id);
    }
  };

  const handleDownloadCsv = () => {
    if (currentCase?.case_id) {
      forensicApi.downloadCsv(currentCase.case_id);
    }
  };

  // Loading state
  if (isLoading && !currentCase) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '60px clamp(16px, 3vw, 28px) 80px' }}>
        <LoadingState message="Retrieving forensic report dossier..." />
      </div>
    );
  }

  // Error state
  if (error && !currentCase) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '60px clamp(16px, 3vw, 28px) 80px' }}>
        <ErrorState
          title="Forensic Report Unavailable"
          message={error}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            if (activeId) {
              forensicApi.getInvestigation(activeId)
                .then((data) => {
                  setCurrentCase(data);
                  setIsLoading(false);
                })
                .catch((err) => {
                  setError(`Unable to load investigation report: ${err.message || 'Server error'}`);
                  setIsLoading(false);
                });
            }
          }}
        />
      </div>
    );
  }

  // Empty state
  if (!currentCase) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '60px clamp(16px, 3vw, 28px) 80px' }}>
        <EmptyState
          icon="file"
          title="No Reports Found"
          message="No forensic investigation reports were found. Run a new investigation to generate a certified dossier."
          actionLabel="New Investigation"
          onAction={() => onNavigate('new-investigation')}
        />
      </div>
    );
  }

  const isHighRisk = currentCase.authenticity_score <= 30;
  const isMediumRisk = currentCase.authenticity_score > 30 && currentCase.authenticity_score <= 60;
  const scoreColor = isHighRisk ? '#ef4444' : (isMediumRisk ? '#f59e0b' : '#10b981');

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px clamp(16px, 3vw, 28px) 80px' }}>
      {/* Header Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              FORENSIC DOSSIER GENERATOR
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CHAIN OF CUSTODY VERIFICATION</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px', marginTop: '2px' }}>
            DIGITAL MEDIA AUTHENTICITY REPORT
          </h1>
        </div>

        {/* Export Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-cyber-primary" style={{ fontSize: '12px' }}>
            <Printer size={15} />
            <span>PRINT / SAVE AS PDF</span>
          </button>

          <button onClick={handleDownloadJson} className="btn-cyber-secondary" style={{ fontSize: '12px' }}>
            <FileCode size={15} />
            <span>EXPORT JSON</span>
          </button>

          <button onClick={handleDownloadCsv} className="btn-cyber-secondary" style={{ fontSize: '12px' }}>
            <FileSpreadsheet size={15} />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Case Selector Pills (hidden in print) */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>Select Report:</span>
        {allCases.map((c) => (
          <button
            key={c.case_id}
            onClick={() => handleSelectReport(c.case_id)}
            style={{
              background: activeId === c.case_id ? 'rgba(0, 240, 255, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              border: activeId === c.case_id ? '1px solid #00f0ff' : '1px solid rgba(56, 189, 248, 0.15)',
              color: activeId === c.case_id ? '#00f0ff' : '#94a3b8',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c.case_id} &bull; {c.media_type}
          </button>
        ))}
      </div>

      {/* REPORT DOCKET CONTAINER (Optimized for both screen and print) */}
      <div
        className="glass-panel forensic-corner"
        style={{
          padding: '40px',
          backgroundColor: '#0a0f1e',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Report Official Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '2px solid #00f0ff',
            paddingBottom: '20px',
            marginBottom: '24px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: '#f8fafc' }}>
                REALCHECK
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  background: '#00f0ff',
                  color: '#030a16',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                AI
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.8px', marginTop: '4px' }}>
              DIGITAL MEDIA AUTHENTICITY & FORENSIC INVESTIGATION REPORT
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#00f0ff' }}>
              CASE ID: {currentCase?.case_id}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Generated: {currentCase?.timestamp ? new Date(currentCase.timestamp).toUTCString() : new Date().toUTCString()}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Classification: RESTRICTED FORENSIC DOSSIER
            </div>
          </div>
        </div>

        {/* Verdict Callout Banner */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            borderLeft: `6px solid ${scoreColor}`,
            borderRadius: '6px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
              Model-Based Authenticity Assessment
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: scoreColor, marginTop: '2px' }}>
              {currentCase?.assessment}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
              Risk Level: <strong>{currentCase?.risk_level}</strong> &bull; System Confidence: <strong>{currentCase?.confidence_level} ({Math.round(currentCase?.confidence_score * 100)}%)</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
              {currentCase?.authenticity_score} <span style={{ fontSize: '16px', color: '#64748b' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
              AUTHENTICITY INDEX
            </div>
          </div>
        </div>

        {/* Probability Matrix 4 Columns */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Probabilistic Metrics Matrix
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>AI Generation Prob</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: (currentCase?.ai_generation_probability || 0) > 70 ? '#f87171' : '#34d399' }}>
                {(currentCase?.ai_generation_probability || 0).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Manipulation Risk</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: (currentCase?.manipulation_risk || 0) > 50 ? '#fbbf24' : '#34d399' }}>
                {(currentCase?.manipulation_risk || 0).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Forensic Anomaly</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                {(currentCase?.forensic_anomaly_score || 0).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Metadata Risk</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                {(currentCase?.metadata_risk_score || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Forensic Signals Table */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Forensic Signals &amp; Evidence Log
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                <th style={{ padding: '10px 12px' }}>Signal Name</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Strength</th>
                <th style={{ padding: '10px 12px' }}>Score</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Forensic Finding</th>
              </tr>
            </thead>
            <tbody>
              {currentCase?.signals.map((sig, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.08)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>{sig.name}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{sig.category}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={sig.strength === 'Strong' ? 'badge-risk-high' : 'badge-risk-medium'}>
                      {sig.strength}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{sig.score.toFixed(1)}%</td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>{sig.status}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{sig.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentCase?.media_type === 'TEXT' && currentCase?.text_metrics && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Text Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              {currentCase.text_metrics.word_count !== undefined && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Word Count</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                    {currentCase.text_metrics.word_count}
                  </div>
                </div>
              )}
              {currentCase.text_metrics.sentence_count !== undefined && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Sentence Count</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                    {currentCase.text_metrics.sentence_count}
                  </div>
                </div>
              )}
              {currentCase.text_metrics.burstiness_score !== undefined && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Burstiness</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                    {currentCase.text_metrics.burstiness_score.toFixed(2)}
                  </div>
                </div>
              )}
              {currentCase.text_metrics.vocabulary_richness_ttr !== undefined && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Vocabulary Richness</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                    {currentCase.text_metrics.vocabulary_richness_ttr.toFixed(2)}
                  </div>
                </div>
              )}
              {currentCase.text_metrics.perplexity_score !== undefined && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Perplexity</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                    {currentCase.text_metrics.perplexity_score}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Executive Interpretation */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Executive Reasoning &amp; Explainability Trail
          </div>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderLeft: '4px solid #00f0ff',
              padding: '14px 18px',
              borderRadius: '0 6px 6px 0',
              fontSize: '13px',
              color: '#cbd5e1',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}
          >
            {currentCase?.why_result_explanation}
          </div>
        </div>

        {/* Cryptographic Provenance */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
            File Provenance &amp; Checksum
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '4px' }}>
              <span style={{ color: '#64748b' }}>File Name:</span> <strong style={{ color: '#f8fafc' }}>{currentCase?.file_name}</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '4px' }}>
              <span style={{ color: '#64748b' }}>MIME Container:</span> <strong style={{ color: '#f8fafc' }}>{currentCase?.metadata.mime_type}</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '4px', gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b' }}>SHA-256 Checksum:</span>{' '}
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{currentCase?.metadata.hash_sha256}</strong>
            </div>
          </div>
        </div>

        {/* Forensic Limitations & Methodology Disclaimer */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '11px',
            color: '#fca5a5',
            lineHeight: 1.5,
            marginBottom: '20px'
          }}
        >
          <strong>Forensic Limitations Notice:</strong> {currentCase?.limitations} {currentCase?.disclaimer}
        </div>

        {/* Docket Footer */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b'
          }}
        >
          <div>REALCHECK AI &bull; Forensic Docket &bull; Verification Hash: {currentCase?.metadata?.hash_sha256 ? currentCase.metadata.hash_sha256.slice(0, 16) : 'VERIFIED'}</div>
          <div>Page 1 of 1 &bull; Certified Computational Forensics</div>
        </div>
      </div>
    </div>
  );
};
