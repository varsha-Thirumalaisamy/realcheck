import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Crosshair, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { ForensicBackground } from '../components/ForensicBackground';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/overview';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendStatus('idle');
    setResendMessage('');
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      login(data.access_token, {
        id: data.user.id,
        name: data.user.email.split('@')[0],
        role: data.user.role
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendStatus === 'loading') return;
    setResendStatus('loading');
    setResendMessage('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to resend');
      }

      setResendStatus('success');
      setResendMessage('A new verification link has been sent to your email.');
    } catch (err: any) {
      setResendStatus('error');
      setResendMessage(err.message || 'An error occurred.');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Note: useGoogleLogin returns an access_token. We send it as token.
          body: JSON.stringify({ token: tokenResponse.access_token, is_access_token: true }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Google Login failed');
        }

        const data = await response.json();
        login(data.access_token, {
          id: data.user.id,
          name: data.user.email.split('@')[0],
          role: data.user.role
        });
        navigate(from, { replace: true });
      } catch (err: any) {
        setError('Google sign-in could not be completed. Please try again.');
        console.error('Firebase/Google Error:', err.message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setError('Google sign-in could not be completed. Please try again.');
      console.error('Firebase/Google Error:', error);
    }
  });

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'mock_client_id_for_dev') {
      setError('Google sign-in could not be completed. Please try again.');
      console.error('Firebase/Google Error: OAuth Client ID is missing or invalid.');
      return;
    }
    loginWithGoogle();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--bg-deep)',
      position: 'relative'
    }}>
      <ForensicBackground />
      {/* Left: Branding & Visual (Desktop Only) */}
      <div className="desktop-only-flex" style={{
        flex: 1,
        borderRight: '1px solid var(--border-subtle)',
        background: 'linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-card) 100%)',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(var(--cyan-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div style={{ zIndex: 1, maxWidth: '480px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-body-pattern-1)',
              border: '1px solid var(--cyan-primary)',
              borderRadius: '12px',
              boxShadow: '0 0 24px var(--border-glow)'
            }}>
              <Crosshair size={32} color="var(--cyan-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '3px', color: 'var(--text-main)' }}>
                  REALCHECK
                </span>
                <span style={{
                  fontSize: '18px', fontWeight: 800, letterSpacing: '1px',
                  background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
                  padding: '4px 10px', borderRadius: '6px'
                }}>
                  AI
                </span>
              </div>
              <div style={{ fontSize: '14px', letterSpacing: '1px', color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: '4px' }}>
                Explainable Digital Authenticity
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
            Advanced forensic analysis and authenticity verification for digital media. Securely analyze images, video, audio, and text with explainable AI models.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             {['ISO/IEC 27037 Compliant', 'Zero-Trust Architecture', 'End-to-End Encryption'].map(badge => (
                <div key={badge} style={{
                  background: 'var(--bg-body-pattern-1)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'var(--cyan-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <ShieldCheck size={14} />
                  {badge}
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-card-solid)'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <div className="mobile-only" style={{ marginBottom: '32px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-body-pattern-1)',
                  border: '1px solid var(--cyan-primary)',
                  borderRadius: '8px',
                }}>
                  <Crosshair size={20} color="var(--cyan-primary)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)' }}>
                      REALCHECK
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: 800,
                      background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
                      padding: '2px 6px', borderRadius: '4px'
                    }}>
                      AI
                    </span>
                  </div>
                </div>
              </div>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
            Sign in to access your forensic workspace.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
            
            {error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'var(--risk-high-bg)',
                  border: '1px solid var(--risk-high-border)',
                  color: 'var(--risk-high-text)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>{error}</div>
                </div>
                
                {error === 'Please verify your email before signing in.' && (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendStatus === 'loading'}
                      style={{
                        background: 'transparent',
                        color: 'var(--cyan-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: resendStatus === 'loading' ? 'not-allowed' : 'pointer',
                        opacity: resendStatus === 'loading' ? 0.7 : 1
                      }}
                    >
                      {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    
                    {resendStatus === 'error' && (
                      <div style={{ color: 'var(--risk-high-text)', fontSize: '13px', marginTop: '8px' }}>
                        {resendMessage}
                      </div>
                    )}
                    {resendStatus === 'success' && (
                      <div style={{ color: 'var(--status-success)', fontSize: '13px', marginTop: '8px' }}>
                        {resendMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cyan-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cyan-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-dim)', display: 'flex'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" style={{ 
                color: 'var(--cyan-primary)', fontSize: '14px', textDecoration: 'none', fontWeight: 500 
              }}>
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '8px',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(0, 210, 255, 0.2)'
              }}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--cyan-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Create account
              </Link>
            </div>
            
            <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ padding: '0 16px', color: 'var(--text-dim)', fontSize: '13px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'var(--bg-deep)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-body-pattern-1)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-deep)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
            
          </div>
        </div>
      </div>
    );
  };
