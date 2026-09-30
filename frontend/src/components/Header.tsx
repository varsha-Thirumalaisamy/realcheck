import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Cpu,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { InvestigationResult } from '../types/forensics';

interface HeaderProps {
  onOpenSearch: () => void;
  activeCaseId?: string;
  setMobileMenuOpen: (open: boolean) => void;
  onSelectCase?: (caseId: string) => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  activeCaseId = 'RC-2026-0042',
  setMobileMenuOpen,
  onSelectCase,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT'>('ALL');
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const caseMenuRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (caseMenuRef.current && !caseMenuRef.current.contains(e.target as Node)) {
        setIsCaseMenuOpen(false);
      }
      if (telemetryRef.current && !telemetryRef.current.contains(e.target as Node)) {
        setIsTelemetryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const allCases: InvestigationResult[] = Object.values(SAMPLE_CASES);

  // Filter cases based on active filter and search query
  const filteredCases = allCases.filter(c => {
    const matchesFilter = activeFilter === 'ALL' || c.media_type === activeFilter;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(q) ||
      c.file_name.toLowerCase().includes(q) ||
      c.assessment.toLowerCase().includes(q) ||
      c.media_type.toLowerCase().includes(q) ||
      c.signals.some(s => s.name.toLowerCase().includes(q))
    );
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon size={13} color="var(--cyan-primary)" />;
      case 'VIDEO': return <Video size={13} color="var(--blue-soft)" />;
      case 'AUDIO': return <Mic size={13} color="var(--risk-low)" />;
      case 'TEXT': return <FileText size={13} color="#a855f7" />;
      default: return <ShieldAlert size={13} color="var(--cyan-primary)" />;
    }
  };

