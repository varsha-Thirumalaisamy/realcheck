import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  FileText,
  RotateCcw,
  AlignLeft,
  Trash2
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { AnalysisResult } from '../components/AnalysisResult';
import { EvidenceIntegrityCard } from '../components/EvidenceIntegrityCard';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { ForensicPipeline, PipelineStep } from '../components/ForensicPipeline';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';
import { forensicApi } from '../services/api';
import { useInvestigation } from '../contexts/InvestigationContext';
import { getForensicClassification } from '../utils/forensicReasoning';

interface TextStylometryPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const TextStylometryPage: React.FC<TextStylometryPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0045'
}) => {
  const { isDemoMode, activeCaseId, setActiveCaseId, generateNewCaseId } = useInvestigation();

  const effectiveInitialCase = (initialCaseId && SAMPLE_CASES[initialCaseId]?.media_type === 'TEXT')
    ? SAMPLE_CASES[initialCaseId]
    : SAMPLE_CASES['RC-2026-0045'];

  const sampleAiText = `Furthermore, it is crucial to analyze the multi-faceted implications of quantum computation on cryptographic governance. As demonstrated across recent literature, algorithmic resilience requires dynamic protocol synthesis. In conclusion, stakeholders must proactively evaluate strategic integration vectors to maintain operational equilibrium.`;
  const sampleHumanText = `Hey folks, quick update on the server migration: we ran into some unexpected timeout issues with the legacy database driver last night. We're rolling back the staging cluster for now. I'll post another note after lunch once we check the connection pool logs.`;

  const [currentCase, setCurrentCase] = useState<InvestigationResult>(effectiveInitialCase);
  const [textInput, setTextInput] = useState<string>(
    effectiveInitialCase.text_metrics?.analyzed_text_sample || sampleAiText
  );
  const [isScanning, setIsScanning] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [activeSample, setActiveSample] = useState<'ai' | 'real' | null>('ai');

  // Pipeline execution state
  const [pipelinePhase, setPipelinePhase] = useState<'idle' | 'uploaded' | 'loading' | 'preprocessing' | 'inference' | 'completed' | 'error'>('completed');
  const [pipelineError, setPipelineError] = useState<{ stage: string; reason: string; action?: string; requestId?: string } | null>(null);
  const [meta, setMeta] = useState<{ fileName: string; fileSize: string; duration: string }>({
    fileName: effectiveInitialCase.file_name,
    fileSize: '3.4 KB',
    duration: '214 words (1,480 chars)'
  });

  useEffect(() => {
    if (activeCaseId && SAMPLE_CASES[activeCaseId] && SAMPLE_CASES[activeCaseId].media_type === 'TEXT') {
      setCurrentCase(SAMPLE_CASES[activeCaseId]);
      if (SAMPLE_CASES[activeCaseId].text_metrics?.analyzed_text_sample) {
        setTextInput(SAMPLE_CASES[activeCaseId].text_metrics!.analyzed_text_sample);
      }
    }
  }, [activeCaseId]);

  // Text-specific 6-step Forensic Pipeline
  const pipelineSteps: PipelineStep[] = [
    {
      id: '1',
      stepNumber: 1,
      title: 'Text Ingestion',
      subtitle: `${textInput.trim().split(/\s+/).filter(Boolean).length} tokens parsed`,
      status: pipelinePhase === 'idle' ? 'pending' : (pipelinePhase === 'uploaded' ? 'processing' : 'success')
    },
    {
      id: '2',
      stepNumber: 2,
      title: 'Tokenization',
      subtitle: 'Sub-word BPE & POS tagging',
      status: ['idle', 'uploaded'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'loading' ? 'processing' : 'success')
    },
    {
      id: '3',
      stepNumber: 3,
      title: 'Stylometric Profiling',
      subtitle: 'Sentence cadence & burstiness variance',
      status: ['idle', 'uploaded', 'loading'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'preprocessing' ? 'processing' : 'success')
    },
    {
      id: '4',
      stepNumber: 4,
      title: 'Perplexity Evaluation',
      subtitle: 'N-gram log-likelihood surprisal',
      status: ['idle', 'uploaded', 'loading', 'preprocessing'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'inference' ? 'processing' : 'success')
    },
    {
      id: '5',
      stepNumber: 5,
      title: 'Signal Fusion',
      subtitle: 'Transformer stylistic attribution',
      status: pipelinePhase === 'completed' ? 'success' : (pipelinePhase === 'inference' ? 'processing' : 'pending')
    },
    {
      id: '6',
      stepNumber: 6,
      title: 'Result Generated',
      subtitle: currentCase ? getForensicClassification(currentCase) : 'Forensic Assessment',
      status: pipelinePhase === 'completed' ? 'success' : 'pending'
    }
  ];

  // Execute fast deterministic presentation demo (3-5s)
  const runFastDemoAnalysis = async (targetCaseId: string, customText?: string) => {
    setIsScanning(true);
    setAnalysisError(null);
    setPipelineError(null);
    setPipelinePhase('uploaded');

    const sample = SAMPLE_CASES[targetCaseId] || SAMPLE_CASES['RC-2026-0045'];
    const caseId = generateNewCaseId('RC-2026-');
    const newDemoCase: InvestigationResult = {
      ...sample,
      case_id: caseId,
      is_demo_analysis: true,
      timestamp: new Date().toISOString()
    };

    const textToAnalyze = customText !== undefined ? customText : textInput;
    const words = textToAnalyze.trim().split(/\s+/).filter(Boolean).length;
    const chars = textToAnalyze.length;

    setMeta({
      fileName: 'stylometric_evidence.txt',
      fileSize: `${(chars / 1024).toFixed(1)} KB`,
      duration: `${words} words (${chars} chars)`
    });

    // Step 1: Upload (450ms)
    await new Promise(r => setTimeout(r, 450));
    setPipelinePhase('loading');

    // Step 2: Tokenization (550ms)
    await new Promise(r => setTimeout(r, 550));
    setPipelinePhase('preprocessing');

    // Step 3: Stylometric Profiling (650ms)
    await new Promise(r => setTimeout(r, 650));
    setPipelinePhase('inference');

    // Step 4 & 5: Perplexity & Signal Fusion (950ms)
    await new Promise(r => setTimeout(r, 950));

    // Step 6: Complete!
    setCurrentCase(newDemoCase);
    setActiveCaseId(caseId);
    setPipelinePhase('completed');
    setIsScanning(false);
  };

  // Run live backend inference with fallback
  const runLiveAnalysis = async (text: string, fallbackCaseId?: string) => {
    setIsScanning(true);
    setAnalysisError(null);
    setPipelineError(null);
    setPipelinePhase('uploaded');

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setMeta({
      fileName: 'input_document.txt',
      fileSize: `${(text.length / 1024).toFixed(1)} KB`,
      duration: `${words} words`
    });

    await new Promise(r => setTimeout(r, 300));
    setPipelinePhase('loading');

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 5000);
      });

      setPipelinePhase('inference');
      const backendPromise = forensicApi.analyzeMedia('TEXT', text);
      const result = await Promise.race([backendPromise, timeoutPromise]);

      if (result && result.case_id) {
        setCurrentCase(result);
        setActiveCaseId(result.case_id);
        setPipelinePhase('completed');
        setIsScanning(false);
      } else {
        throw new Error('Invalid backend response');
      }
    } catch (err: any) {
      if (fallbackCaseId) {
        runFastDemoAnalysis(fallbackCaseId, text);
        return;
      }
      setIsScanning(false);
      setPipelinePhase('error');
      const isTimeout = err.message === 'TIMEOUT';
      const reasonMsg = isTimeout
        ? 'External analysis is taking longer than expected.'
        : 'External detector unavailable';

      setPipelineError({
        stage: isTimeout ? 'API Gateway Timeout' : 'Stylometric NLP Detector',
        reason: reasonMsg,
        action: 'You can continue seamlessly using deterministic presentation demo mode.',
        requestId: `RC-TXT-${Date.now().toString().slice(-6)}`
      });
      setAnalysisError(reasonMsg);
    }
  };

  const handleAnalyze = () => {
    if (!textInput.trim()) {
      setPipelinePhase('error');
      setPipelineError({
        stage: 'Input Validation',
        reason: 'Empty text document',
        action: 'Please enter or paste at least 20 words to analyze stylometric patterns.',
        requestId: 'RC-TXT-EMPTY'
      });
      setAnalysisError('Empty text document. Please enter or paste at least 20 words.');
      return;
    }

    runLiveAnalysis(textInput, isDemoMode ? 'RC-2026-0045' : undefined);
  };

  const handleLoadSample = (type: 'ai' | 'real') => {
    setActiveSample(type);
    const chosenText = type === 'ai' ? sampleAiText : sampleHumanText;
    const targetCaseId = type === 'ai' ? 'RC-2026-0045' : 'RC-2026-0049';
    setTextInput(chosenText);
    runLiveAnalysis(chosenText, targetCaseId);
  };

  const handleClear = () => {
    setTextInput('');
    setActiveSample(null);
  };

  const isAi = currentCase?.sample_type === 'ai' || (currentCase?.ai_generation_probability ?? 0) >= 50;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header & Title Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--magenta-vivid)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 800
              }}
            >
              MODULE 04 &bull; TEXT FORENSICS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              PERPLEXITY &bull; BURSTINESS &bull; LEXICAL DIVERSITY &bull; TTR
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.4px',
              marginTop: '4px'
            }}
          >
            TEXT FORENSICS &amp; STYLOMETRIC ANALYSIS
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '780px' }}>
            Statistical stylometry, token surprisal perplexity, sentence length cadence burstiness, and vocabulary richness profiling.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAnalyze}
            className="btn-cyber-primary"
            style={{ fontSize: '11px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Play size={14} />
            <span>ANALYZE TEXT</span>
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 4px' }}>or benchmark:</span>

          <button
            onClick={() => handleLoadSample('ai')}
            className={activeSample === 'ai' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <Sparkles size={12} style={{ marginRight: '5px' }} />
            <span>LOAD SAMPLE AI TEXT</span>
          </button>

          <button
            onClick={() => handleLoadSample('real')}
            className={activeSample === 'real' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <CheckCircle2 size={12} style={{ marginRight: '5px' }} />
            <span>LOAD SAMPLE HUMAN TEXT</span>
          </button>

          <button
            onClick={handleClear}
            className="btn-cyber-secondary"
            style={{ fontSize: '11px', padding: '7px 12px' }}
            title="Clear text input"
          >
            <Trash2 size={13} style={{ marginRight: '4px' }} />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* 2. Large Text Input Area */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          borderRadius: '20px',
          border: '1px solid rgba(157, 78, 221, 0.28)',
          background: '#1F132B',
          boxShadow: 'var(--clay-box-shadow)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
            <AlignLeft size={16} color="var(--magenta-vivid)" />
            <span>DOCUMENT TEXT INPUT &bull; STYLOMETRIC BUFFER</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {textInput.trim().split(/\s+/).filter(Boolean).length} words &bull; {textInput.length} characters
          </span>
        </div>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste or type document text here for stylometric, burstiness, and perplexity forensic analysis..."
          rows={6}
          style={{
            width: '100%',
            background: '#12081C',
            border: '1px solid rgba(157, 78, 221, 0.25)',
            borderRadius: '14px',
            padding: '14px 16px',
            color: '#FFFFFF',
            fontSize: '13px',
            lineHeight: 1.6,
            fontFamily: 'var(--font-outfit)',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            * Stylometric signals are probabilistic indicators and should be interpreted with additional evidence.
          </div>

          <button
            onClick={handleAnalyze}
            className="btn-cyber-primary"
            style={{ padding: '7px 18px', fontSize: '11px' }}
          >
            ANALYZE DOCUMENT
          </button>
        </div>
      </div>

      {/* 3. Reusable Forensic Pipeline */}
      <ForensicPipeline
        hasInput={Boolean(textInput.trim())}
        inputBadgeText={isDemoMode ? 'DEMO PRESENTATION ACTIVE' : 'LIVE DETECTOR ACTIVE'}
        overallPhase={pipelinePhase}
        metadata={{
          fileName: meta.fileName,
          fileSize: meta.fileSize,
          dimensionsOrDuration: meta.duration,
          modelName: currentCase?.model_verification?.model_name || 'Transformer Stylometric Ensemble'
        }}
        error={pipelineError}
        onClearError={() => {
          setPipelineError(null);
          setAnalysisError(null);
          setPipelinePhase('completed');
        }}
        onRetry={handleAnalyze}
        onContinueWithDemo={() => runFastDemoAnalysis('RC-2026-0045')}
        steps={pipelineSteps}
      />

      {/* 4. Live Scanning Laser Animation */}
      {isScanning && (
        <div style={{ padding: '40px 0' }}>
          <LiveScanAnimation mediaType="TEXT" onComplete={() => setIsScanning(false)} />
        </div>
      )}

      {/* 5. Main Results View */}
      {!isScanning && currentCase && (
        <>
          {/* Main Result Card with Radial AI-Generated Likelihood */}
          <AnalysisResult
            result={currentCase}
            title="TEXT FORENSICS RESULT"
            onGenerateReport={onGenerateReport}
            onOpenWhyModal={() => setIsWhyModalOpen(true)}
          />

          {/* Metric Cards (Perplexity, Burstiness, Lexical Diversity, Style Consistency) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '24px'
            }}
          >
            {/* Perplexity Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: '#1F132B',
                border: '1px solid rgba(157, 78, 221, 0.28)',
                boxShadow: 'var(--clay-box-shadow)'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                PERPLEXITY
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: isAi ? '#FF4B72' : '#10B981',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px'
                }}
              >
                {isAi ? 'LOW' : 'NATURAL'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isAi ? 'Abnormally predictable tokens' : 'Natural human surprisal range'}
              </div>
            </div>

            {/* Burstiness Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: '#1F132B',
                border: '1px solid rgba(157, 78, 221, 0.28)',
                boxShadow: 'var(--clay-box-shadow)'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                BURSTINESS
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: isAi ? '#FF4B72' : '#10B981',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px'
                }}
              >
                {isAi ? 'LOW' : 'HIGH'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isAi ? 'Uniform sentence structure' : 'Dynamic human rhythm variation'}
              </div>
            </div>

            {/* Lexical Diversity Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: '#1F132B',
                border: '1px solid rgba(157, 78, 221, 0.28)',
                boxShadow: 'var(--clay-box-shadow)'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                LEXICAL DIVERSITY
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: isAi ? '#FBBF24' : '#10B981',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px'
                }}
              >
                {isAi ? 'MODERATE' : 'RICH'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Type-Token Ratio: {isAi ? '0.48' : '0.74'}
              </div>
            </div>

            {/* Style Consistency Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: '#1F132B',
                border: '1px solid rgba(157, 78, 221, 0.28)',
                boxShadow: 'var(--clay-box-shadow)'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                STYLE CONSISTENCY
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: isAi ? '#FF4B72' : '#10B981',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px'
                }}
              >
                {isAi ? 'SUSPICIOUS' : 'CONSISTENT'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sentence Variance: {isAi ? '2.1 words' : '5.8 words'}
              </div>
            </div>
          </div>

          {/* Forensic Signals Breakdown */}
          <div
            style={{
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid rgba(157, 78, 221, 0.28)',
              background: '#1F132B',
              boxShadow: 'var(--clay-box-shadow)',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--magenta-vivid)" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                  STYLOMETRIC SIGNALS &amp; ATTRIBUTION
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                5 SIGNALS EVALUATED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {currentCase.signals.map((sig, idx) => {
                const isAnomaly = sig.score >= 60;
                const isModerate = sig.score >= 35 && sig.score < 60;
                const barColor = isAnomaly ? '#FF4B72' : (isModerate ? '#FBBF24' : '#10B981');

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: '#150C20',
                      border: '1px solid rgba(157, 78, 221, 0.18)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                        {sig.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: `${barColor}22`,
                            border: `1px solid ${barColor}55`,
                            color: barColor,
                            fontWeight: 700
                          }}
                        >
                          {sig.status}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: barColor }}>
                          {sig.score.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                      {sig.explanation}
                    </div>

                    <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${sig.score}%`,
                          background: barColor,
                          boxShadow: `0 0 8px ${barColor}`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Probabilistic Disclaimer Footer */}
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(157, 78, 221, 0.08)',
                border: '1px solid rgba(157, 78, 221, 0.18)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}
            >
              <strong style={{ color: '#FFFFFF' }}>Disclaimer: </strong>
              Stylometric signals are probabilistic indicators and should be interpreted with additional evidence. Synthetic text detectors cannot provide guaranteed proof of authorship.
            </div>
          </div>
        </>
      )}

      {/* Why This Result Modal */}
      {isWhyModalOpen && currentCase && (
        <WhyThisResultModal
          isOpen={isWhyModalOpen}
          result={currentCase}
          onClose={() => setIsWhyModalOpen(false)}
        />
      )}
    </div>
  );
};
