import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Palette, Calendar, Briefcase, User } from 'lucide-react';

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 'var(--space-3) var(--space-5) calc(var(--space-5) + 6px) var(--space-5)', // Premium safe area padding
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(17, 17, 17, 0.05)',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.02)',
      }}
    >
      {[
        { path: '/', icon: Sparkles },
        { path: '/creators', icon: Palette },
        { path: '/community', icon: Calendar },
        { path: '/opportunities', icon: Briefcase },
        { path: '/profile', icon: User }
      ].map(({ path, icon: Icon }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              transition: 'color var(--duration-fast) ease',
            }}
          >
            <Icon 
              size={24} 
              style={{
                strokeWidth: active ? 2.5 : 2,
                transform: active ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform var(--duration-fast) var(--spring-smooth)',
              }}
            />
            {active && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 'calc(-1 * var(--space-1))',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-gold)',
                  animation: 'pageFadeIn 0.2s ease forwards',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
