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
        <Text
          variant="super-hero"
          style={{
            color: 'var(--color-accent-gold)',
            fontFamily: 'var(--font-family)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '6px',
            marginBottom: 'var(--space-1)',
          }}
        >
          ATLAS
        </Text>
        <div
          style={{
            height: '2px',
            width: '40px',
            backgroundColor: 'var(--color-accent-gold)',
            borderRadius: 'var(--radius-full)',
            opacity: 0.8,
          }}
        />
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
