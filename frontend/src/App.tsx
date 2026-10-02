import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TopNavigation } from './components/TopNavigation';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { OverviewPage } from './pages/OverviewPage';
import { NewInvestigationPage } from './pages/NewInvestigationPage';
import { ImageForensicsPage } from './pages/ImageForensicsPage';
import { VideoForensicsPage } from './pages/VideoForensicsPage';
import { AudioForensicsPage } from './pages/AudioForensicsPage';
import { TextStylometryPage } from './pages/TextStylometryPage';
import { InvestigationWorkspacePage } from './pages/InvestigationWorkspacePage';
import { CentralizedAiHubPage } from './pages/CentralizedAiHubPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { ForensicReportsPage } from './pages/ForensicReportsPage';
import { ArchitectureAboutPage } from './pages/ArchitectureAboutPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { SettingsPage } from './pages/SettingsPage';
import { InvestigationProvider, useInvestigation } from './contexts/InvestigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ForensicBackground } from './components/ForensicBackground';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCaseId, setActiveCaseId } = useInvestigation();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Derive current tab from pathname (e.g. /image/123 -> image)
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts[1] || 'overview';
  const urlCaseId = pathParts[2];

  // Sync URL case ID with context
  useEffect(() => {
    if (urlCaseId && urlCaseId !== activeCaseId) {
      setActiveCaseId(urlCaseId);
    }
  }, [urlCaseId, activeCaseId, setActiveCaseId]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleNavigate = (tab: string, caseId?: string) => {
    const staticTabs = ['settings', 'about', 'models', 'new-investigation'];
    if (staticTabs.includes(tab)) {
      navigate(`/${tab}`);
    } else if (caseId && caseId !== 'undefined' && caseId !== 'null') {
      navigate(`/${tab}/${caseId}`);
    } else {
      navigate(`/${tab}`);
    }
  };

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    navigate(`/${currentTab}/${caseId}`);
  };

  const handleGenerateReport = (caseId: string) => {
    setActiveCaseId(caseId);
    navigate(`/reports/${caseId}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-deep)', position: 'relative' }}>
      <ForensicBackground />
      <TopNavigation 
        currentTab={currentTab} 
        onNavigate={handleNavigate}
        activeCaseId={activeCaseId}
        onSelectCase={handleSelectCase}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      
      <main style={{ flex: 1, width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '24px clamp(16px, 2.5vw, 32px)', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          
          <Route path="/new-investigation" element={<NewInvestigationPage onNavigate={handleNavigate} />} />

          <Route path="/overview" element={<OverviewPage key={activeCaseId} onNavigate={handleNavigate} onSelectCase={handleSelectCase} />} />
          <Route path="/overview/:caseId" element={<OverviewPage key={activeCaseId} onNavigate={handleNavigate} onSelectCase={handleSelectCase} />} />
          
          <Route path="/image" element={<ImageForensicsPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          <Route path="/image/:caseId" element={<ImageForensicsPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          
          <Route path="/video" element={<VideoForensicsPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          <Route path="/video/:caseId" element={<VideoForensicsPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          
          <Route path="/audio" element={<AudioForensicsPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          <Route path="/audio/:caseId" element={<AudioForensicsPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          
          <Route path="/text" element={<TextStylometryPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          <Route path="/text/:caseId" element={<TextStylometryPage key={activeCaseId} onGenerateReport={handleGenerateReport} onNavigate={handleNavigate} initialCaseId={activeCaseId} />} />
          
          <Route path="/workspace" element={<InvestigationWorkspacePage key={activeCaseId} onNavigate={handleNavigate} onSelectCase={handleSelectCase} onGenerateReport={handleGenerateReport} />} />
          <Route path="/workspace/:caseId" element={<InvestigationWorkspacePage key={activeCaseId} onNavigate={handleNavigate} onSelectCase={handleSelectCase} onGenerateReport={handleGenerateReport} />} />
          <Route path="/cases" element={<InvestigationWorkspacePage key={activeCaseId} onNavigate={handleNavigate} onSelectCase={handleSelectCase} onGenerateReport={handleGenerateReport} />} />
          <Route path="/cases/:caseId" element={<InvestigationWorkspacePage key={activeCaseId} onNavigate={handleNavigate} onSelectCase={handleSelectCase} onGenerateReport={handleGenerateReport} />} />
          
          <Route path="/ai-hub" element={<CentralizedAiHubPage key={activeCaseId} onNavigate={handleNavigate} />} />
          <Route path="/ai-hub/:caseId" element={<CentralizedAiHubPage key={activeCaseId} onNavigate={handleNavigate} />} />
          
          <Route path="/models" element={<ModelInsightsPage />} />
          
          <Route path="/reports" element={<ForensicReportsPage selectedCaseId={activeCaseId} onNavigate={handleNavigate} />} />
          <Route path="/reports/:caseId" element={<ForensicReportsPage selectedCaseId={activeCaseId} onNavigate={handleNavigate} />} />
          
          <Route path="/about" element={<ArchitectureAboutPage key={activeCaseId} onNavigate={handleNavigate} />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={handleSelectCase}
        onNavigate={handleNavigate}
      />

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id_for_dev';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="*" element={
              <ProtectedRoute>
                <InvestigationProvider>
                  <AppLayout />
                </InvestigationProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
