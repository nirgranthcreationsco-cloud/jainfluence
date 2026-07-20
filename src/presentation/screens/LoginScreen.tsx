import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const navigate = useNavigate();
  const { loginWithEmail, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await loginWithEmail(email, password);
    if (success) navigate('/');
  };

  const fieldWrap = (field: 'email' | 'password'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 0',
    borderBottom: focusedField === field
      ? '1.5px solid #D4AF37'
      : '1px solid rgba(17,17,17,0.1)',
    transition: 'border-color 0.15s ease',
  });

  const inputStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontFamily: 'var(--font-family)',
    color: '#111111',
    width: '100%',
    padding: 0,
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#FAFAFA',
        backgroundImage: `url('https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1080&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: 'pageFadeIn 0.5s ease',
      }}
    >
      {/* Blur Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(250,250,250,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 1,
      }} />

      {/* Floating Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        backgroundColor: '#FFFFFF',
        padding: '36px 24px 32px',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        border: '1px solid rgba(17,17,17,0.04)',
        animation: 'pageFadeIn 0.8s var(--spring-smooth) both',
      }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="15" r="4.5" fill="url(#loginGold)" />
            <circle cx="50" cy="8" r="5" fill="url(#loginGold)" />
            <circle cx="64" cy="15" r="4.5" fill="url(#loginGold)" />
            <circle cx="50" cy="55" r="28" stroke="url(#loginGold)" strokeWidth="1.5" />
            <path d="M50 32 C42 45, 34 55, 34 68 C34 77, 41 83, 50 83 C59 83, 66 77, 66 68 C66 55, 58 45, 50 32 Z" stroke="url(#loginGold)" strokeWidth="2" fill="url(#loginGoldFill)" />
            <defs>
              <linearGradient id="loginGold" x1="50" y1="5" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
              <linearGradient id="loginGoldFill" x1="50" y1="32" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.01" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <Text variant="hero" style={{ color: '#111111', fontWeight: 800, marginBottom: '6px' }}>
            Welcome Back.
          </Text>
          <Text variant="body" style={{ color: '#737373' }}>
            Enter your community.
          </Text>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Email</div>
            <div style={fieldWrap('email')}>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Password</div>
            <div style={{ ...fieldWrap('password'), justifyContent: 'space-between' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{ ...inputStyle, flex: 1 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3A3A3', fontSize: '12px', fontFamily: 'var(--font-family)', flexShrink: 0, paddingLeft: '8px' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,59,48,0.05)', color: '#FF3B30', fontSize: '13px', border: '1px solid rgba(255,59,48,0.1)', marginTop: '12px', animation: 'pageFadeIn 0.2s ease' }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            fullWidth
            style={{ height: '52px', borderRadius: '14px', marginTop: '24px' }}
          >
            {isLoading ? 'Signing in…' : 'Continue'}
          </Button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-family)' }}
          >
            Don't have an account? <strong style={{ color: '#D4AF37' }}>Sign Up</strong>
          </button>
        </div>
      </div>
    </div>
  );
};
