import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';
import { uploadToCloudinary } from '../../data/services/cloudinary';

export const SignupScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'username' | 'phone' | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const handleNameChange = (val: string) => {
    setName(val);
    setUsername(val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !phone) return;

    let profilePhotoUrl: string | undefined;

    if (avatarFile) {
      setIsUploadingPhoto(true);
      try {
        profilePhotoUrl = await uploadToCloudinary(avatarFile);
      } finally {
        setIsUploadingPhoto(false);
      }
    }

    const success = await signup(phone, name, username, profilePhotoUrl);
    if (success) {
      navigate('/');
    }
  };

  const inputContainerStyle = (field: 'name' | 'username' | 'phone') => ({
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
      {/* Blur Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(250, 250, 250, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
      />

      {/* Floating Card */}
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
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Text variant="hero" style={{ color: 'var(--color-text-primary)', fontWeight: 800 }}>
            Join Us.
          </Text>
          <Text variant="body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Build your digital identity.
          </Text>
        </div>

        {/* Avatar picker */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
          <div
            style={{ position: 'relative', width: '80px', height: '80px', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar preview"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  backgroundColor: 'rgba(212, 175, 55, 0.08)',
                  border: '2px dashed rgba(212, 175, 55, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '4px'
                }}
              >
                <Camera size={20} color="var(--color-accent-gold)" />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-accent-gold)', textAlign: 'center' }}>
                  ADD PHOTO
                </span>
              </div>
            )}
            {/* Edit overlay on hover */}
            {avatarPreview && (
              <div
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white'
                }}
              >
                <Camera size={11} color="white" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            style={{ display: 'none' }}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
              Full Name
            </Text>
            <div style={inputContainerStyle('name')}>
              <input
                type="text"
                placeholder="Aarav Jain"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
              Username
            </Text>
            <div style={inputContainerStyle('username')}>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>@</span>
              <input
                type="text"
                placeholder="aarav_jain"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle}
                required
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
            disabled={isLoading || isUploadingPhoto}
            fullWidth
            style={{
              height: '52px',
              borderRadius: 'var(--radius-sm)',
              marginTop: 'var(--space-2)',
            }}
          >
            {isUploadingPhoto ? 'Uploading photo...' : isLoading ? 'Creating Account...' : 'Continue'}
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-5)', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Already have an account? <strong style={{ color: 'var(--color-accent-gold)' }}>Log In</strong>
          </button>
        </div>
      </div>
    </div>
  );
};