  const currentCase = SAMPLE_CASES[activeCaseId];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 clamp(16px, 3vw, 28px)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto'
        }}
      >
        {/* Left Side: Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="mobile-only" style={{ marginRight: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Search, Neural Status, Active Dossier Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          
          {/* 1. UNIQUE INTERACTIVE FORENSIC SEARCH BAR */}
          <div ref={searchContainerRef} style={{ position: 'relative' }}>
            {/* Search Input Trigger Box */}
            <div
              className="desktop-only-flex"
              style={{
                height: '34px',
                width: isSearchOpen ? '320px' : '250px',
                background: isSearchOpen ? 'var(--bg-card-solid)' : 'var(--bg-deep)',
                border: isSearchOpen ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0 10px',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isSearchOpen ? '0 0 14px rgba(0, 240, 255, 0.2)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxSizing: 'border-box'
              }}
            >
              <Search size={14} color="var(--cyan-primary)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search cases, media, signals..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)'
                }}
              />

              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                  <X size={12} />
                </button>
              ) : (
                <kbd
                  onClick={onOpenSearch}
                  style={{
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '2px 5px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    lineHeight: 1,
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                  title="Open Full Command Center"
                >
                  Ctrl+K
                </kbd>
              )}
            </div>

            {/* Mobile search trigger */}
            <button
              onClick={onOpenSearch}
              className="mobile-only"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
            >
              <Search size={18} color="var(--cyan-primary)" />
            </button>

            {/* LIVE FORENSIC SEARCH FLYOUT DROPDOWN */}
            {isSearchOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '420px',
                  maxWidth: '92vw',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.35), 0 0 20px rgba(0, 240, 255, 0.1)',
                  padding: '12px',
                  zIndex: 100,
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* Filter chips row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
                  {(['ALL', 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      style={{
                        background: activeFilter === filter ? 'rgba(0, 240, 255, 0.15)' : 'var(--bg-deep)',
                        border: activeFilter === filter ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                        color: activeFilter === filter ? 'var(--cyan-primary)' : 'var(--text-muted)',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                  <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {filteredCases.length} records
                  </div>
                </div>

                {/* Results List */}
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredCases.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                      No forensic records matching "{searchQuery}" in {activeFilter}
                    </div>
                  ) : (
                    filteredCases.map((c) => (
                      <div
                        key={c.case_id}
                        onClick={() => {
                          onSelectCase?.(c.case_id);
                          onNavigate?.(c.media_type.toLowerCase());
                          setIsSearchOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: c.case_id === activeCaseId ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-deep)',
                          border: c.case_id === activeCaseId ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--cyan-primary)';
                          e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = c.case_id === activeCaseId ? 'var(--cyan-primary)' : 'var(--border-subtle)';
                          e.currentTarget.style.backgroundColor = c.case_id === activeCaseId ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-deep)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ padding: '6px', borderRadius: '4px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getMediaIcon(c.media_type)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                                {c.case_id}
                              </span>
                              <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                {c.media_type}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                              {c.file_name}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                          <span
                            className={
                              c.authenticity_score <= 30
                                ? 'badge-risk-high'
                                : c.authenticity_score <= 60
                                  ? 'badge-risk-medium'
                                  : 'badge-risk-low'
                            }
                            style={{ fontSize: '9px', padding: '1px 6px' }}
                          >
                            {c.authenticity_score}/100
                          </span>
                          <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {c.assessment.replace('Likely ', '')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Shortcuts Footer */}
                <div
                  style={{
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: 'var(--text-dim)'
                  }}
                >
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onOpenSearch();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--cyan-primary)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <span>Open Full Command Palette</span>
                    <ArrowRight size={11} />
                  </button>
                  <span>Click to investigate case</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. UNIQUE NEURAL ENGINE TELEMETRY STATUS PILL */}
          <div ref={telemetryRef} style={{ position: 'relative' }}>
            <div
              className="desktop-only-flex"
              onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
              onMouseEnter={() => setIsTelemetryOpen(true)}
              style={{
                height: '34px',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--risk-low-bg)',
                border: '1px solid var(--risk-low-border)',
                padding: '0 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--risk-low-text)',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
              title="Click to view forensic pipeline telemetry"
            >
              <span className="radar-pulse-dot" />
              <span>AI CORE 4.0</span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--risk-low-text)',
                  lineHeight: 1.3
                }}
              >
                ONLINE
              </span>
            </div>

            {/* Floating Telemetry Tooltip / Card */}
            {isTelemetryOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '300px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                  zIndex: 100,
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--risk-low-text)' }}>
                    <Cpu size={14} />
                    <span>FORENSIC SUBSYSTEMS</span>
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>4/4 READY</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-main)' }}>Vision Transformer (IMG)</span>
                    <span style={{ color: 'var(--risk-low)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>12ms &bull; Active</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-main)' }}>Spatial-Temporal CNN (VID)</span>
                    <span style={{ color: 'var(--risk-low)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>18ms &bull; Active</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-main)' }}>Wav2Vec2 Classifier (AUD)</span>
                    <span style={{ color: 'var(--risk-low)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>9ms &bull; Active</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-main)' }}>Stylometric Profiler (TXT)</span>
                    <span style={{ color: 'var(--risk-low)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>5ms &bull; Active</span>
                  </div>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '10px', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>C2PA Metadata Hash Engine</span>
                  <span style={{ color: 'var(--cyan-primary)' }}>Synchronized</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. UNIQUE ACTIVE CASE DOSSIER SWITCHER PILL */}
          <div ref={caseMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
              className="desktop-only-flex"
              style={{
                height: '34px',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-deep)',
                border: isCaseMenuOpen ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                padding: '0 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
              title="Click to switch active investigation dossier"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {currentCase && getMediaIcon(currentCase.media_type)}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--cyan-primary)'
                  }}
                >
                  {activeCaseId}
                </span>
              </div>
              <ChevronDown
                size={13}
                color="var(--text-dim)"
                style={{
                  transform: isCaseMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Case Switcher Dropdown */}
            {isCaseMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '340px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.35), 0 0 20px rgba(0, 240, 255, 0.08)',
                  zIndex: 100,
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--cyan-primary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    ACTIVE INVESTIGATION DOSSIERS
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>7 CASES</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '300px', overflowY: 'auto' }}>
                  {allCases.map((c) => {
                    const isSelected = c.case_id === activeCaseId;
                    return (
                      <div
                        key={c.case_id}
                        onClick={() => {
                          onSelectCase?.(c.case_id);
                          onNavigate?.(c.media_type.toLowerCase());
                          setIsCaseMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 9px',
                          borderRadius: '6px',
                          background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'var(--bg-deep)',
                          border: isSelected ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--cyan-primary)';
                            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.06)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-deep)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          {getMediaIcon(c.media_type)}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--cyan-primary)' : 'var(--text-main)' }}>
                                {c.case_id}
                              </span>
                              <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                                &bull; {c.media_type}
                              </span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.file_name}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span
                            className={
                              c.authenticity_score <= 30
                                ? 'badge-risk-high'
                                : c.authenticity_score <= 60
                                  ? 'badge-risk-medium'
                                  : 'badge-risk-low'
                            }
                            style={{ fontSize: '9px', padding: '1px 5px' }}
                          >
                            {c.authenticity_score}%
                          </span>
                          {isSelected && <Check size={12} color="var(--cyan-primary)" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
