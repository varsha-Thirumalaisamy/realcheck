import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      return;
    }

    const verifyToken = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Verification failed');
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'An error occurred during verification.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-deep)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--bg-card-solid)',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        
        {status === 'verifying' && (
          <>
            <Loader2 size={48} className="spin-animation" color="var(--cyan-primary)" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Verifying Email...
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={56} color="var(--status-success)" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Email verified successfully.
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Your email has been verified. You can now access your account.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Continue to Sign In
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={56} color="var(--risk-high-text)" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Verification Failed
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};
