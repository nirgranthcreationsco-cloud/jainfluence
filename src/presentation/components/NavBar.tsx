import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Palette, Plus, Briefcase, User } from 'lucide-react';
import { CreatePostModal } from './CreatePostModal';

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItemsLeft = [
    { path: '/', icon: Sparkles },
    { path: '/creators', icon: Palette },
  ];

  const navItemsRight = [
    { path: '/opportunities', icon: Briefcase },
    { path: '/profile', icon: User }
  ];

  const renderNavItem = (path: string, Icon: React.ElementType) => {
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
          flex: 1
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
  };

  return (
    <>
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
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-5) calc(var(--space-5) + 6px) var(--space-5)', // Premium safe area padding
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(17, 17, 17, 0.05)',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
          {navItemsLeft.map(item => renderNavItem(item.path, item.icon))}
        </div>

        {/* Center FAB Button */}
        <div style={{ display: 'flex', flex: 0.8, justifyContent: 'center' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(17,17,17,0.2)',
              transform: 'translateY(-8px)',
              transition: 'transform 0.15s ease'
            }}
            onPointerDown={e => e.currentTarget.style.transform = 'translateY(-8px) scale(0.95)'}
            onPointerUp={e => e.currentTarget.style.transform = 'translateY(-8px) scale(1)'}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
          {navItemsRight.map(item => renderNavItem(item.path, item.icon))}
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            // Optional: Handle any post-success global logic here
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
};
