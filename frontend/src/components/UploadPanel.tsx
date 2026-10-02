import React, { useRef, useState } from 'react';
import { Upload, FileUp, Sparkles, ShieldCheck } from 'lucide-react';

export interface SampleOption {
  id: string;
  label: string;
  type: 'ai' | 'real';
  description?: string;
}

interface UploadPanelProps {
  title: string;
  subtitle: string;
  accept: string;
  mediaTypeLabel: string;
  onFileSelected: (file: File) => void;
  samples?: SampleOption[];
  onSelectSample?: (sample: SampleOption) => void;
  activeSampleId?: string | null;
  buttonLabel?: string;
  inputElement?: React.ReactNode;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  title,
  subtitle,
  accept,
  mediaTypeLabel,
  onFileSelected,
  samples,
  onSelectSample,
  activeSampleId,
  buttonLabel = 'SELECT FILE TO PROCESS',
  inputElement
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    if (file) {
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '24px',
        border: isDragging ? '1px dashed var(--magenta-vivid)' : '1px solid var(--border-subtle)',
        background: isDragging ? 'rgba(31, 19, 43, 0.9)' : 'var(--bg-card)',
        boxShadow: isDragging ? '0 0 30px rgba(199, 36, 177, 0.3)' : 'var(--clay-box-shadow)',
        marginBottom: '24px',
        transition: 'all 0.25s ease'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Optional custom input element (e.g. textarea for text analysis) */}
      {inputElement}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: inputElement ? '12px 16px' : '24px 16px',
          gap: '14px'
        }}
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2A173D 0%, #170C22 100%)',
            border: '1px solid rgba(157, 78, 221, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--magenta-vivid)',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4), inset 2px 2px 4px rgba(255,255,255,0.15)'
          }}
        >
          <Upload size={24} />
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.4px', marginBottom: '6px' }}>
            {title}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>

        {/* Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-cyber-primary"
            style={{
              padding: '10px 22px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileUp size={16} />
            <span>{buttonLabel}</span>
          </button>

          {/* Sample quick buttons if provided */}
          {samples && samples.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 2px' }}>or benchmark:</span>
              {samples.map((sample) => {
                const isSelected = activeSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample && onSelectSample(sample)}
                    className={isSelected ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
                    style={{ fontSize: '11px', padding: '7px 14px' }}
                    title={sample.description || `Analyze ${sample.label}`}
                  >
                    {sample.type === 'ai' ? (
                      <Sparkles size={12} style={{ marginRight: '5px' }} />
                    ) : (
                      <ShieldCheck size={12} style={{ marginRight: '5px' }} />
                    )}
                    <span>{sample.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Forensic attribution footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            fontSize: '10px',
            color: 'var(--text-dim)',
            marginTop: '8px',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div>
            <span>FORMAT: </span>
            <strong style={{ color: 'var(--text-muted)' }}>{mediaTypeLabel}</strong>
          </div>
          <div>
            <span>INTEGRITY: </span>
            <strong style={{ color: '#34D399' }}>SHA-256 Byte Audit</strong>
          </div>
          <div>
            <span>SECURITY: </span>
            <strong style={{ color: 'var(--violet-electric)' }}>Cryptographic Quarantine</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
