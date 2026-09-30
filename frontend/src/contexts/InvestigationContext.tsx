import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InvestigationContextType {
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [activeCaseId, setActiveCaseId] = useState('RC-2026-0042');

  return (
    <InvestigationContext.Provider value={{ activeCaseId, setActiveCaseId }}>
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
