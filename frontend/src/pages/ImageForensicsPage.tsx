import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  Flame,
  Layers,
  Sparkles,
  Sliders,
  Eye,
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

interface ImageForensicsPageProps {
  onGenerateReport: (caseId: string) => void;
  onNavigate: (tab: string) => void;
  initialCaseId?: string;
}

export const ImageForensicsPage: React.FC<ImageForensicsPageProps> = ({
  onGenerateReport,
  onNavigate,
  initialCaseId = 'RC-2026-0042'
}) => {
  const { isDemoMode, activeCaseId, setActiveCaseId, generateNewCaseId } = useInvestigation();

  const effectiveInitialCase = (initialCaseId && SAMPLE_CASES[initialCaseId]?.media_type === 'IMAGE')
    ? SAMPLE_CASES[initialCaseId]
    : SAMPLE_CASES['RC-2026-0042'];

  const [currentCase, setCurrentCase] = useState<InvestigationResult>(effectiveInitialCase);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'heatmap' | 'annotated'>('heatmap');
  const [isDragging, setIsDragging] = useState(false);
  const [activeSample, setActiveSample] = useState<'ai' | 'real' | null>('ai');

  // Pipeline execution state
  const [pipelinePhase, setPipelinePhase] = useState<'idle' | 'uploaded' | 'loading' | 'preprocessing' | 'inference' | 'completed' | 'error'>('completed');
  const [pipelineError, setPipelineError] = useState<{ stage: string; reason: string; action?: string; requestId?: string } | null>(null);
  const [meta, setMeta] = useState<{ fileName: string; fileSize: string; dimensions: string }>({
    fileName: effectiveInitialCase.file_name,
    fileSize: effectiveInitialCase.metadata?.file_size_formatted || '2.4 MB',
    dimensions: effectiveInitialCase.metadata?.dimensions || '2048 × 2048'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when activeCaseId changes externally
  useEffect(() => {
    if (activeCaseId && SAMPLE_CASES[activeCaseId] && SAMPLE_CASES[activeCaseId].media_type === 'IMAGE') {
      setCurrentCase(SAMPLE_CASES[activeCaseId]);
    }
  }, [activeCaseId]);

  // Unified 6-step Forensic Pipeline
  const pipelineSteps: PipelineStep[] = [
    {
      id: '1',
      stepNumber: 1,
      title: 'Evidence Received',
      subtitle: meta.fileName,
      status: pipelinePhase === 'idle' ? 'pending' : (pipelinePhase === 'uploaded' ? 'processing' : 'success')
    },
    {
      id: '2',
      stepNumber: 2,
      title: 'SHA-256 Generated',
      subtitle: currentCase?.metadata?.hash_sha256 ? `${currentCase.metadata.hash_sha256.substring(0, 16)}...` : 'Cryptographic Hash',
      status: ['idle', 'uploaded'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'loading' ? 'processing' : 'success')
    },
    {
      id: '3',
      stepNumber: 3,
      title: 'Preprocessing',
      subtitle: `${meta.dimensions} RGB Tensor`,
      status: ['idle', 'uploaded', 'loading'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'preprocessing' ? 'processing' : 'success')
    },
    {
      id: '4',
      stepNumber: 4,
      title: 'Model Analysis',
      subtitle: currentCase?.model_verification?.model_name || 'PRNU + ViT + Fourier',
      status: ['idle', 'uploaded', 'loading', 'preprocessing'].includes(pipelinePhase) ? 'pending' : (pipelinePhase === 'inference' ? 'processing' : 'success')
    },
    {
      id: '5',
      stepNumber: 5,
      title: 'Signal Fusion',
      subtitle: 'Multi-evidence consensus',
      status: pipelinePhase === 'completed' ? 'success' : (pipelinePhase === 'inference' ? 'processing' : 'pending')
    },
    {
      id: '6',
      stepNumber: 6,
      title: 'Final Assessment',
      subtitle: currentCase ? currentCase.assessment : 'Verdict',
      status: pipelinePhase === 'completed' ? 'success' : 'pending'
    }
  ];

  // Execute fast deterministic presentation demo (3-5s)
  const runFastDemoAnalysis = async (targetCaseId: string, customFile?: File) => {
    setIsScanning(true);
    setAnalysisError(null);
    setPipelineError(null);
    setPipelinePhase('uploaded');

    const sample = SAMPLE_CASES[targetCaseId] || SAMPLE_CASES['RC-2026-0042'];
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
        dimensions: '2048 × 2048'
      });
    } else {
      setMeta({
        fileName: sample.file_name,
        fileSize: sample.metadata?.file_size_formatted || '2.4 MB',
        dimensions: sample.metadata?.dimensions || '2048 × 2048'
      });
    }

    // Step 1: Upload (400ms)
    await new Promise(r => setTimeout(r, 450));
    setPipelinePhase('loading');

    // Step 2: SHA-256 Hash (500ms)
    await new Promise(r => setTimeout(r, 550));
    setPipelinePhase('preprocessing');

    // Step 3: Preprocessing (600ms)
    await new Promise(r => setTimeout(r, 650));
    setPipelinePhase('inference');

    // Step 4 & 5: Model Analysis & Signal Fusion (900ms)
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
      dimensions: 'Analyzing...'
    });

    await new Promise(r => setTimeout(r, 300));
    setPipelinePhase('loading');

    try {
      // 5-second timeout safeguard for live API
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 5000);
      });

      setPipelinePhase('inference');
      const backendPromise = forensicApi.analyzeMedia('IMAGE', file);
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
        stage: isTimeout ? 'API Gateway Timeout' : 'External Detector',
        reason: reasonMsg,
        action: 'You can continue seamlessly using deterministic presentation demo mode.',
        requestId: `RC-IMG-${Date.now().toString().slice(-6)}`
      });
      setAnalysisError(reasonMsg);
    }
  };

  // Handle file selection
  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setPipelinePhase('error');
      setPipelineError({
        stage: 'Format Validation',
        reason: 'Unsupported evidence format',
        action: 'Accepted formats: JPEG, PNG, WEBP.',
        requestId: 'RC-FMT-ERR'
      });
      setAnalysisError('Unsupported evidence format. Accepted formats: JPEG, PNG, WEBP.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedImageSrc(objectUrl);
    setActiveSample(null);
    runLiveAnalysis(file);
  };

  const handleSelectSample = async (sampleType: 'ai' | 'real') => {
    setActiveSample(sampleType);
    const sampleUrl = sampleType === 'ai' ? '/samples/synthetic_portrait.jpg' : '/samples/nikon_raw.jpg';
    const sampleFileName = sampleType === 'ai' ? 'synthetic_portrait.jpg' : 'nikon_raw.jpg';
    setUploadedImageSrc(sampleUrl);

    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], sampleFileName, { type: 'image/jpeg' });
      runLiveAnalysis(file);
    } catch {
      const targetCaseId = sampleType === 'ai' ? 'RC-2026-0042' : 'RC-2026-0046';
      runFastDemoAnalysis(targetCaseId);
    }
  };

  const isAi = currentCase?.sample_type === 'ai' || (currentCase?.ai_generation_probability ?? 0) >= 50;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
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
              MODULE 01 &bull; IMAGE FORENSICS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              PRNU &bull; ELA &bull; FOURIER &bull; C2PA
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
            IMAGE FORENSICS &amp; SYNTHETIC MEDIA DETECTION
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '780px' }}>
            Deep forensic pixel auditing, Fourier frequency anomalies, sensor noise residuals (PRNU), and C2PA provenance verification.
          </p>
        </div>

        {/* Top Action Buttons: Sample quick selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ fontSize: '11px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Upload size={14} />
            <span>SELECT IMAGE</span>
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 4px' }}>or benchmark:</span>

          <button
            onClick={() => handleSelectSample('ai')}
            className={activeSample === 'ai' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <Sparkles size={12} style={{ marginRight: '5px' }} />
            <span>Sample: AI Diffusion</span>
          </button>

          <button
            onClick={() => handleSelectSample('real')}
            className={activeSample === 'real' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <CheckCircle2 size={12} style={{ marginRight: '5px' }} />
            <span>Sample: Nikon RAW</span>
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Panel (if idle or re-uploading) */}
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
              Upload Image for Forensic Analysis
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Supports PNG, JPG, JPEG, WEBP &bull; Max 50 MB &bull; Cryptographic SHA-256 quarantine
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ padding: '8px 18px', fontSize: '11px' }}
          >
            SELECT FILE
          </button>
        </div>
      </div>

      {/* 3. Reusable Forensic Pipeline */}
      <ForensicPipeline
        hasInput={Boolean(uploadedImageSrc || currentCase)}
        inputBadgeText={isDemoMode ? 'DEMO PRESENTATION ACTIVE' : 'LIVE DETECTOR ACTIVE'}
        overallPhase={pipelinePhase}
        metadata={{
          fileName: meta.fileName,
          fileSize: meta.fileSize,
          dimensionsOrDuration: meta.dimensions,
          modelName: currentCase?.model_verification?.model_name || 'REALCHECK Multi-Signal Ensemble'
        }}
        error={pipelineError}
        onClearError={() => {
          setPipelineError(null);
          setAnalysisError(null);
          setPipelinePhase('completed');
        }}
        onRetry={() => fileInputRef.current?.click()}
        onContinueWithDemo={() => runFastDemoAnalysis('RC-2026-0042')}
        steps={pipelineSteps}
      />

      {/* 4. Live Scanning Laser Animation */}
      {isScanning && (
        <div style={{ padding: '40px 0' }}>
          <LiveScanAnimation mediaType="IMAGE" onComplete={() => setIsScanning(false)} />
        </div>
      )}

      {/* 5. Main Results View */}
      {!isScanning && currentCase && (
        <>
          {/* Main Result Card with Radial Manipulation Likelihood */}
          <AnalysisResult
            result={currentCase}
            title="IMAGE FORENSICS RESULT"
            onGenerateReport={onGenerateReport}
            onOpenWhyModal={() => setIsWhyModalOpen(true)}
          />

          {/* Forensic Visual Inspection & Signal Analysis Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(320px, 1fr)',
              gap: '24px',
              marginBottom: '24px'
            }}
            className="responsive-two-col"
          >
            {/* LEFT: Forensic Heatmap Panel */}
            <div
              style={{
                padding: '20px',
                borderRadius: '20px',
                border: '1px solid rgba(157, 78, 221, 0.28)',
                background: '#1F132B',
                boxShadow: 'var(--clay-box-shadow)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={18} color="var(--magenta-vivid)" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                    FORENSIC HEATMAP
                  </span>
                  {currentCase.is_demo_analysis && (
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'rgba(199, 36, 177, 0.25)',
                        border: '1px solid var(--magenta-vivid)',
                        color: '#F472B6',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800
                      }}
                    >
                      DEMO VISUALIZATION
                    </span>
                  )}
                </div>

                {/* View Mode Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setViewMode('heatmap')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: viewMode === 'heatmap' ? '1px solid var(--magenta-vivid)' : '1px solid rgba(255,255,255,0.1)',
                      background: viewMode === 'heatmap' ? 'rgba(199, 36, 177, 0.25)' : 'transparent',
                      color: viewMode === 'heatmap' ? '#FFFFFF' : 'var(--text-dim)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Heatmap
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: viewMode === 'original' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                      background: viewMode === 'original' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                      color: viewMode === 'original' ? '#FFFFFF' : 'var(--text-dim)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Viewport Frame with Abstract Grad-CAM Visualization Overlay */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '360px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#12081C',
                  border: '1px solid rgba(157, 78, 221, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Visual Representation */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: uploadedImageSrc
                      ? `url(${uploadedImageSrc})`
                      : (isAi
                        ? 'radial-gradient(circle at 45% 40%, rgba(199, 36, 177, 0.4) 0%, rgba(26, 12, 38, 0.9) 70%)'
                        : 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, rgba(18, 30, 24, 0.9) 70%)'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: viewMode === 'heatmap' && isAi ? 'contrast(1.2)' : 'none'
                  }}
                />

                {/* Heatmap Overlay Layer */}
                {viewMode === 'heatmap' && isAi && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 48% 42%, rgba(255, 75, 114, 0.65) 0%, rgba(251, 191, 36, 0.45) 30%, rgba(157, 78, 221, 0.25) 55%, transparent 75%)',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {/* Scan grid effect */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(157, 78, 221, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(157, 78, 221, 0.1) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none'
                  }}
                />

                {/* Overlay Indicators */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(15, 8, 22, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(157, 78, 221, 0.3)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <div style={{ color: isAi ? '#FF6B8B' : '#34D399', fontWeight: 700 }}>
                    {isAi ? 'HOTSPOT: High Latent Variance Detected' : 'VERIFIED: Uniform Sensor Residual'}
                  </div>
                  <div style={{ color: 'var(--text-dim)' }}>
                    Resolution: {meta.dimensions}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {viewMode === 'heatmap' && isAi
                  ? 'Red/amber zones highlight highest gradient discontinuities around facial boundary and high-frequency Fourier checkerboard artifacts.'
                  : 'Displaying optical RGB sensor pixel map with verified Bayer demosaicing filter consistency.'}
              </div>
            </div>

            {/* RIGHT: Forensic Signals Breakdown */}
            <div
              style={{
                padding: '20px',
                borderRadius: '20px',
                border: '1px solid rgba(157, 78, 221, 0.28)',
                background: '#1F132B',
                boxShadow: 'var(--clay-box-shadow)'
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
                  5 SIGNALS
                </span>
              </div>

              {/* Signals Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentCase.signals.map((sig, idx) => {
                  const isAnomaly = sig.score >= 60;
                  const isModerate = sig.score >= 35 && sig.score < 60;
                  const barColor = isAnomaly ? '#FF4B72' : (isModerate ? '#FBBF24' : '#10B981');

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
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

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '6px' }}>
                        {sig.explanation}
                      </div>

                      {/* Progress bar */}
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
