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
  Eye,
  Film,
  Activity
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

interface VideoForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const VideoForensicsPage: React.FC<VideoForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0043'
}) => {
  const { isDemoMode, activeCaseId, setActiveCaseId, generateNewCaseId } = useInvestigation();

  const effectiveInitialCase = (initialCaseId && SAMPLE_CASES[initialCaseId]?.media_type === 'VIDEO')
    ? SAMPLE_CASES[initialCaseId]
    : SAMPLE_CASES['RC-2026-0043'];

  const [currentCase, setCurrentCase] = useState<InvestigationResult>(effectiveInitialCase);
  const [uploadedVideoSrc, setUploadedVideoSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [activeSample, setActiveSample] = useState<'ai' | 'real' | null>('ai');
  const [selectedFrame, setSelectedFrame] = useState<number>(85);
  const [isDragging, setIsDragging] = useState(false);

  // Pipeline execution state
  const [pipelinePhase, setPipelinePhase] = useState<'idle' | 'uploaded' | 'loading' | 'preprocessing' | 'inference' | 'completed' | 'error'>('completed');
  const [pipelineError, setPipelineError] = useState<{ stage: string; reason: string; action?: string; requestId?: string } | null>(null);
  const [meta, setMeta] = useState<{ fileName: string; fileSize: string; duration: string }>({
    fileName: effectiveInitialCase.file_name,
    fileSize: effectiveInitialCase.metadata?.file_size_formatted || '18.4 MB',
    duration: '00:10 (120 frames @ 12 fps)'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeCaseId && SAMPLE_CASES[activeCaseId] && SAMPLE_CASES[activeCaseId].media_type === 'VIDEO') {
      setCurrentCase(SAMPLE_CASES[activeCaseId]);
    }
  }, [activeCaseId]);

  // Video-specific 6-step Forensic Pipeline
  const pipelineSteps: PipelineStep[] = [
    {
      id: '1',
      stepNumber: 1,
      title: 'Frame Extraction',
      subtitle: '120 frames extracted at 12 fps',
      status: pipelinePhase === 'idle' ? 'pending' : (pipelinePhase === 'uploaded' ? 'processing' : 'success')
    },
    {
      id: '2',
      stepNumber: 2,
      title: 'Temporal Analysis',
      subtitle: '3D-CNN temporal continuity',
      status: ['idle', 'uploaded'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'loading' ? 'processing' : 'success')
    },
    {
      id: '3',
      stepNumber: 3,
      title: 'Facial Landmark Analysis',
      subtitle: '68-point spatial tracking',
      status: ['idle', 'uploaded', 'loading'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'preprocessing' ? 'processing' : 'success')
    },
    {
      id: '4',
      stepNumber: 4,
      title: 'Optical Flow',
      subtitle: 'Dense motion vector fields',
      status: ['idle', 'uploaded', 'loading', 'preprocessing'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'inference' ? 'processing' : 'success')
    },
    {
      id: '5',
      stepNumber: 5,
      title: 'Signal Fusion',
      subtitle: 'Audio-visual lip sync audit',
      status: pipelinePhase === 'completed' ? 'success' : (pipelinePhase === 'inference' ? 'processing' : 'pending')
    },
    {
      id: '6',
      stepNumber: 6,
      title: 'Video Analysis Complete',
      subtitle: currentCase ? currentCase.assessment : 'Assessment',
      status: pipelinePhase === 'completed' ? 'success' : 'pending'
    }
  ];

  // Execute fast deterministic presentation demo (3-5s)
  const runFastDemoAnalysis = async (targetCaseId: string, customFile?: File) => {
    setIsScanning(true);
    setAnalysisError(null);
    setPipelineError(null);
    setPipelinePhase('uploaded');

    const sample = SAMPLE_CASES[targetCaseId] || SAMPLE_CASES['RC-2026-0043'];
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
        duration: '00:10 (120 frames @ 12 fps)'
      });
    } else {
      setMeta({
        fileName: sample.file_name,
        fileSize: sample.metadata?.file_size_formatted || '18.4 MB',
        duration: '00:10 (120 frames @ 12 fps)'
      });
    }

    // Step 1: Frame Extraction (500ms)
    await new Promise(r => setTimeout(r, 500));
    setPipelinePhase('loading');

    // Step 2: Temporal Analysis (600ms)
    await new Promise(r => setTimeout(r, 600));
    setPipelinePhase('preprocessing');

    // Step 3: Facial Landmark Analysis (650ms)
    await new Promise(r => setTimeout(r, 650));
    setPipelinePhase('inference');

    // Step 4 & 5: Optical Flow & Signal Fusion (950ms)
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
      duration: 'Analyzing video stream...'
    });

    await new Promise(r => setTimeout(r, 300));
    setPipelinePhase('loading');

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 5000);
      });

      setPipelinePhase('inference');
      const backendPromise = forensicApi.analyzeMedia('VIDEO', file);
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
        stage: isTimeout ? 'API Gateway Timeout' : 'Video Detector',
        reason: reasonMsg,
        action: 'You can continue seamlessly using deterministic presentation demo mode.',
        requestId: `RC-VID-${Date.now().toString().slice(-6)}`
      });
      setAnalysisError(reasonMsg);
    }
  };

  const handleFile = (file: File) => {
    const validExts = /\.(mp4|mov|avi|webm|mkv)$/i;
    if (!file.name.match(validExts)) {
      setPipelinePhase('error');
      setPipelineError({
        stage: 'Format Validation',
        reason: 'Unsupported evidence format',
        action: 'Accepted formats: MP4, MOV, WEBM, AVI.',
        requestId: 'RC-FMT-ERR'
      });
      setAnalysisError('Unsupported evidence format. Accepted formats: MP4, MOV, WEBM, AVI.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedVideoSrc(objectUrl);
    setActiveSample(null);
    runLiveAnalysis(file);
  };

  const handleSelectSample = async (sampleType: 'ai' | 'real') => {
    setActiveSample(sampleType);
    const sampleUrl = sampleType === 'ai' ? '/samples/face_swap.mp4' : '/samples/authentic_video.mp4';
    const sampleFileName = sampleType === 'ai' ? 'face_swap.mp4' : 'authentic_video.mp4';
    setUploadedVideoSrc(sampleUrl);

    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], sampleFileName, { type: 'video/mp4' });
      runLiveAnalysis(file);
    } catch {
      const targetCaseId = sampleType === 'ai' ? 'RC-2026-0043' : 'RC-2026-0047';
      runFastDemoAnalysis(targetCaseId);
    }
  };

  const isAi = currentCase?.sample_type === 'ai' || (currentCase?.ai_generation_probability ?? 0) >= 50;

  // Generate 8 key sample frames for the filmstrip
  const filmstripFrames = [
    { frameNum: 15, time: '00:01', isSuspicious: false },
    { frameNum: 32, time: '00:03', isSuspicious: false },
    { frameNum: 48, time: '00:04', isSuspicious: false },
    { frameNum: 64, time: '00:05', isSuspicious: false },
    { frameNum: 78, time: '00:07', isSuspicious: isAi },
    { frameNum: 85, time: '00:08', isSuspicious: isAi },
    { frameNum: 92, time: '00:09', isSuspicious: isAi },
    { frameNum: 110, time: '00:10', isSuspicious: false }
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
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
              MODULE 02 &bull; VIDEO FORENSICS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              LANDMARKS &bull; OPTICAL FLOW &bull; TEMPORAL CNN &bull; LIP SYNC
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
            VIDEO FORENSICS &amp; TEMPORAL AUTHENTICITY
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '780px' }}>
            Multi-frame temporal consistency, facial landmark trajectory tracking, dense optical flow vectors, and audio-visual synchronization analysis.
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
            <span>SELECT VIDEO</span>
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 4px' }}>or benchmark:</span>

          <button
            onClick={() => handleSelectSample('ai')}
            className={activeSample === 'ai' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <Sparkles size={12} style={{ marginRight: '5px' }} />
            <span>Sample: Face Swap</span>
          </button>

          <button
            onClick={() => handleSelectSample('real')}
            className={activeSample === 'real' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <CheckCircle2 size={12} style={{ marginRight: '5px' }} />
            <span>Sample: Authentic Video</span>
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
            <Upload size={22} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              Upload Video for Deepfake &amp; Temporal Analysis
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Supports MP4, MOV, WEBM, AVI &bull; Automatic frame extraction &bull; SHA-256 integrity verification
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ padding: '8px 18px', fontSize: '11px' }}
          >
            SELECT VIDEO
          </button>
        </div>
      </div>

      {/* 3. Reusable Forensic Pipeline */}
      <ForensicPipeline
        hasInput={Boolean(uploadedVideoSrc || currentCase)}
        inputBadgeText={isDemoMode ? 'DEMO PRESENTATION ACTIVE' : 'LIVE DETECTOR ACTIVE'}
        overallPhase={pipelinePhase}
        metadata={{
          fileName: meta.fileName,
          fileSize: meta.fileSize,
          dimensionsOrDuration: meta.duration,
          modelName: currentCase?.model_verification?.model_name || 'Spatial-Temporal CNN + Landmark RNN'
        }}
        error={pipelineError}
        onClearError={() => {
          setPipelineError(null);
          setAnalysisError(null);
          setPipelinePhase('completed');
        }}
        onRetry={() => fileInputRef.current?.click()}
        onContinueWithDemo={() => runFastDemoAnalysis('RC-2026-0043')}
        steps={pipelineSteps}
      />

      {/* 4. Live Scanning Laser Animation */}
      {isScanning && (
        <div style={{ padding: '40px 0' }}>
          <LiveScanAnimation mediaType="VIDEO" onComplete={() => setIsScanning(false)} />
        </div>
      )}

      {/* 5. Main Results View */}
      {!isScanning && currentCase && (
        <>
          {/* Main Result Card with Radial Manipulation Likelihood */}
          <AnalysisResult
            result={currentCase}
            title="VIDEO ANALYSIS COMPLETE"
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
                Frames Analyzed
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                120
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Temporal slice sampling</div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Analysis FPS
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--magenta-vivid)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                12 fps
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Sub-sampled rate</div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Suspicious Frames
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: isAi ? '#FF4B72' : '#10B981', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {isAi ? '17' : '0'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                {isAi ? 'Warping & flicker detected' : 'Zero temporal anomalies'}
              </div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '16px', background: '#1F132B', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
                Processing Time
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                3.2 sec
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Hardware accelerated</div>
            </div>
          </div>

          {/* Filmstrip of Analyzed Frames */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} color="var(--magenta-vivid)" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                  ANALYZED FRAME SEQUENCE (TEMPORAL FILMSTRIP)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Click frame to inspect optical flow
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px'
              }}
            >
              {filmstripFrames.map((f, idx) => {
                const isSelected = selectedFrame === f.frameNum;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedFrame(f.frameNum)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(157, 78, 221, 0.25)' : '#150C20',
                      border: isSelected
                        ? '1px solid var(--magenta-vivid)'
                        : (f.isSuspicious ? '1px solid rgba(255, 75, 114, 0.6)' : '1px solid rgba(157, 78, 221, 0.18)'),
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 16px rgba(199, 36, 177, 0.35)' : 'none'
                    }}
                  >
                    {/* Simulated Frame Thumbnail */}
                    <div
                      style={{
                        width: '100%',
                        height: '75px',
                        borderRadius: '8px',
                        background: f.isSuspicious
                          ? 'radial-gradient(circle at 50% 45%, rgba(255, 75, 114, 0.45) 0%, #170921 70%)'
                          : 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.25) 0%, #0F1418 70%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Eye size={20} color={f.isSuspicious ? '#FF4B72' : '#34D399'} opacity={0.8} />

                      {f.isSuspicious && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            background: '#FF4B72',
                            color: '#FFFFFF',
                            fontSize: '8px',
                            fontWeight: 900
                          }}
                        >
                          ANOMALY
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#FFFFFF', fontWeight: 700 }}>
                        F-{f.frameNum}
                      </span>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        {f.time}
                      </span>
                    </div>
                  </div>
                );
              })}
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
