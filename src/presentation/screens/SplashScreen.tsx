import React, { useEffect, useState } from 'react';
import { Text } from '../components/ui/Text';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [logoScale, setLogoScale] = useState(0.9);

  useEffect(() => {
    // Fade in and scale up the gold logo
    const animationTimeout = setTimeout(() => {
      setLogoOpacity(1);
      setLogoScale(1.05);
    }, 100);

    // End splash after 1.2 seconds
    const finishTimeout = setTimeout(() => {
      onFinish();
    }, 1300);

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(finishTimeout);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          transition: 'opacity 1s ease-in-out, transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Custom Premium Gold Typography Logo */}
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 'var(--space-3)' }}>
          <circle cx="36" cy="15" r="4.5" fill="url(#splashGoldGrad)" />
          <circle cx="50" cy="8" r="5" fill="url(#splashGoldGrad)" />
          <circle cx="64" cy="15" r="4.5" fill="url(#splashGoldGrad)" />
          <circle cx="50" cy="55" r="32" stroke="url(#splashGoldGrad)" strokeWidth="2.5" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="50" cy="55" r="28" stroke="url(#splashGoldGrad)" strokeWidth="1.5" />
          <path d="M50 32 C42 45, 34 55, 34 68 C34 77, 41 83, 50 83 C59 83, 66 77, 66 68 C66 55, 58 45, 50 32 Z" stroke="url(#splashGoldGrad)" strokeWidth="2" fill="url(#splashGoldGradFill)" />
          <path d="M50 45 C45 52, 40 60, 40 68 C40 73, 44 78, 50 78 C56 78, 60 73, 60 68 C60 60, 55 52, 50 45 Z" stroke="url(#splashGoldGrad)" strokeWidth="1.5" />
          <line x1="50" y1="32" x2="50" y2="83" stroke="url(#splashGoldGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <defs>
            <linearGradient id="splashGoldGrad" x1="50" y1="5" x2="50" y2="83" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE075" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>
            <linearGradient id="splashGoldGradFill" x1="50" y1="32" x2="50" y2="83" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE075" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>

        <Text
          variant="super-hero"
          style={{
            color: 'var(--color-accent-gold)',
            fontFamily: 'var(--font-family-brand)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 'var(--space-1)',
            fontSize: '36px'
          }}
        >
          Jainfluence
        </Text>
        <Text
          variant="metadata"
          style={{
            color: '#737373',
            fontFamily: 'var(--font-family)',
            fontWeight: 500,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '11px',
            marginTop: 'var(--space-2)',
          }}
        >
          Digital Home
        </Text>
      </div>
    </div>
  );
};
