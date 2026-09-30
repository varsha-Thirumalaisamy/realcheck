import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Sliders, 
  FileText, 
  Shield, 
  Database, 
  Info,
  LogOut,
  Trash2,
  Key,
  Moon,
  Sun,
  Monitor,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Theme state
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  const [saved, setSaved] = useState(false);
  const [threshold, setThreshold] = useState('30');
  const [defaultModel, setDefaultModel] = useState('ensemble');
  const [c2paStrict, setC2paStrict] = useState(true);
  const [autoReport, setAutoReport] = useState(true);

  // UI-only Preferences State
  const [prefs, setPrefs] = useState({
    notifyAnalysis: true,
    notifyAlerts: true,
    autoSave: true,
    showConfidence: true,
    showEvidence: true,
    reportBreakdown: true,
    reportTextMetrics: true
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    let activeTheme = mode;
    if (mode === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all recent investigations? This action cannot be undone.')) {
      alert('Recent investigations cleared.');
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '8px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
      <Icon size={18} color="var(--cyan-primary)" />
      <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>{title}</h2>
    </div>
  );

  const ToggleRow = ({ label, description, checked, onChange }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{label}</div>
        {description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</div>}
      </div>
      <button 
        onClick={onChange}
        style={{
          position: 'relative',
          width: '38px',
          height: '20px',
          borderRadius: '10px',
          background: checked ? 'var(--cyan-primary)' : 'var(--bg-deep)',
          border: `1px solid ${checked ? 'var(--cyan-primary)' : 'var(--border-subtle)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}
      >
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              PLATFORM CONFIGURATION
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.4px', marginTop: '2px' }}>
            System Settings &amp; Preferences
          </h1>
        </div>

        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: saved ? 'var(--risk-low-bg)' : 'var(--btn-primary-bg)',
            color: saved ? 'var(--risk-low-text)' : 'var(--btn-primary-text)',
            border: saved ? '1px solid var(--risk-low-border)' : 'none',
            borderRadius: '8px',
            padding: '9px 18px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(0, 210, 255, 0.2)'
          }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 1. Account */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <SectionHeader icon={User} title="ACCOUNT PROFILE" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name || 'Lead Investigator'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</div>
              <div style={{ fontSize: '14px' }}>{user?.email || (user?.name ? `${user.name.toLowerCase().replace(/\s+/g, '.')}@realcheck.ai` : 'investigator@realcheck.ai')}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Role &amp; Permissions</div>
              <div style={{ fontSize: '14px', color: 'var(--cyan-primary)', fontWeight: 600 }}>Forensic Examiner / Tier 3</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
              background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px',
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '12px', fontWeight: 500
            }}>
              <Key size={14} />
              Change Password
            </button>
            <button 
              onClick={logout}
              style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px',
              color: 'var(--risk-high-text)', cursor: 'pointer', fontSize: '12px', fontWeight: 500
            }}>
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* 2. Appearance & Theme */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={18} color="var(--cyan-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Interface Theme</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose your preferred color theme or match system settings.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => handleThemeChange('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: themeMode === 'dark' ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                border: themeMode === 'dark' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                color: themeMode === 'dark' ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Moon size={16} />
              <span>Dark Forensic</span>
            </button>

            <button
              onClick={() => handleThemeChange('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: themeMode === 'light' ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                border: themeMode === 'light' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                color: themeMode === 'light' ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Sun size={16} />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => handleThemeChange('system')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: themeMode === 'system' ? 'var(--bg-body-pattern-1)' : 'var(--bg-card)',
                border: themeMode === 'system' ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                color: themeMode === 'system' ? 'var(--cyan-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Monitor size={16} />
              <span>System Default</span>
            </button>
          </div>
        </div>

        {/* 3. Detection & Forensic Thresholds */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={18} color="var(--cyan-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Forensic Anomaly Sensitivity</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calibrate threshold triggers for High Risk classification and alert flags.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                High-Risk Threshold Score: {threshold} / 100
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Cases scoring &le; {threshold} will be flagged as High Risk requiring mandatory manual review.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Default Engine Pipeline
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '13px'
                }}
              >
                <option value="ensemble">Multi-Scale Ensemble (VisionTransformer + Spectral + Spatial)</option>
                <option value="spectral">Spectral FFT Priority</option>
                <option value="temporal">Temporal Optical Flow Optimized</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Security & C2PA Provenance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="var(--cyan-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>C2PA &amp; Cryptographic Provenance</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage strict manifest checks and cryptographic certificate validation.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={c2paStrict}
                onChange={(e) => setC2paStrict(e.target.checked)}
                style={{ accentColor: 'var(--cyan-primary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                Require C2PA manifest verification on enterprise batch ingestion
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoReport}
                onChange={(e) => setAutoReport(e.target.checked)}
                style={{ accentColor: 'var(--cyan-primary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                Automatically generate explainable forensic summary cards for all investigations
              </span>
            </label>
          </div>
        </div>

        {/* 5. Notifications & Workflow Preferences */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <SectionHeader icon={Bell} title="NOTIFICATIONS &amp; WORKSPACE" />
          <ToggleRow 
            label="Analysis Completed Alerts" 
            description="Receive desktop/app alerts when long-running media processing finishes."
            checked={prefs.notifyAnalysis}
            onChange={() => togglePref('notifyAnalysis')}
          />
          <ToggleRow 
            label="High-Risk Investigation Alerts" 
            description="Get immediate visual indicators on critical risk thresholds."
            checked={prefs.notifyAlerts}
            onChange={() => togglePref('notifyAlerts')}
          />
          <ToggleRow 
            label="Auto-Save Investigations" 
            description="Automatically persist all analyzed media to your workspace cases."
            checked={prefs.autoSave}
            onChange={() => togglePref('autoSave')}
          />
          <ToggleRow 
            label="Show Confidence Detail Badges" 
            description="Display AI model confidence intervals on the forensic dashboard."
            checked={prefs.showConfidence}
            onChange={() => togglePref('showConfidence')}
          />
          <ToggleRow 
            label="Show Deep Forensic Evidence Drawers" 
            description="Display deep-level sensor residuals and tensor highlights by default."
            checked={prefs.showEvidence}
            onChange={() => togglePref('showEvidence')}
          />
        </div>

        {/* 6. Report Preferences */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <SectionHeader icon={FileText} title="REPORT PREFERENCES" />
          <ToggleRow 
            label="Include Evidence Breakdown JSON" 
            description="Attach raw forensic telemetry and JSON schema to exported forensic reports."
            checked={prefs.reportBreakdown}
            onChange={() => togglePref('reportBreakdown')}
          />
          <ToggleRow 
            label="Include Stylometry &amp; NLP Metrics" 
            description="Include linguistic metrics in combined multi-modal investigation exports."
            checked={prefs.reportTextMetrics}
            onChange={() => togglePref('reportTextMetrics')}
          />
        </div>

        {/* 7. Data Management & Platform Info */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <SectionHeader icon={Database} title="DATA MANAGEMENT" />
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={handleClearData}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px',
                background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px',
                color: 'var(--text-main)', cursor: 'pointer', fontSize: '13px', fontWeight: 500
              }}
            >
              <Trash2 size={15} color="var(--risk-high)" />
              Clear Recent Investigations Cache
            </button>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Warning: This clears your local workspace session cache.
            </div>
          </div>

          <SectionHeader icon={Info} title="PLATFORM INFORMATION" />
          <div style={{ background: 'var(--bg-body-pattern-1)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', marginBottom: '4px' }}>REALCHECK AI</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Explainable Digital Authenticity &amp; Forensic Analysis Platform</div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '12px' }}>
              <div style={{ color: 'var(--text-dim)' }}>Version</div>
              <div style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>2.4.0-enterprise</div>
              <div style={{ color: 'var(--text-dim)' }}>Core Engines</div>
              <div style={{ color: 'var(--text-main)' }}>Vision ViT, 3D-CNN, Spectral ResNet, Stylometric NLP</div>
              <div style={{ color: 'var(--text-dim)' }}>License</div>
              <div style={{ color: 'var(--cyan-primary)' }}>Enterprise Analytics License</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
