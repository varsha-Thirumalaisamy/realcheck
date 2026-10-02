import React from 'react';
import { Layers, Eye, Activity, SlidersHorizontal } from 'lucide-react';

export interface VisualizationTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface VisualizationPanelProps {
  title?: string;
  tabs?: VisualizationTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  title = 'FORENSIC VISUAL INSPECTION',
  tabs,
  activeTab,
  onTabChange,
  headerRight,
  children
}) => {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--clay-box-shadow)',
        marginBottom: '24px'
      }}
    >
      {/* Header with Title and Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
          marginBottom: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--magenta-vivid)" />
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.6px', textTransform: 'uppercase', margin: 0 }}>
              {title}
            </h3>
          </div>

          {tabs && tabs.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#120A1C',
                padding: '3px',
                borderRadius: '9999px',
                border: '1px solid rgba(157, 78, 221, 0.2)'
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                      background: isActive ? 'linear-gradient(135deg, #C724B1 0%, #9D4EDD 100%)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-dim)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 10px rgba(157, 78, 221, 0.4)' : 'none'
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {headerRight && <div>{headerRight}</div>}
      </div>

      {/* Main Content Area */}
      <div>
        {children}
      </div>
    </div>
  );
};
