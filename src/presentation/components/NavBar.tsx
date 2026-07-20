import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Palette, Plus, User, Bell } from 'lucide-react';
import { CreatePostModal } from './CreatePostModal';
import { GuestAuthModal } from './GuestAuthModal';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Fetch notification count periodically for logged-in users
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications(user.uid);
      const interval = setInterval(() => fetchNotifications(user.uid!), 60000);
      return () => clearInterval(interval);
    }
  }, [user?.uid]);

  const navItemsLeft = [
    { path: '/', icon: Sparkles, label: 'Explore' },
    { path: '/creators', icon: Palette, label: 'Creators' },
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
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: active ? '#111111' : '#737373',
          transition: 'color 0.15s ease',
          flex: 1,
        }}
      >
        <Icon
          size={24}
          style={{
            strokeWidth: active ? 2.5 : 2,
            transform: active ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.15s var(--spring-smooth)',
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
              backgroundColor: '#D4AF37',
              animation: 'pageFadeIn 0.2s ease forwards',
            }}
          />
        )}
      </button>
    );
  };

  const renderNotificationButton = () => {
    const active = isActive('/notifications');
    return (
      <button
        onClick={() => {
          if (!user) { setShowGuestModal(true); return; }
          navigate('/notifications');
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: active ? '#111111' : '#737373',
          flex: 1,
        }}
      >
        <Bell
          size={24}
          style={{
            strokeWidth: active ? 2.5 : 2,
            transform: active ? 'scale(1.08)' : 'scale(1)',
          }}
        />
        {/* Unread badge */}
        {unreadCount > 0 && user && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: 'calc(50% - 20px)',
              backgroundColor: '#D4AF37',
              color: '#FFFFFF',
              fontSize: '9px',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.9)',
              animation: 'pop-in 0.3s var(--spring-bouncy) both',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {active && (
          <span style={{ position: 'absolute', bottom: 'calc(-1 * var(--space-1))', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
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
          padding: '12px 20px calc(20px + 6px) 20px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(17,17,17,0.05)',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.02)',
        }}
      >
        {/* Left Nav: Explore + Creators */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
          {navItemsLeft.map(item => renderNavItem(item.path, item.icon))}
        </div>

        {/* Center FAB */}
        <div style={{ display: 'flex', flex: 0.8, justifyContent: 'center' }}>
          <button
            onClick={() => {
              if (!user) { setShowGuestModal(true); return; }
              setShowCreateModal(true);
            }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: '#111111',
              color: '#FAFAFA',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(17,17,17,0.2)',
              transform: 'translateY(-8px)',
              transition: 'transform 0.15s ease',
            }}
            onPointerDown={e => (e.currentTarget.style.transform = 'translateY(-8px) scale(0.95)')}
            onPointerUp={e => (e.currentTarget.style.transform = 'translateY(-8px) scale(1)')}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Nav: Notifications + Profile */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
          {renderNotificationButton()}
          {renderNavItem('/profile', User)}
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {showGuestModal && <GuestAuthModal onClose={() => setShowGuestModal(false)} />}
    </>
  );
};
