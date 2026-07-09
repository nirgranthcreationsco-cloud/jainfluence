import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';

export const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [focusedField, setFocusedField] = useState<'phone' | 'name' | null>(null);
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    const success = await login(phone, name);
    if (success) {
      navigate('/');
    }
  };

  const inputContainerStyle = (field: 'phone' | 'name') => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) 0',
    borderBottom: focusedField === field 
      ? '1px solid var(--color-accent-gold)' 
      : '1px solid var(--color-border-light)',
    transition: 'border-color var(--duration-fast) ease',
  });

  const inputStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: 'var(--text-base)',
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-primary)',
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
        padding: 'var(--space-6)',
        backgroundColor: '#FAFAFA',
        backgroundImage: `url('https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1080&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: 'pageFadeIn 0.5s ease',
      }}
    >
      {/* Absolute Blur Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(250, 250, 250, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
      />

      {/* Floating Login Content Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'var(--color-bg-surface)',
          padding: 'var(--space-6) var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(17, 17, 17, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'pageFadeIn 0.8s var(--spring-smooth) both',
        }}
      >
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Text variant="hero" style={{ color: 'var(--color-text-primary)', fontWeight: 800 }}>
            Welcome.
          </Text>
          <Text variant="body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Enter your community.
          </Text>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
              Full Name (First time login)
            </Text>
            <div style={inputContainerStyle('name')}>
              <input
                type="text"
                placeholder="Aarav Jain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
              Phone Number
            </Text>
            <div style={inputContainerStyle('phone')}>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 59, 48, 0.05)',
                color: 'var(--color-error)',
                fontSize: 'var(--text-sm)',
                border: '1px solid rgba(255, 59, 48, 0.1)',
                animation: 'pageFadeIn 0.2s ease',
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            fullWidth
            style={{
              height: '52px',
              borderRadius: 'var(--radius-sm)',
              marginTop: 'var(--space-2)',
            }}
          >
            {isLoading ? 'Entering...' : 'Continue'}
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-5)', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Don't have an account? <strong style={{ color: 'var(--color-accent-gold)' }}>Sign Up</strong>
          </button>
        </div>
      </div>
    </div>
  );
};
