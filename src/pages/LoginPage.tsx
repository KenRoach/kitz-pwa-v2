import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

type Phase = 'email' | 'otp';

export function LoginPage() {
  const dict = useAppStore((s) => s.dict);
  const setUser = useAppStore((s) => s.setUser);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = useCallback(async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api('/api/auth/sign-in/email-otp', {
        method: 'POST',
        body: { email: email.trim() },
      });
      setPhase('otp');
    } catch {
      setError(dict.common.error);
    } finally {
      setLoading(false);
    }
  }, [email, dict.common.error]);

  const verifyOtp = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api<{ user: { id: string; email: string; name: string; tenantId: string; role: string }; token: string }>(
        '/api/auth/verify-otp',
        { method: 'POST', body: { email: email.trim(), code: code.trim() } },
      );
      localStorage.setItem('kitz-token', res.token);
      setUser(res.user);
      navigate('/chat');
    } catch {
      setError(dict.common.error);
    } finally {
      setLoading(false);
    }
  }, [email, code, dict.common.error, setUser, navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-mark">K</span>
        </div>
        <h1 className="login-title">{dict.auth.login}</h1>

        {phase === 'email' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestOtp();
            }}
          >
            <input
              type="email"
              className="login-input"
              placeholder={dict.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <button className="btn-primary full-width" type="submit" disabled={loading}>
              {loading ? dict.common.loading : dict.auth.login}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyOtp();
            }}
          >
            <p className="otp-hint">{email}</p>
            <input
              type="text"
              className="login-input otp-input"
              placeholder={dict.auth.otp}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              autoFocus
              inputMode="numeric"
              required
            />
            <button className="btn-primary full-width" type="submit" disabled={loading}>
              {loading ? dict.common.loading : dict.auth.verifyCode}
            </button>
            <button
              className="btn-link"
              type="button"
              onClick={() => {
                setPhase('email');
                setCode('');
              }}
            >
              {dict.common.back}
            </button>
          </form>
        )}

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
