import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Fingerprint, FileCode, Clock, HardDrive, CheckCircle2 } from 'lucide-react';

interface EvidenceIntegrityCardProps {
  fileName?: string;
  fileSize?: string;
  hashSha256?: string;
  sha256?: string;
  timestamp?: string;
  c2paStatus?: 'PRESENT' | 'NOT PRESENT' | 'NOT AVAILABLE' | string;
  evidenceStatus?: 'VERIFIED' | 'TAMPERED' | 'UNVERIFIED';
  isDemoAnalysis?: boolean;
  isDemo?: boolean;
}

export const EvidenceIntegrityCard: React.FC<EvidenceIntegrityCardProps> = ({
  fileName = 'evidence_file.bin',
  fileSize = '2.4 MB',
  hashSha256,
  sha256,
  timestamp,
  c2paStatus = 'NOT AVAILABLE',
  evidenceStatus = 'VERIFIED',
  isDemoAnalysis = false,
  isDemo = false
}) => {
  const [copied, setCopied] = useState(false);
  const activeHash = sha256 || hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const formattedTime = timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const showDemoBadge = isDemoAnalysis || isDemo;

  const handleCopyHash = () => {
    if (activeHash) {
      navigator.clipboard.writeText(activeHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(157, 78, 221, 0.28)',
        background: '#1F132B',
        boxShadow: 'var(--clay-box-shadow)',
        marginTop: '16px',
        marginBottom: '20px'
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid rgba(157, 78, 221, 0.2)',
          paddingBottom: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Fingerprint size={18} color="var(--magenta-vivid)" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.6px' }}>
            EVIDENCE INTEGRITY & PROVENANCE
          </span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 800,
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid #10B981',
              color: '#34D399'
            }}
          >
            <CheckCircle2 size={11} />
            <span>{evidenceStatus}</span>
          </div>
        </div>

        {showDemoBadge && (
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(199, 36, 177, 0.18)',
              border: '1px solid rgba(199, 36, 177, 0.4)',
              color: '#F472B6'
            }}
          >
            BENCHMARK RECORD
          </span>
        )}
      </div>

      {/* Grid of properties */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '14px'
        }}
      >
        {/* File Name */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#150C20',
            border: '1px solid rgba(157, 78, 221, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            <FileCode size={12} />
            <span>File Name</span>
          </div>
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#FFFFFF',
              fontWeight: 600,
              marginTop: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={fileName}
          >
            {fileName}
          </div>
        </div>

        {/* File Size */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#150C20',
            border: '1px solid rgba(157, 78, 221, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            <HardDrive size={12} />
            <span>Evidence Size</span>
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#FFFFFF', fontWeight: 600, marginTop: '4px' }}>
            {fileSize}
          </div>
        </div>

        {/* C2PA Provenance */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#150C20',
            border: '1px solid rgba(157, 78, 221, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            <ShieldCheck size={12} />
            <span>C2PA Provenance</span>
          </div>
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: c2paStatus.includes('PRESENT') || c2paStatus.includes('FOUND') ? '#34D399' : '#FBBF24',
              fontWeight: 700,
              marginTop: '4px'
            }}
          >
            {c2paStatus}
          </div>
        </div>

        {/* Timestamp */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#150C20',
            border: '1px solid rgba(157, 78, 221, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            <Clock size={12} />
            <span>Cryptographic Timestamp</span>
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px' }}>
            {formattedTime}
          </div>
        </div>
      </div>

      {/* SHA-256 Hash Bar with Copy Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '12px',
          background: '#12091B',
          border: '1px solid rgba(157, 78, 221, 0.25)',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--magenta-vivid)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
            SHA-256:
          </span>
          <code
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#34D399',
              letterSpacing: '0.4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={activeHash}
          >
            {activeHash}
          </code>
        </div>

        <button
          onClick={handleCopyHash}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: copied ? 'rgba(16, 185, 129, 0.25)' : 'rgba(157, 78, 221, 0.2)',
            border: `1px solid ${copied ? '#10B981' : 'rgba(157, 78, 221, 0.4)'}`,
            color: copied ? '#34D399' : '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'COPIED!' : 'COPY HASH'}</span>
        </button>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4, marginTop: '8px' }}>
        SHA-256 provides a digital fingerprint of the submitted evidence. If the file changes, its hash changes. This is an evidence integrity mechanism, not an AI detector.
      </div>
    </div>
  );
};
