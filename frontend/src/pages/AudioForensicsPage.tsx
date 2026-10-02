import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Volume2,
  Activity,
  Mic,
  RotateCcw
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

interface AudioForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const AudioForensicsPage: React.FC<AudioForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0044'
}) => {
  const { isDemoMode, activeCaseId, setActiveCaseId, generateNewCaseId } = useInvestigation();

  const effectiveInitialCase = (initialCaseId && SAMPLE_CASES[initialCaseId]?.media_type === 'AUDIO')
    ? SAMPLE_CASES[initialCaseId]
    : SAMPLE_CASES['RC-2026-0044'];

  const [currentCase, setCurrentCase] = useState<InvestigationResult>(effectiveInitialCase);
  const [uploadedAudioSrc, setUploadedAudioSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [activeSample, setActiveSample] = useState<'ai' | 'real' | null>('ai');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(65); // 0-100%
  const [isDragging, setIsDragging] = useState(false);

  // Pipeline execution state
  const [pipelinePhase, setPipelinePhase] = useState<'idle' | 'uploaded' | 'loading' | 'preprocessing' | 'inference' | 'completed' | 'error'>('completed');
  const [pipelineError, setPipelineError] = useState<{ stage: string; reason: string; action?: string; requestId?: string } | null>(null);
  const [meta, setMeta] = useState<{ fileName: string; fileSize: string; duration: string }>({
    fileName: effectiveInitialCase.file_name,
    fileSize: effectiveInitialCase.metadata?.file_size_formatted || '4.7 MB',
    duration: '00:28 (PCM 44.1 kHz Stereo)'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeCaseId && SAMPLE_CASES[activeCaseId] && SAMPLE_CASES[activeCaseId].media_type === 'AUDIO') {
      setCurrentCase(SAMPLE_CASES[activeCaseId]);
    }
  }, [activeCaseId]);

  // Audio-specific 6-step Forensic Pipeline
  const pipelineSteps: PipelineStep[] = [
    {
      id: '1',
      stepNumber: 1,
      title: 'Audio Ingestion',
      subtitle: meta.fileName,
      status: pipelinePhase === 'idle' ? 'pending' : (pipelinePhase === 'uploaded' ? 'processing' : 'success')
    },
    {
      id: '2',
      stepNumber: 2,
      title: 'STFT Transformation',
      subtitle: 'Short-time Fourier transform (128-band)',
      status: ['idle', 'uploaded'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'loading' ? 'processing' : 'success')
    },
    {
      id: '3',
      stepNumber: 3,
      title: 'Mel-Spectrogram',
      subtitle: 'Log-magnitude mel filterbank',
      status: ['idle', 'uploaded', 'loading'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'preprocessing' ? 'processing' : 'success')
    },
    {
      id: '4',
      stepNumber: 4,
      title: 'Acoustic Analysis',
      subtitle: 'Pitch micro-jitter & vocal tract resonance',
      status: ['idle', 'uploaded', 'loading', 'preprocessing'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'inference' ? 'processing' : 'success')
    },
    {
      id: '5',
      stepNumber: 5,
      title: 'Voice Signal Analysis',
      subtitle: 'Neural vocoder phase drift audit',
      status: pipelinePhase === 'completed' ? 'success' : (pipelinePhase === 'inference' ? 'processing' : 'pending')
    },
    {
      id: '6',
      stepNumber: 6,
      title: 'Result Fusion',
      subtitle: currentCase ? currentCase.assessment : 'Output',
      status: pipelinePhase === 'completed' ? 'success' : 'pending'
    }
  ];

  // Execute fast deterministic presentation demo (3-5s)
  const runFastDemoAnalysis = async (targetCaseId: string, customFile?: File) => {
    setIsScanning(true);
    setAnalysisError(null);
    setPipelineError(null);
    setPipelinePhase('uploaded');

    const sample = SAMPLE_CASES[targetCaseId] || SAMPLE_CASES['RC-2026-0044'];
    const caseId = generateNewCaseId('RC-2026-');
    const newDemoCase: InvestigationResult = {
      ...sample,
      case_id: caseId,
      is_demo_analysis: true,
      timestamp: new Date().toISOString()
    };

    if (customFile) {
      newDemoCase.file_name = customFile.name;
      newDemoCase.metadata = {
        ...newDemoCase.metadata,
        file_name: customFile.name,
        file_size_formatted: `${(customFile.size / (1024 * 1024)).toFixed(2)} MB`
      };
      setMeta({
        fileName: customFile.name,
        fileSize: `${(customFile.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: '00:28 (PCM 44.1 kHz Stereo)'
      });
    } else {
      setMeta({
        fileName: sample.file_name,
        fileSize: sample.metadata?.file_size_formatted || '4.7 MB',
        duration: '00:28 (PCM 44.1 kHz Stereo)'
      });
    }

    // Step 1: Ingestion (450ms)
    await new Promise(r => setTimeout(r, 450));
    setPipelinePhase('loading');

    // Step 2: STFT (550ms)
    await new Promise(r => setTimeout(r, 550));
    setPipelinePhase('preprocessing');

    // Step 3: Mel-Spectrogram (650ms)
    await new Promise(r => setTimeout(r, 650));
    setPipelinePhase('inference');

    // Step 4 & 5: Acoustic & Voice Signal Analysis (950ms)
    await new Promise(r => setTimeout(r, 950));

    // Step 6: Complete!
    setCurrentCase(newDemoCase);
    setActiveCaseId(caseId);
    setPipelinePhase('completed');
    setIsScanning(false);
  };

  // Run live backend inference with fallback
  const runLiveAnalysis = async (file: File) => {
    setIsScanning(true);
    setAnalysisError(null);
    setPipelineError(null);
    setPipelinePhase('uploaded');

    setMeta({
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      duration: 'Analyzing acoustic spectrum...'
    });

    await new Promise(r => setTimeout(r, 300));
    setPipelinePhase('loading');

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 5000);
      });

      setPipelinePhase('inference');
      const backendPromise = forensicApi.analyzeMedia('AUDIO', file);
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
      setIsScanning(false);
      setPipelinePhase('error');
      const isTimeout = err.message === 'TIMEOUT';
      const reasonMsg = isTimeout
        ? 'External analysis is taking longer than expected.'
        : 'External detector unavailable';

      setPipelineError({
        stage: isTimeout ? 'API Gateway Timeout' : 'Audio Detector',
        reason: reasonMsg,
        action: 'You can continue seamlessly using deterministic presentation demo mode.',
        requestId: `RC-AUD-${Date.now().toString().slice(-6)}`
      });
      setAnalysisError(reasonMsg);
    }
  };

  const handleFile = (file: File) => {
    const validExts = /\.(wav|mp3|ogg|flac|m4a|aac)$/i;
    if (!file.name.match(validExts)) {
      setPipelinePhase('error');
      setPipelineError({
        stage: 'Format Validation',
        reason: 'Unsupported evidence format',
        action: 'Accepted formats: WAV, MP3, FLAC, OGG, M4A.',
        requestId: 'RC-FMT-ERR'
      });
      setAnalysisError('Unsupported evidence format. Accepted formats: WAV, MP3, FLAC, OGG, M4A.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedAudioSrc(objectUrl);
    setActiveSample(null);
    runLiveAnalysis(file);
  };

  const handleSelectSample = async (sampleType: 'ai' | 'real') => {
    setActiveSample(sampleType);
    const sampleUrl = sampleType === 'ai' ? '/samples/synthetic_voice.wav' : '/samples/human_voice.wav';
    const sampleFileName = sampleType === 'ai' ? 'synthetic_voice.wav' : 'human_voice.wav';
    setUploadedAudioSrc(sampleUrl);

    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], sampleFileName, { type: 'audio/wav' });
      runLiveAnalysis(file);
    } catch {
      const targetCaseId = sampleType === 'ai' ? 'RC-2026-0044' : 'RC-2026-0048';
      runFastDemoAnalysis(targetCaseId);
    }
  };

  const isAi = currentCase?.sample_type === 'ai' || (currentCase?.ai_generation_probability ?? 0) >= 50;

  // Synthesize decorative waveform bars
  const waveformBars = [
    25, 45, 60, 30, 80, 95, 70, 40, 20, 55, 75, 90, 85, 40, 65, 80, 95, 100, 85, 60,
    30, 45, 70, 85, 90, 65, 40, 25, 60, 80, 95, 70, 50, 30, 75, 90, 80, 60, 40, 20
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

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
              MODULE 03 &bull; AUDIO FORENSICS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              MEL-SPECTROGRAM &bull; VOCODER PHASE &bull; STFT &bull; ZERO-JITTER
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
            AUDIO FORENSICS &amp; VOICE AUTHENTICITY
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '780px' }}>
            Acoustic spectrogram decomposition, neural vocoder phase continuity tracking, and physiological vocal tract biomechanics for AI voice clone detection.
          </p>
        </div>

        {/* Top Sample Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ fontSize: '11px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Upload size={14} />
            <span>SELECT AUDIO</span>
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 4px' }}>or benchmark:</span>

          <button
            onClick={() => handleSelectSample('ai')}
            className={activeSample === 'ai' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <Sparkles size={12} style={{ marginRight: '5px' }} />
            <span>Sample: Synthetic Voice</span>
          </button>

          <button
            onClick={() => handleSelectSample('real')}
            className={activeSample === 'real' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <CheckCircle2 size={12} style={{ marginRight: '5px' }} />
            <span>Sample: Human Voice</span>
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Panel */}
      <div
        className="glass-panel"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        style={{
          padding: '24px',
          borderRadius: '20px',
          border: isDragging ? '1px dashed var(--magenta-vivid)' : '1px solid rgba(157, 78, 221, 0.25)',
          background: isDragging ? 'rgba(31, 19, 43, 0.9)' : '#1F132B',
          boxShadow: isDragging ? '0 0 30px rgba(199, 36, 177, 0.3)' : 'var(--clay-box-shadow)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2A173D 0%, #170C22 100%)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--magenta-vivid)',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Mic size={22} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              Upload Audio for Forensic Voice Analysis
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Supports WAV, MP3, FLAC, OGG, M4A &bull; Multi-band FFT &bull; SHA-256 cryptographic audit
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ padding: '8px 18px', fontSize: '11px' }}
          >
            SELECT AUDIO
          </button>
        </div>
      </div>

      {/* 3. Reusable Forensic Pipeline */}
      <ForensicPipeline
        hasInput={Boolean(uploadedAudioSrc || currentCase)}
        inputBadgeText={isDemoMode ? 'DEMO PRESENTATION ACTIVE' : 'LIVE DETECTOR ACTIVE'}
        overallPhase={pipelinePhase}
        metadata={{
          fileName: meta.fileName,
          fileSize: meta.fileSize,
          dimensionsOrDuration: meta.duration,
          modelName: currentCase?.model_verification?.model_name || 'Mel-Spectrogram CNN + Wav2Vec2'
        }}
        error={pipelineError}
        onClearError={() => {
          setPipelineError(null);
          setAnalysisError(null);
          setPipelinePhase('completed');
        }}
        onRetry={() => fileInputRef.current?.click()}
        onContinueWithDemo={() => runFastDemoAnalysis('RC-2026-0044')}
        steps={pipelineSteps}
      />

      {/* 4. Live Scanning Laser Animation */}
      {isScanning && (
        <div style={{ padding: '40px 0' }}>
          <LiveScanAnimation mediaType="AUDIO" onComplete={() => setIsScanning(false)} />
        </div>
      )}

      {/* 5. Main Results View */}
      {!isScanning && currentCase && (
        <>
          {/* Main Result Card with Radial AI-Generated Likelihood */}
          <AnalysisResult
            result={currentCase}
            title="AUDIO FORENSICS RESULT"
            onGenerateReport={onGenerateReport}
            onOpenWhyModal={() => setIsWhyModalOpen(true)}
          />

          {/* Technical Telemetry Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Duration
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                00:28
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Total playback length</div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Sample Rate
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--magenta-vivid)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                44.1 kHz
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>16-bit Linear PCM</div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Channels
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                2 (Stereo)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Dual-channel phase track</div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Processing Time
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                2.8 sec
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>GPU accelerated STFT</div>
            </div>
          </div>

          {/* Audio Forensic Workstation: Waveform & Mel-Spectrogram Panels */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              border: '1px solid rgba(157, 78, 221, 0.28)',
              background: '#1F132B',
              boxShadow: 'var(--clay-box-shadow)',
              marginBottom: '24px'
            }}
          >
            {/* Waveform Player Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(199, 36, 177, 0.45)'
                  }}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                </button>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                    ACOUSTIC WAVEFORM &bull; TIME DOMAIN
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Timestamp: 00:18 / 00:28 &bull; Formant region inspection
                  </div>
                </div>
              </div>

              {isAi && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 75, 114, 0.15)',
                    border: '1px solid rgba(255, 75, 114, 0.4)',
                    color: '#FF6B8B',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>SUSPICION SEGMENT: 00:17 - 00:21</span>
                </div>
              )}
            </div>

            {/* Simulated Animated Waveform Bars */}
            <div
              style={{
                height: '90px',
                padding: '14px 18px',
                borderRadius: '14px',
                background: '#12081C',
                border: '1px solid rgba(157, 78, 221, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Playback scrubber indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: `${playProgress}%`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'var(--magenta-vivid)',
                  boxShadow: '0 0 10px var(--magenta-vivid)',
                  zIndex: 2
                }}
              />

              {waveformBars.map((height, idx) => {
                const isSuspiciousBar = isAi && idx >= 24 && idx <= 30;
                const barColor = isSuspiciousBar
                  ? '#FF4B72'
                  : (idx / waveformBars.length <= playProgress / 100 ? 'var(--magenta-vivid)' : 'rgba(157, 78, 221, 0.35)');

                return (
                  <div
                    key={idx}
                    onClick={() => setPlayProgress((idx / waveformBars.length) * 100)}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background: barColor,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'height 0.2s ease, background 0.2s ease',
                      boxShadow: isSuspiciousBar ? '0 0 8px #FF4B72' : 'none'
                    }}
                  />
                );
              })}
            </div>

            {/* Spectrogram Visualization Section */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  MEL-SPECTROGRAM DENSITY HEATMAP (0 Hz - 22,050 Hz)
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  LOG MAGNITUDE STFT
                </span>
              </div>

              {/* Attractive Multi-band Spectrogram Canvas Box */}
              <div
                style={{
                  height: '140px',
                  borderRadius: '14px',
                  background: isAi
                    ? 'linear-gradient(180deg, rgba(255, 75, 114, 0.4) 0%, rgba(199, 36, 177, 0.3) 30%, rgba(157, 78, 221, 0.2) 60%, #12081C 100%)'
                    : 'linear-gradient(180deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.25) 30%, rgba(15, 23, 42, 0.4) 70%, #12081C 100%)',
                  border: '1px solid rgba(157, 78, 221, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Horizontal frequency gridlines */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100% 28px',
                    pointerEvents: 'none'
                  }}
                />

                {/* Acoustic Annotations */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '12px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  HIGH FREQUENCY: 16.0 kHz &bull; Vocoder phase artifacts
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  FUNDAMENTAL F0: 124 Hz &bull; Rigid zero-jitter contour
                </div>
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
                  FORENSIC SIGNALS &amp; ATTRIBUTION
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
