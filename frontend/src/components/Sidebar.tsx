import React, { useState, useEffect } from 'react';
import { 
  Crosshair, 
  Activity, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  FileText, 
  FolderKanban, 
  Network, 
  FileSpreadsheet,
  Settings,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ChevronRight,
  ChevronDown,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isCollapsed,
  setIsCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const { user, logout } = useAuth();
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  const [investigateExpanded, setInvestigateExpanded] = useState(true);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);

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

  const handleTabClick = (id: string) => {
    onTabChange(id);
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  const NavItem = ({ id, label, icon: Icon, isSubItem = false }: any) => {
    const isActive = currentTab === id;
    
    return (
      <button
        onClick={() => handleTabClick(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed && !mobileMenuOpen ? '0' : '12px',
          width: '100%',
          padding: isCollapsed && !mobileMenuOpen ? '10px 0' : `8px 12px`,
          paddingLeft: isSubItem && !isCollapsed && !mobileMenuOpen ? '36px' : (isSubItem && mobileMenuOpen ? '36px' : (isCollapsed && !mobileMenuOpen ? '0' : '12px')),
          justifyContent: isCollapsed && !mobileMenuOpen ? 'center' : 'flex-start',
          background: isActive ? 'var(--bg-body-pattern-1)' : 'transparent',
          color: isActive ? 'var(--cyan-primary)' : 'var(--text-main)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '14px',
          fontWeight: isActive ? 600 : 500,
        }}
        title={isCollapsed && !mobileMenuOpen ? label : undefined}
      >
        <Icon size={18} style={{ minWidth: '18px' }} />
        {(!isCollapsed || mobileMenuOpen) && <span>{label}</span>}
      </button>
    );
  };

  const sidebarContent = (
    <div style={{
      width: mobileMenuOpen ? '280px' : (isCollapsed ? '72px' : '260px'),
      height: '100vh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Brand Header */}
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        padding: isCollapsed && !mobileMenuOpen ? '0' : '0 20px',
        justifyContent: isCollapsed && !mobileMenuOpen ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            position: 'relative', width: '32px', height: '32px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body-pattern-1)',
            border: '1px solid var(--cyan-primary)', borderRadius: '6px',
            boxShadow: '0 0 10px var(--border-glow)', flexShrink: 0
          }}>
            <Crosshair size={18} color="var(--cyan-primary)" />
          </div>
          {(!isCollapsed || mobileMenuOpen) && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px', color: 'var(--text-main)' }}>
                REALCHECK <span style={{ fontSize: '11px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', padding: '2px 4px', borderRadius: '4px', verticalAlign: 'middle' }}>AI</span>
              </span>
            </div>
          )}
        </div>
        
        {mobileMenuOpen ? (
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        ) : (
          <button 
            className="desktop-only"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Primary Action */}
        <button 
          onClick={() => handleTabClick('new-investigation')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            border: 'none', borderRadius: '8px', padding: isCollapsed && !mobileMenuOpen ? '10px 0' : '10px',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(0, 210, 255, 0.2)'
          }}
          title={isCollapsed && !mobileMenuOpen ? "New Investigation" : undefined}
        >
          <Plus size={18} />
          {(!isCollapsed || mobileMenuOpen) && <span>New Investigation</span>}
        </button>

        {/* Main Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem id="overview" label="Overview" icon={Activity} />
        </div>

        {/* Investigate Group */}
        <div>
          {(!isCollapsed || mobileMenuOpen) ? (
            <div 
              onClick={() => setInvestigateExpanded(!investigateExpanded)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', cursor: 'pointer', color: 'var(--text-dim)',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', marginTop: '8px'
              }}
            >
              <span>INVESTIGATE</span>
              {investigateExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }} />
          )}
          
          {(investigateExpanded || (isCollapsed && !mobileMenuOpen)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavItem id="image" label="Image" icon={ImageIcon} isSubItem={true} />
              <NavItem id="video" label="Video" icon={VideoIcon} isSubItem={true} />
              <NavItem id="audio" label="Audio" icon={Mic} isSubItem={true} />
              <NavItem id="text" label="Text" icon={FileText} isSubItem={true} />
            </div>
          )}
        </div>

        {/* Workspace Group */}
        <div>
          {(!isCollapsed || mobileMenuOpen) ? (
            <div 
              onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', cursor: 'pointer', color: 'var(--text-dim)',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', marginTop: '8px'
              }}
            >
              <span>WORKSPACE</span>
              {workspaceExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }} />
          )}
          
          {(workspaceExpanded || (isCollapsed && !mobileMenuOpen)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavItem id="workspace" label="Cases" icon={FolderKanban} isSubItem={true} />
              <NavItem id="reports" label="Reports" icon={FileSpreadsheet} isSubItem={true} />
            </div>
          )}
        </div>

        {/* AI Hub */}
        <div style={{ marginTop: (!isCollapsed || mobileMenuOpen) ? 'auto' : '8px' }}>
          <NavItem id="ai-hub" label="AI Hub" icon={Network} />
        </div>
      </div>

      {/* Footer Section (Profile, Theme, Settings) */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <NavItem id="settings" label="Settings" icon={Settings} />
        
        <button
          onClick={cycleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: isCollapsed && !mobileMenuOpen ? 'center' : 'flex-start',
            gap: '12px', padding: isCollapsed && !mobileMenuOpen ? '10px 0' : '8px 12px',
            background: 'transparent', border: 'none', color: 'var(--text-main)',
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
          }}
          title={isCollapsed && !mobileMenuOpen ? "Toggle Theme" : undefined}
        >
          {themeMode === 'system' ? <Monitor size={18} /> : themeMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          {(!isCollapsed || mobileMenuOpen) && <span style={{ fontSize: '14px', fontWeight: 500 }}>Theme</span>}
        </button>
        
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: isCollapsed && !mobileMenuOpen ? 'center' : 'flex-start',
            gap: '12px', padding: isCollapsed && !mobileMenuOpen ? '10px 0' : '8px 12px',
            background: 'transparent', border: 'none', color: 'var(--risk-high-text)',
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', width: '100%',
            marginTop: '4px'
          }}
          title={isCollapsed && !mobileMenuOpen ? "Sign Out" : undefined}
        >
          <LogOut size={18} />
          {(!isCollapsed || mobileMenuOpen) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Sign Out</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '180px' }}>{user?.name || 'Admin'}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="desktop-only-flex" style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 100, flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {mobileMenuOpen && (
        <div className="mobile-only" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex'
        }}>
          {sidebarContent}
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
