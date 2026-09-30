import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Crosshair, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--bg-deep)',
    }}>
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
            Set a new secure password for your workspace account.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             {['Identity Verification', 'Audit Logged', 'End-to-End Encryption'].map(badge => (
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
            Reset password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
            Enter your new password below.
          </p>

          {!isSuccess ? (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
              
              {error && (
                <div style={{
                  background: 'var(--risk-high-bg)',
                  border: '1px solid var(--risk-high-border)',
                  color: 'var(--risk-high-text)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="password" style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    id="password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                <label htmlFor="confirmPassword" style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    id="confirmPassword"
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
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

              <button 
                type="submit"
                disabled={isLoading || !token}
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
                  cursor: (isLoading || !token) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: (isLoading || !token) ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(0, 210, 255, 0.2)'
                }}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-body-pattern-1)', border: '1px solid var(--border-active)', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success-text)' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>Password Reset Successful</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Your password has been securely updated. Redirecting to login...
              </p>
              <Link to="/login" style={{ display: 'inline-block', marginTop: '24px', color: 'var(--cyan-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Go to Sign In now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
