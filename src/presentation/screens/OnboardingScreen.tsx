import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';

export const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const setCompletedOnboarding = useAuthStore((state) => state.setCompletedOnboarding);

  const handleStart = () => {
    setCompletedOnboarding();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: 'var(--color-bg-base)',
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--space-6) var(--space-5) var(--space-8) var(--space-5)',
      }}
    >
      {/* Editorial Hero Image Section */}
      <div
        style={{
          flex: 1,
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 'var(--space-6)',
          animation: 'pageFadeIn 0.8s var(--spring-smooth) both',
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1080&auto=format&fit=crop"
          alt="Atlas Community"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Subtle gradient overlay to mesh with clean background */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(250, 250, 250, 1), rgba(250, 250, 250, 0))',
          }}
        />
      </div>

      {/* Typography Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
          padding: '0 var(--space-2)',
          animation: 'pageFadeIn 0.8s var(--spring-smooth) 0.15s both',
        }}
      >
        <Text
          variant="hero"
          style={{
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--color-text-primary)',
          }}
        >
          Enter Your Community
        </Text>
        <Text
          variant="body"
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-lg)',
            maxWidth: '300px',
          }}
        >
          The digital home of the Jain community.
        </Text>
      </div>

      {/* Action Button */}
      <div
        style={{
          animation: 'pageFadeIn 0.8s var(--spring-smooth) 0.3s both',
        }}
      >
        <Button
          variant="primary"
          fullWidth
          onClick={handleStart}
          style={{
            height: '56px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
          }}
        >
          Get Started
        </Button>
        <Text
          variant="metadata"
          align="center"
          style={{
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-4)',
            fontSize: '12px',
          }}
        >
          By continuing, you agree to our Terms & Conditions.
        </Text>
      </div>
    </div>
  );
};
