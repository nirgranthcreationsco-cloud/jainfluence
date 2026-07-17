import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Video } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import type { ActivityType } from '../../data/types';
import { Text } from './ui/Text';
import { Button } from './ui/Button';

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const { createActivity, uploadProgress } = useFeedStore();
  
  const [caption, setCaption] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const MAX_VIDEO_DURATION = 90; // seconds

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      setMediaError(null);

      if (isVideo) {
        // Validate duration before accepting
        const tempUrl = URL.createObjectURL(file);
        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.onloadedmetadata = () => {
          URL.revokeObjectURL(tempUrl);
          if (vid.duration > MAX_VIDEO_DURATION) {
            setMediaError(`Video must be ${MAX_VIDEO_DURATION} seconds or less (yours is ${Math.round(vid.duration)}s).`);
            return;
          }
          setSelectedFile(file);
          setSelectedMediaUrl(URL.createObjectURL(file));
          setMediaType('video');
        };
        vid.src = tempUrl;
      } else {
        setSelectedFile(file);
        setSelectedMediaUrl(URL.createObjectURL(file));
        setMediaType('image');
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setSelectedMediaUrl(null);
    setMediaType(null);
    setMediaError(null);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsPublishing(true);
    try {
      const tags = tagsStr.split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.startsWith('#'))
        .slice(0, 5);

      const activityType: ActivityType = mediaType === 'video' ? 'video' : 'photo';

      await createActivity(
        user.uid,
        user.name,
        user.profilePhoto,
        selectedFile,
        caption,
        tags,
        activityType
      );
      
      setCaption('');
      setTagsStr('');
      setSelectedFile(null);
      setSelectedMediaUrl(null);
      setMediaType(null);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
        animation: 'pageFadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handlePublish}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          zIndex: 10000,
          maxHeight: '88vh',
          overflowY: 'auto',
          animation: 'pop-in 0.25s var(--spring-bouncy) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h3" style={{ fontWeight: 700 }}>Create Post</Text>
          <button 
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(17, 17, 17, 0.05)',
              width: '32px', height: '32px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Media Preview / Picker */}
        <div 
          style={{ 
            width: '100%', 
            aspectRatio: mediaType === 'video' ? '16/9' : '4/3',
            backgroundColor: '#111111', 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: '14px',
          }}
        >
          {selectedMediaUrl && mediaType === 'image' && (
            <img 
              src={selectedMediaUrl} 
              alt="preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          )}

          {selectedMediaUrl && mediaType === 'video' && (
            <video
              src={selectedMediaUrl}
              controls
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {!selectedMediaUrl && (
            <>
              {/* Viewfinder corners */}
              <div style={{ position: 'absolute', top: 16, left: 16, width: 16, height: 16, borderTop: '2px solid rgba(255,255,255,0.35)', borderLeft: '2px solid rgba(255,255,255,0.35)' }} />
              <div style={{ position: 'absolute', top: 16, right: 16, width: 16, height: 16, borderTop: '2px solid rgba(255,255,255,0.35)', borderRight: '2px solid rgba(255,255,255,0.35)' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16, width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.35)', borderLeft: '2px solid rgba(255,255,255,0.35)' }} />
              <div style={{ position: 'absolute', bottom: 16, right: 16, width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.35)', borderRight: '2px solid rgba(255,255,255,0.35)' }} />

              {/* Two pickers side by side */}
              <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Choose Media
                </span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Photo Button */}
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      transition: 'background 0.15s ease'
                    }}>
                      <Camera size={22} color="#FFFFFF" />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600 }}>Photo</span>
                    <input type="file" accept="image/*" onChange={handleMediaSelect} style={{ display: 'none' }} />
                  </label>

                  {/* Video Button */}
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      border: '2px solid rgba(212,175,55,0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgba(212,175,55,0.12)',
                      transition: 'background 0.15s ease'
                    }}>
                      <Video size={22} color="#D4AF37" />
                    </div>
                    <span style={{ color: 'rgba(212,175,55,0.8)', fontSize: '11px', fontWeight: 600 }}>Video</span>
                    <input type="file" accept="video/*" onChange={handleMediaSelect} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Upload progress */}
              {uploadProgress && uploadProgress.stage !== 'done' && (
                <div style={{ position: 'absolute', bottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 600 }}>
                    {uploadProgress.stage === 'compressing' ? 'Compressing...' : 'Uploading...'} {uploadProgress.progress}%
                  </span>
                </div>
              )}
            </>
          )}

          {/* Clear button when media is selected */}
          {selectedMediaUrl && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '30px', height: '30px', borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Upload progress when media is selected */}
          {selectedMediaUrl && uploadProgress && uploadProgress.stage !== 'done' && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                {uploadProgress.stage === 'compressing' ? 'Compressing...' : 'Uploading...'}
              </span>
              <div style={{ width: '140px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${uploadProgress.progress}%`, backgroundColor: 'var(--color-accent-gold)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{uploadProgress.progress}%</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {mediaError && (
          <div style={{
            backgroundColor: 'rgba(220,53,69,0.08)',
            border: '1px solid rgba(220,53,69,0.25)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex', alignItems: 'flex-start', gap: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>⚠️</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc3545', lineHeight: 1.4 }}>{mediaError}</span>
          </div>
        )}

        {/* Media type chip */}
        {mediaType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {mediaType === 'video' ? <Video size={14} color="var(--color-accent-gold)" /> : <Camera size={14} color="var(--color-text-secondary)" />}
            <span style={{ fontSize: '12px', fontWeight: 600, color: mediaType === 'video' ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)' }}>
              {mediaType === 'video' ? 'Video selected' : 'Photo selected'} · {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(1) + ' MB' : ''}
            </span>
          </div>
        )}
        
        {/* Caption */}
        <div>
          <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Caption</Text>
          <textarea
            placeholder="Write something..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            required
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-2) 0',
              border: 'none',
              borderBottom: '1px solid var(--color-border-light)',
              outline: 'none',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              resize: 'none'
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Tags</Text>
          <input 
            type="text"
            placeholder="#architecture, #inspiration"
            value={tagsStr}
            onChange={e => setTagsStr(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-2) 0',
              border: 'none',
              borderBottom: '1px solid var(--color-border-light)',
              outline: 'none',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family)',
              background: 'transparent',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>

        <Button 
          type="submit" 
          variant="primary"
          disabled={isPublishing || (uploadProgress !== null && uploadProgress?.stage !== 'done')}
          style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-sm)' }}
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </form>
    </div>,
    document.body
  );
};
