import React, { useState, useRef, useEffect } from 'react';
import { 
  Crosshair, 
  Activity, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText, 
  Settings as SettingsIcon,
  Search, 
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Monitor,
  FolderKanban,
  FileSpreadsheet,
  Network,
  Plus
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { useAuth } from '../contexts/AuthContext';
import { useInvestigation } from '../contexts/InvestigationContext';

interface TopNavigationProps {
  currentTab: string;
  onNavigate: (tab: string, caseId?: string) => void;
  activeCaseId?: string;
  onSelectCase?: (caseId: string) => void;
  onOpenSearch?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onNavigate,
  activeCaseId = 'RC-2026-0042',
  onSelectCase,
  onOpenSearch
}) => {
  const { user, logout } = useAuth();
  const { isDemoMode, setIsDemoMode, generateNewCaseId } = useInvestigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  const caseMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (caseMenuRef.current && !caseMenuRef.current.contains(e.target as Node)) {
        setIsCaseMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (telemetryRef.current && !telemetryRef.current.contains(e.target as Node)) {
        setIsTelemetryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const applyTheme = (mode: 'light' | 'dark' | 'system') => {
      let activeTheme = mode;
      if (mode === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };
    applyTheme(themeMode);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const cycleTheme = () => {
    setThemeMode((prev) => {
      let nextMode: 'light' | 'dark' | 'system' = 'system';
      if (prev === 'system') nextMode = 'dark';
      else if (prev === 'dark') nextMode = 'light';
      else if (prev === 'light') nextMode = 'system';
      localStorage.setItem('theme', nextMode);
      return nextMode;
    });
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: VideoIcon },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'workspace', label: 'Workspace', icon: FolderKanban },
  ];

  const secondaryNavItems = [
    { id: 'reports', label: 'Forensic Reports', icon: FileSpreadsheet },
    { id: 'ai-hub', label: 'AI Hub & Neural Routing', icon: Network },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  const allCases = Object.values(SAMPLE_CASES);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(20, 11, 30, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 clamp(16px, 2.5vw, 32px)',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '66px',
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          gap: '12px'
        }}
      >
        {/* Left Side: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <button
            onClick={() => handleNavClick('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1F132B',
                border: '1px solid rgba(157, 78, 221, 0.35)',
                borderRadius: '10px',
                boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4), inset 2px 2px 4px rgba(255, 255, 255, 0.15), inset -2px -2px 4px rgba(0, 0, 0, 0.6)',
                flexShrink: 0
              }}
            >
              <Crosshair size={19} color="var(--magenta-vivid)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '1px', color: '#FFFFFF' }}>
                REALCHECK
              </span>
              <span
                style={{
                  fontSize: '11px',
                  background: 'var(--btn-primary-bg)',
                  color: '#FFFFFF',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(157, 78, 221, 0.4)'
                }}
              >
                AI
              </span>
            </div>
          </button>
        </div>

        {/* Center: Main Horizontal Navigation (Desktop/Tablet) */}
        <nav
          className="desktop-only-flex"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 8, 22, 0.6)',
            padding: '4px 6px',
            borderRadius: '9999px',
            border: '1px solid rgba(157, 78, 221, 0.15)',
            boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.6)'
          }}
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.22s ease',
                  boxShadow: isActive
                    ? '0 6px 16px rgba(157, 78, 221, 0.45), inset 2px 2px 4px rgba(255, 255, 255, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.45)'
                    : 'none',
                }}
              >
                <Icon size={15} color={isActive ? '#FFFFFF' : 'var(--text-dim)'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More menu dropdown for Workspace/Cases, Reports, AI Hub */}
          <div ref={moreMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '9999px',
                border: ['workspace', 'cases', 'reports', 'ai-hub'].includes(currentTab)
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid transparent',
                background: ['workspace', 'cases', 'reports', 'ai-hub'].includes(currentTab)
                  ? 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)'
                  : 'transparent',
                color: ['workspace', 'cases', 'reports', 'ai-hub'].includes(currentTab) ? '#FFFFFF' : 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              title="Additional forensic modules"
            >
              <span>Workspace</span>
              <ChevronDown size={13} style={{ transform: isMoreMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isMoreMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: 0,
                  width: '230px',
                  background: '#1B1028',
                  border: '1px solid rgba(157, 78, 221, 0.35)',
                  borderRadius: '16px',
                  padding: '8px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.1)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: isSelected ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                        background: isSelected ? 'rgba(157, 78, 221, 0.3)' : 'transparent',
                        color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        textAlign: 'left'
                      }}
                    >
                      <Icon size={16} color="var(--magenta-vivid)" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div style={{ height: '1px', background: 'rgba(157, 78, 221, 0.2)', margin: '4px 0' }} />
                <button
                  onClick={() => handleNavClick('new-investigation')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--btn-primary-bg)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  <Plus size={14} />
                  <span>New Investigation</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Controls: Search, Telemetry Badge, Dossier Switcher, Theme & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          
          {/* Quick Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="desktop-only-flex"
            style={{
              height: '36px',
              padding: '0 14px',
              background: '#140B1E',
              border: '1px solid rgba(157, 78, 221, 0.28)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-dim)',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Search size={14} color="var(--text-dim)" />
            <span>Search cases, media...</span>
            <kbd
              style={{
                fontSize: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 5px',
                borderRadius: '4px',
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              Ctrl+K
            </kbd>
          </button>

          {/* PRESENTATION MODE TOGGLE: LIVE MODE | DEMO MODE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#12081C',
              border: isDemoMode ? '1px solid rgba(199, 36, 177, 0.45)' : '1px solid rgba(16, 185, 129, 0.45)',
              borderRadius: '9999px',
              padding: '2px',
              boxShadow: isDemoMode ? '0 0 14px rgba(199, 36, 177, 0.3)' : '0 0 14px rgba(16, 185, 129, 0.3)',
              height: '36px',
              boxSizing: 'border-box'
            }}
            title="Presentation Mode: Toggle between Live Backend Detector API and Fast Deterministic Demo Mode (3-5s for presentations)"
          >
            <button
              onClick={() => setIsDemoMode(false)}
              style={{
                height: '30px',
                padding: '0 11px',
                borderRadius: '9999px',
                border: 'none',
                background: !isDemoMode ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
                color: !isDemoMode ? '#FFFFFF' : 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
                boxShadow: !isDemoMode ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: !isDemoMode ? '#FFFFFF' : '#10B981' }} />
              <span>LIVE</span>
            </button>

            <button
              onClick={() => setIsDemoMode(true)}
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: '9999px',
                border: 'none',
                background: isDemoMode ? 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)' : 'transparent',
                color: isDemoMode ? '#FFFFFF' : 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
                boxShadow: isDemoMode ? '0 2px 8px rgba(199, 36, 177, 0.45)' : 'none'
              }}
            >
              <Sparkles size={12} color={isDemoMode ? '#FFFFFF' : 'var(--magenta-vivid)'} />
              <span>DEMO MODE</span>
            </button>
          </div>

          {/* AI Core 4.0 Status Pill */}
          <div ref={telemetryRef} style={{ position: 'relative' }} className="desktop-only-flex">
            <button
              onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
              style={{
                height: '36px',
                padding: '0 12px',
                background: '#140B1E',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.5)'
              }}
              title="Neural Engine Telemetry"
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981'
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                AI CORE 4.0
              </span>
              <span
                style={{
                  fontSize: '9px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  padding: '2px 5px',
                  borderRadius: '9999px',
                  fontWeight: 800
                }}
              >
                ONLINE
              </span>
            </button>

            {isTelemetryOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '260px',
                  background: '#1B1028',
                  border: '1px solid rgba(157, 78, 221, 0.35)',
                  borderRadius: '16px',
                  padding: '14px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                  zIndex: 200,
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Sparkles size={14} color="var(--magenta-vivid)" />
                  <span style={{ fontWeight: 800, color: '#FFFFFF' }}>Neural Pipeline Telemetry</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Primary Model:</span>
                    <strong style={{ color: 'var(--magenta-vivid)' }}>Reality Defender</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Fallback Heuristic:</span>
                    <strong style={{ color: '#34D399' }}>Local Multi-Signal</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Audit Standard:</span>
                    <strong style={{ color: '#FFFFFF' }}>C2PA / SHA-256</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dossier Switcher */}
          <div ref={caseMenuRef} style={{ position: 'relative' }} className="desktop-only-flex">
            <button
              onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
              style={{
                height: '36px',
                padding: '0 12px',
                background: '#140B1E',
                border: '1px solid rgba(157, 78, 221, 0.3)',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>{activeCaseId}</span>
              <ChevronDown size={14} color="var(--text-dim)" style={{ transform: isCaseMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isCaseMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '280px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  background: '#1B1028',
                  border: '1px solid rgba(157, 78, 221, 0.35)',
                  borderRadius: '16px',
                  padding: '8px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', padding: '6px 10px', fontWeight: 800, textTransform: 'uppercase' }}>
                  Select Investigation Case
                </div>
                {allCases.map((c) => (
                  <button
                    key={c.case_id}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(c.case_id);
                      setIsCaseMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: c.case_id === activeCaseId ? 'rgba(157, 78, 221, 0.25)' : 'transparent',
                      border: c.case_id === activeCaseId ? '1px solid rgba(157, 78, 221, 0.4)' : 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                        {c.case_id}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.file_name}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: c.sample_type === 'ai' ? 'rgba(255, 75, 114, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: c.sample_type === 'ai' ? '#FF6B8B' : '#34D399'
                      }}
                    >
                      {c.sample_type === 'ai' ? 'SYNTHETIC' : 'AUTHENTIC'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme & User Dropdown */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1F132B 0%, #2A173B 100%)',
                border: '1px solid rgba(157, 78, 221, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
              title="Account & Preferences"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </button>

            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '220px',
                  background: '#1B1028',
                  border: '1px solid rgba(157, 78, 221, 0.35)',
                  borderRadius: '16px',
                  padding: '10px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(157, 78, 221, 0.2)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{user?.name || 'Forensic Investigator'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{user?.email || 'investigator@realcheck.ai'}</div>
                </div>

                <button
                  onClick={cycleTheme}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {themeMode === 'system' ? <Monitor size={15} /> : themeMode === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                  <span>Theme: {themeMode.toUpperCase()}</span>
                </button>

                <button
                  onClick={() => {
                    handleNavClick('settings');
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <SettingsIcon size={15} />
                  <span>Platform Settings</span>
                </button>

                <div style={{ height: '1px', background: 'rgba(157, 78, 221, 0.2)' }} />

                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FF6B8B',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="mobile-only">
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#1F132B',
                border: '1px solid rgba(157, 78, 221, 0.3)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 300,
            display: 'flex',
            justifyContent: 'flex-start'
          }}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              background: '#140B1E',
              borderRight: '1px solid rgba(157, 78, 221, 0.3)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(157, 78, 221, 0.2)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crosshair size={20} color="var(--magenta-vivid)" />
                <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '16px' }}>REALCHECK AI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, paddingLeft: '8px' }}>NAVIGATION</div>
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isActive ? 'var(--btn-primary-bg)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                      border: isActive ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ height: '1px', background: 'rgba(157, 78, 221, 0.2)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, paddingLeft: '8px' }}>WORKSPACE</div>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Icon size={16} color="var(--magenta-vivid)" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={cycleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#1F132B',
                  borderRadius: '10px',
                  border: '1px solid rgba(157, 78, 221, 0.2)',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                {themeMode === 'system' ? <Monitor size={16} /> : themeMode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                <span>Theme: {themeMode.toUpperCase()}</span>
              </button>

              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'rgba(255, 75, 114, 0.15)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 75, 114, 0.3)',
                  color: '#FF6B8B',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
