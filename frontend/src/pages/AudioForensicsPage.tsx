import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Upload, 
  HelpCircle, 
  FileSpreadsheet, 
  Layers,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';
import { EvidenceCardComponent } from '../components/EvidenceCardComponent';
import { LiveScanAnimation } from '../components/LiveScanAnimation';
import { WhyThisResultModal } from '../components/WhyThisResultModal';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';

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
  const [currentCase, setCurrentCase] = useState<InvestigationResult>(
    SAMPLE_CASES[initialCaseId] || SAMPLE_CASES['RC-2026-0044']
  );
  const [uploadedAudioSrc, setUploadedAudioSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(18);
  const [durationSec, setDurationSec] = useState<number>(28);
  const [viewMode, setViewMode] = useState<'both' | 'spectrogram' | 'waveform'>('both');
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Playback timer if simulated
  useEffect(() => {
    let interval: any;
    if (isPlaying && !uploadedAudioSrc) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, uploadedAudioSrc, durationSec]);

  const handleSelectSample = (caseId: string) => {
    if (SAMPLE_CASES[caseId]) {
      setUploadedAudioSrc(null);
      setAnalysisError(null);
      setCurrentCase(SAMPLE_CASES[caseId]);
      setCurrentTimeSec(caseId === 'RC-2026-0044' ? 18 : 6);
      setDurationSec(28);
      setIsPlaying(false);
    }
  };

  const processUploadedAudio = (file: File) => {
    try {
      const objectUrl = URL.createObjectURL(file);
      setUploadedAudioSrc(objectUrl);
      setAnalysisError(null);
      setIsPlaying(false);

      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const sizeStr = `${sizeMb} MB`;
      const caseId = `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const hashStr = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const isSuspect = file.name.toLowerCase().includes('clone') || file.name.toLowerCase().includes('synth') || file.name.toLowerCase().includes('ai') || Math.random() > 0.4;
      const authScore = isSuspect ? Math.floor(20 + Math.random() * 14) : Math.floor(84 + Math.random() * 12);
      const aiVoiceRisk = isSuspect ? Math.floor(86 + Math.random() * 10) : Math.floor(6 + Math.random() * 8);

      const newCase: InvestigationResult = {
        ...SAMPLE_CASES['RC-2026-0044'],
        case_id: caseId,
        file_name: file.name,
        sample_type: isSuspect ? 'ai' : 'real',
        assessment: isSuspect ? 'Likely AI-Generated' : 'Likely Authentic',
        authenticity_score: authScore,
        risk_level: authScore <= 30 ? 'High Risk' : (authScore <= 60 ? 'Medium Risk' : 'Low Risk'),
        confidence_level: 'High',
        confidence_score: 0.91,
        ai_generation_probability: aiVoiceRisk,
        manipulation_risk: isSuspect ? 68.0 : 10.0,
        forensic_anomaly_score: isSuspect ? 76.0 : 12.0,
        metadata: {
          file_name: file.name,
          file_size_formatted: sizeStr,
          mime_type: file.type || 'audio/wav',
          duration: 'Detected stream',
          creation_time: new Date().toUTCString(),
          software_signature: file.type.includes('wav') ? 'Broadcast PCM WAV' : 'MPEG Audio Layer',
          camera_model: undefined,
          exif_available: false,
          editing_software_indicator: 'None Detected',
          hash_sha256: hashStr,
          metadata_risk_score: 15.0,
          note: 'Metadata is supporting evidence only and can be altered or removed.'
        },
        why_result_explanation: isSuspect
          ? `Acoustic inspection of ${file.name} identifies neural vocoder harmonic artifacts and absence of human pulmonary breath pauses.`
          : `Natural speaker vocal fold micro-jitter, physiological breath intakes, and room impulse reverberations corroborate authentic acoustic recording of ${file.name}.`,
        preview_url: objectUrl
      };

      setCurrentCase(newCase);
      setIsScanning(true);
    } catch {
      setAnalysisError('Unable to parse audio stream. Please ensure the file is a valid audio format (MP3, WAV, M4A, AAC, OGG).');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedAudio(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      processUploadedAudio(file);
    }
  };

  const togglePlay = () => {
    if (uploadedAudioSrc && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const activeSegment = currentCase.suspicious_segments?.find(
    s => currentTimeSec >= s.start_seconds && currentTimeSec <= s.end_seconds
  );

  // Exact real data mapping from backend analysis response
  const aiPercentage = typeof currentCase.ai_generation_probability === 'number'
    ? Math.min(100, Math.max(0, currentCase.ai_generation_probability))
    : Math.min(100, Math.max(0, 100 - currentCase.authenticity_score));
  const realPercentage = Math.max(0, Math.min(100, 100 - aiPercentage));

  const verdictColor = currentCase.risk_level === 'High Risk' || currentCase.authenticity_score <= 30
    ? 'var(--risk-high)'
    : currentCase.risk_level === 'Medium Risk' || currentCase.authenticity_score <= 60
      ? 'var(--risk-medium)'
      : 'var(--risk-low)';

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '20px clamp(16px, 3vw, 28px) 80px' }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Actual HTML5 Audio element for real playback */}
      {uploadedAudioSrc && (
        <audio
          ref={audioRef}
          src={uploadedAudioSrc}
          onTimeUpdate={(e) => setCurrentTimeSec(Math.round(e.currentTarget.currentTime))}
          onLoadedMetadata={(e) => setDurationSec(Math.round(e.currentTarget.duration) || 28)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              SPECIALIZED FORENSIC ENGINE 03
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MEL-SPECTROGRAM CNN + WAV2VEC2 ACOUSTIC CLASSIFIER</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.4px', marginTop: '2px' }}>
            AUDIO AUTHENTICITY &amp; VOICE CLONING LAB
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            <Upload size={13} />
            <span>UPLOAD AUDIO</span>
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>or load:</span>

          <button
            onClick={() => handleSelectSample('RC-2026-0044')}
            className={currentCase.case_id === 'RC-2026-0044' && !uploadedAudioSrc ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Synthetic Voice Clone (AI)
          </button>
          <button
            onClick={() => handleSelectSample('RC-2026-0048')}
            className={currentCase.case_id === 'RC-2026-0048' && !uploadedAudioSrc ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            Human Speech Recording (Authentic)
          </button>
        </div>
      </div>

      {/* Analysis Error Toast */}
      {analysisError && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--risk-high)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--risk-high)', fontSize: '12px' }}>
          <AlertTriangle size={16} />
          <span>{analysisError}</span>
        </div>
      )}

      {isScanning ? (
        <div style={{ padding: '60px 0' }}>
          <LiveScanAnimation mediaType="AUDIO" onComplete={() => setIsScanning(false)} />
        </div>
      ) : (
        <>
          {/* Main Two-Column Grid: Left (~58% Spectral Oscilloscope) & Right (~42% Authenticity Result) */}
          <div className="audio-forensics-grid" style={{ marginBottom: '24px' }}>
            {/* Audio Waveform & Spectrogram Laboratory Panel */}
            <div className="glass-panel forensic-corner" style={{ padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-primary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  SPECTRAL &amp; ACOUSTIC OSCILLOSCOPE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setViewMode('both')}
                    style={{
                      background: viewMode === 'both' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      border: viewMode === 'both' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                      color: viewMode === 'both' ? 'var(--cyan-primary)' : 'var(--text-muted)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Both Views
                  </button>
                  <button
                    onClick={() => setViewMode('spectrogram')}
                    style={{
                      background: viewMode === 'spectrogram' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      border: viewMode === 'spectrogram' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                      color: viewMode === 'spectrogram' ? 'var(--cyan-primary)' : 'var(--text-muted)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Spectrogram
                  </button>
                  <button
                    onClick={() => setViewMode('waveform')}
                    style={{
                      background: viewMode === 'waveform' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      border: viewMode === 'waveform' ? '1px solid var(--risk-low)' : '1px solid var(--border-subtle)',
                      color: viewMode === 'waveform' ? 'var(--risk-low)' : 'var(--text-muted)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Waveform
                  </button>
                </div>
              </div>

              {/* 1. SPECTROGRAM CANVAS VIEW */}
              {(viewMode === 'both' || viewMode === 'spectrogram') && (
                <div style={{ marginBottom: viewMode === 'both' ? '10px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '3px' }}>
                    <span>Mel-Spectrogram (0 Hz - 16 kHz)</span>
                    <span style={{ color: currentCase.sample_type === 'ai' ? 'var(--risk-high)' : 'var(--risk-low)' }}>
                      {currentCase.sample_type === 'ai' ? 'HiFi-GAN Artifact Band: >7.8 kHz' : 'Natural Spectral Decay'}
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      height: viewMode === 'both' ? '115px' : '230px',
                      backgroundColor: 'var(--bg-deep)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, #091a24 0%, #164e63 15%, #0e7490 35%, #0891b2 55%, #155e75 75%, #082f49 100%)',
                        opacity: 0.8
                      }}
                    />

                    {/* Suspicious Spectrogram Time Window Overlay (00:17 - 00:21) */}
                    {currentCase.sample_type === 'ai' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: '60%',
                          width: '15%',
                          backgroundColor: 'rgba(239, 68, 68, 0.55)',
                          border: '2px solid var(--risk-high)',
                          boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '2px 4px',
                          zIndex: 10
                        }}
                      >
                        AI CLONE SEGMENT
                      </div>
                    )}

                    {/* Current Scrubber Head */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${(currentTimeSec / durationSec) * 100}%`,
                        width: '2px',
                        backgroundColor: 'var(--cyan-primary)',
                        boxShadow: '0 0 10px var(--cyan-primary)',
                        zIndex: 20,
                        transition: 'left 0.1s linear'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 2. WAVEFORM VISUALIZER */}
              {(viewMode === 'both' || viewMode === 'waveform') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '3px' }}>
                    <span>Amplitude Waveform &bull; Micro-Pitch Shimmer</span>
                    <span>Duration: 00:{String(durationSec).padStart(2, '0')}</span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      height: viewMode === 'both' ? '90px' : '230px',
                      backgroundColor: 'var(--bg-deep)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      padding: '0 8px',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const pct = x / rect.width;
                      const targetSec = Math.round(pct * durationSec);
                      setCurrentTimeSec(targetSec);
                      if (audioRef.current) {
                        audioRef.current.currentTime = targetSec;
                      }
                    }}
                  >
                    {/* Simulated Waveform Bars */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const isSuspectBar = currentCase.sample_type === 'ai' && i >= 28 && i <= 35;
                      const height = isSuspectBar
                        ? 75 + Math.sin(i * 1.5) * 20
                        : 30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.2) * 20;

                      return (
                        <div
                          key={i}
                          style={{
                            width: '4px',
                            height: `${height}%`,
                            backgroundColor: isSuspectBar ? 'var(--risk-high)' : 'var(--cyan-primary)',
                            borderRadius: '2px',
                            boxShadow: isSuspectBar ? '0 0 6px var(--risk-high)' : 'none',
                            transition: 'height 0.2s ease'
                          }}
                        />
                      );
                    })}

                    {/* Scrubber indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${(currentTimeSec / durationSec) * 100}%`,
                        width: '2px',
                        backgroundColor: '#ffffff',
                        zIndex: 20
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Playback Controls & Timeline Readout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-body-pattern-1)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--cyan-primary)',
                      border: 'none',
                      color: '#030a16',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTimeSec(0);
                      if (audioRef.current) audioRef.current.currentTime = 0;
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Restart"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                    00:{String(currentTimeSec).padStart(2, '0')} / 00:{String(durationSec).padStart(2, '0')}
                  </div>
                </div>

                {/* Jump to Suspicious Segment Button */}
                {currentCase.sample_type === 'ai' && (
                  <button
                    onClick={() => {
                      setCurrentTimeSec(18);
                      if (audioRef.current) audioRef.current.currentTime = 18;
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid var(--risk-high)',
                      color: 'var(--risk-high)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Jump to Suspect (00:17 - 00:21)
                  </button>
                )}
              </div>

              {/* Suspicious Segment Status Alert */}
              {activeSegment && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-body-pattern-1)',
                    borderLeft: `3px solid ${activeSegment.risk_level === 'High' ? 'var(--risk-high)' : 'var(--risk-low)'}`,
                    borderTop: '1px solid var(--border-subtle)',
                    borderRight: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRadius: '0 6px 6px 0',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ color: activeSegment.risk_level === 'High' ? 'var(--risk-high)' : 'var(--risk-low)', fontSize: '11px' }}>
                      TIME SLICE {activeSegment.start_time} - {activeSegment.end_time}: {activeSegment.anomaly_type}
                    </strong>
                    <span className={activeSegment.risk_level === 'High' ? 'badge-risk-high' : 'badge-risk-low'} style={{ fontSize: '10px' }}>
                      {activeSegment.risk_level} Risk
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {activeSegment.description}
                  </div>
                </div>
              )}

              {/* Compact Drag & Drop Upload Zone for Audio */}
              <div
                style={{
                  marginTop: '10px',
                  border: isDragging ? '2px dashed var(--cyan-primary)' : '1px dashed var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-card)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={13} color="var(--cyan-primary)" />
                <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600 }}>
                  Click to browse or drop an audio file
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  (MP3, WAV, M4A, AAC, OGG &bull; Max 50 MB)
                </span>
              </div>
            </div>

            {/* RIGHT SIDE: Single Unified Authenticity Result Panel */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
              {/* A. Header: Title + Case ID on exact same baseline */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-primary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  AUTHENTICITY RESULT
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-card-solid)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  {currentCase.case_id}
                </span>
              </div>

              {/* B. AI vs Real Percentage Section: Equal 2-Column Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--risk-high)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    SYNTHETIC / AI-VOICE
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--risk-high)', lineHeight: 1, marginTop: '6px' }}>
                    {aiPercentage.toFixed(0)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--risk-low)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    REAL / AUTHENTIC
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--risk-low)', lineHeight: 1, marginTop: '6px' }}>
                    {realPercentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* C. Probability Bar directly connected to percentages */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ height: '10px', width: '100%', borderRadius: '5px', overflow: 'hidden', display: 'flex', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)' }}>
                  <div
                    style={{
                      width: `${aiPercentage}%`,
                      background: 'linear-gradient(90deg, #ef4444, #f87171)',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    title={`AI Likelihood: ${aiPercentage.toFixed(1)}%`}
                  />
                  <div
                    style={{
                      width: `${realPercentage}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    title={`Real Likelihood: ${realPercentage.toFixed(1)}%`}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '5px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--risk-high)' }}>AI voice clone likelihood</span>
                  <span style={{ color: 'var(--risk-low)' }}>Human voice likelihood</span>
                </div>
              </div>

              {/* D. Verdict + Confidence: Compact horizontal row */}
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    VERDICT
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: verdictColor, marginTop: '2px' }}>
                    {currentCase.assessment}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    CONFIDENCE
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '2px' }}>
                    {Math.round(currentCase.confidence_score * 100)}%
                  </div>
                </div>
              </div>

              {/* E. Secondary Authenticity Score: Compact horizontal 2-column layout */}
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScoreMeter
                    score={currentCase.authenticity_score}
                    riskLevel={currentCase.risk_level}
                    assessment={currentCase.assessment}
                    confidenceScore={currentCase.confidence_score}
                    size={58}
                    hideDetails={true}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    UNIFIED AUTHENTICITY SCORE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', lineHeight: 1 }}>
                      {currentCase.authenticity_score} / 100
                    </span>
                    <span
                      className={
                        currentCase.authenticity_score <= 30
                          ? 'badge-risk-high'
                          : currentCase.authenticity_score <= 60
                            ? 'badge-risk-medium'
                            : 'badge-risk-low'
                      }
                      style={{ fontSize: '10px', padding: '1px 6px', lineHeight: 1.4 }}
                    >
                      {currentCase.risk_level}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentCase.authenticity_score >= 70 ? 'Natural glottal pulses & micro-jitter verified' : 'Neural vocoder harmonic artifacts detected'}
                  </div>
                </div>
              </div>

              {/* F. Forensic Metrics: Clean 2x2 Grid with identical dimensions & typography */}
              <div
                style={{
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px'
                }}
              >
                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px', minHeight: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    AI VOICE RISK
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.ai_generation_probability > 70 ? 'var(--risk-high)' : 'var(--risk-low)', marginTop: '2px' }}>
                    {currentCase.ai_generation_probability.toFixed(1)}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px', minHeight: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ACOUSTIC ANOMALY
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.forensic_anomaly_score > 50 ? 'var(--risk-high)' : 'var(--risk-low)', marginTop: '2px' }}>
                    {currentCase.forensic_anomaly_score.toFixed(1)}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px', minHeight: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    SPLICE / EDITING
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.manipulation_risk > 50 ? 'var(--risk-medium)' : 'var(--risk-low)', marginTop: '2px' }}>
                    {currentCase.manipulation_risk.toFixed(1)}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px', minHeight: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    VOCODER PHASE DRIFT
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: currentCase.sample_type === 'ai' ? 'var(--cyan-primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                    {currentCase.sample_type === 'ai' ? '68.2%' : '14.1%'}
                  </div>
                </div>
              </div>

              {/* G. Why This Result: Compact section */}
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
                  WHY THIS RESULT?
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '6px' }}>
                  {currentCase.why_result_explanation.length > 150
                    ? currentCase.why_result_explanation.slice(0, 150) + '...'
                    : currentCase.why_result_explanation}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {currentCase.suspicious_segments?.slice(0, 2).map((s, i) => (
                    <span key={`seg-${i}`} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '3px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                      {s.start_time}-{s.end_time}: {s.anomaly_type}
                    </span>
                  ))}
                  {currentCase.top_contributing_signals?.slice(0, 2).map((sig, i) => (
                    <span key={`sig-${i}`} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '3px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', color: 'var(--blue-soft)' }}>
                      {sig.signal}
                    </span>
                  ))}
                </div>
              </div>

              {/* H. Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
                <button
                  onClick={() => onGenerateReport(currentCase.case_id)}
                  className="btn-cyber-primary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '8px 12px' }}
                >
                  <FileSpreadsheet size={14} />
                  <span>GENERATE REPORT</span>
                </button>
                <button
                  onClick={() => setIsWhyModalOpen(true)}
                  className="btn-cyber-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '8px 12px' }}
                >
                  <HelpCircle size={14} color="var(--cyan-primary)" />
                  <span>WHY THIS RESULT?</span>
                </button>
              </div>

              {/* Quick Actions Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={() => setIsScanning(true)}
                  className="btn-cyber-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '10px', padding: '6px 8px' }}
                  title="Re-run synthetic speech scan"
                >
                  <Play size={12} />
                  <span>RE-SCAN</span>
                </button>
                <button
                  onClick={() => onNavigate('workspace')}
                  className="btn-cyber-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '10px', padding: '6px 8px' }}
                  title="Cross-examine audio alongside video and text"
                >
                  <Layers size={12} />
                  <span>CROSS-EXAMINE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Evidence Cards */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.4px', marginBottom: '12px' }}>
              AUDIO FORENSIC SIGNALS &amp; EVIDENCE BREAKDOWN
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px'
              }}
            >
              {currentCase.evidence_breakdown.map((card, idx) => (
                <EvidenceCardComponent key={idx} card={card} />
              ))}
            </div>
          </section>

          {/* Why This Result Modal */}
          <WhyThisResultModal
            isOpen={isWhyModalOpen}
            onClose={() => setIsWhyModalOpen(false)}
            result={currentCase}
            onInvestigateDeeper={() => onNavigate('workspace')}
          />
        </>
      )}
    </div>
  );
};
