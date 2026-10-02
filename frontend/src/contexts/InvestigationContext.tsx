import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface InvestigationContextType {
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  generateNewCaseId: (prefix?: string) => string;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [activeCaseId, setActiveCaseId] = useState('RC-2026-0042');
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('realcheck_demo_mode');
    return saved !== null ? saved === 'true' : true; // Default to Demo Mode for fast presentation
  });

  const setIsDemoMode = (val: boolean) => {
    setIsDemoModeState(val);
    localStorage.setItem('realcheck_demo_mode', String(val));
  };

  const generateNewCaseId = (prefix = 'RC-2026-') => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}${randomNum}`;
    setActiveCaseId(newId);
    return newId;
  };

  return (
    <InvestigationContext.Provider
      value={{
        activeCaseId,
        setActiveCaseId,
        isDemoMode,
        setIsDemoMode,
        generateNewCaseId
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (context === undefined) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
}
