import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface GuestAuthModalProps {
  onClose: () => void;
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'pageFadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          padding: '40px 32px 36px',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(17,17,17,0.06)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#737373',
          }}
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Logo mark */}
        <div style={{ marginBottom: '20px' }}>
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="15" r="4.5" fill="url(#guestGold)" />
            <circle cx="50" cy="8" r="5" fill="url(#guestGold)" />
            <circle cx="64" cy="15" r="4.5" fill="url(#guestGold)" />
            <circle cx="50" cy="55" r="32" stroke="url(#guestGold)" strokeWidth="2.5" strokeDasharray="2 2" opacity="0.5" />
            <circle cx="50" cy="55" r="28" stroke="url(#guestGold)" strokeWidth="1.5" />
            <path d="M50 32 C42 45, 34 55, 34 68 C34 77, 41 83, 50 83 C59 83, 66 77, 66 68 C66 55, 58 45, 50 32 Z" stroke="url(#guestGold)" strokeWidth="2" fill="url(#guestGoldFill)" />
            <path d="M50 45 C45 52, 40 60, 40 68 C40 73, 44 78, 50 78 C56 78, 60 73, 60 68 C60 60, 55 52, 50 45 Z" stroke="url(#guestGold)" strokeWidth="1.5" />
            <defs>
              <linearGradient id="guestGold" x1="50" y1="5" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
              <linearGradient id="guestGoldFill" x1="50" y1="32" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '8px', fontSize: '22px', fontWeight: 800, color: '#111111', letterSpacing: '-0.4px', fontFamily: 'var(--font-family)' }}>
          Join Jainfluence
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '14px', color: '#737373', lineHeight: 1.6, fontFamily: 'var(--font-family)', marginBottom: '32px', maxWidth: '280px' }}>
          Create an account to collaborate with creators, hire professionals, and become part of the Jain community.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <button
            onClick={() => { onClose(); navigate('/signup'); }}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#D4AF37',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
            onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Register
          </button>

          <button
            onClick={() => { onClose(); navigate('/login'); }}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '14px',
              border: '1.5px solid rgba(17,17,17,0.12)',
              backgroundColor: 'transparent',
              color: '#111111',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Login
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A3A3A3',
              fontSize: '13px',
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              marginTop: '4px',
              padding: '4px',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
