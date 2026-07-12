import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, CheckCircle2, Grid, Award, LogOut, X, Check, MessageSquare, PhoneCall, Camera } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { uploadToCloudinary } from '../../data/services/cloudinary';

import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

export const ProfileScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.uid) || '';
  const logout = useAuthStore((state) => state.logout);
  const targetId = id || currentUserId;
  const isOwn = targetId === currentUserId;

  const { profileUser, posts, isLoading, isFollowing, loadProfile, toggleFollow } = useProfileStore();
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  
  // Publication Drawer states
  const createPost = useFeedStore((state) => state.createPost);
  const [showPublishDrawer, setShowPublishDrawer] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const selectedFileRef = useRef<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    selectedFileRef.current = file;
    // Instant local preview — no network call yet
    setSelectedImg(URL.createObjectURL(file));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser || (!selectedImg && !selectedFileRef.current)) {
      alert('Please select an image first.');
      return;
    }

    setIsUploading(true);
    let finalUrl = selectedImg!;
    try {
      if (selectedFileRef.current) {
        finalUrl = await uploadToCloudinary(selectedFileRef.current);
        selectedFileRef.current = null;
      }
    } finally {
      setIsUploading(false);
    }

    const hashtags = tagsStr
      .split(' ')
      .filter((h) => h.startsWith('#'))
      .map((h) => h.trim());

    await createPost(profileUser.uid, profileUser.name, profileUser.profilePhoto, finalUrl, caption, hashtags);

    // Refresh profile grid & close drawer
    await loadProfile(targetId, currentUserId);
    setSelectedImg(null);
    setCaption('');
    setTagsStr('');
    setShowPublishDrawer(false);
  };

  useEffect(() => {
    if (targetId) {
      loadProfile(targetId, currentUserId);
    }
  }, [targetId, currentUserId, loadProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading || !profileUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-5)', backgroundColor: 'var(--color-bg-base)', minHeight: '100vh' }}>
        <div className="shimmer" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div className="shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
            <div className="shimmer" style={{ width: '150px', height: '20px', borderRadius: 'var(--radius-sm)' }} />
            <div className="shimmer" style={{ width: '100px', height: '12px', borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
      </div>
    );
  }

  // Predefined Mock Achievements & Digital Identity Data
  const achievements = ['✨ Top Creator', '🛕 Temple Volunteer', '🌿 Ahimsa Advocate'];
  
  // Available For checklist items
  const availableFor = [
    'Website & App Development',
    'Ethical Branding & UI Design',
    'Startup Consultation / AI Automation'
  ];

  // Testimonials / Recommendations list
  const recommendations = [
    {
      id: '1',
      name: 'Vikas Singhal',
      role: 'Founder, satvik.org',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      text: 'Pratham delivered a stunning portal for our non-profit. Truly professional and aligned with our core satvik values.'
    },
    {
      id: '2',
      name: 'Meera Kothari',
      role: 'Event Lead, JIO Bangalore',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      text: 'Collaborated on the national summit design assets. Absolute creative genius and timely delivery.'
    }
  ];

  return (
    <div className="page-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', position: 'relative' }}>
      
      {/* Cover Banner */}
      <div 
        style={{
          width: '100%',
          height: '240px',
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(17,17,17,0.3) 0%, rgba(17,17,17,0) 60%, rgba(250,250,250,1) 100%)'
          }} 
        />
        
        {/* Navigation Floating Header Overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          {!isOwn ? (
            <button 
              onClick={() => navigate(-1)}
              style={{
                border: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-primary)'
              }}
            >
              <ChevronLeft size={20} />
            </button>
          ) : <div />}
          
          {isOwn && (
            <button 
              onClick={() => setShowSettingsDrawer(true)}
              style={{
                border: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-primary)'
              }}
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Profile Info Block */}
      <div style={{ padding: '0 var(--space-5)', marginTop: '-60px', position: 'relative', zIndex: 5 }}>
        
        {/* Avatar & Action Button Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-4)' }}>
          <div style={{ borderRadius: '50%', padding: '3px', backgroundColor: 'var(--color-bg-base)' }}>
            <img 
              src={profileUser.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&fit=crop'} 
              alt="avatar" 
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>

          <div style={{ paddingBottom: 'var(--space-1)' }}>
            {isOwn ? (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button 
                  variant="secondary" 
                  style={{ 
                    height: '36px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    border: '1px solid rgba(17, 17, 17, 0.08)'
                  }}
                >
                  Edit Identity
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setShowPublishDrawer(true)}
                  style={{ 
                    height: '36px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600
                  }}
                >
                  + Publish Work
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => alert(`Messaging ${profileUser.name}`)}
                  style={{ 
                    height: '36px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    border: '1px solid rgba(17, 17, 17, 0.08)'
                  }}
                >
                  Message
                </Button>
                <Button
                  onClick={() => toggleFollow(currentUserId, targetId)}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  style={{
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600
                  }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Identity Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Text variant="h2" style={{ fontWeight: 800 }}>{profileUser.name}</Text>
            {profileUser.isVerified && <CheckCircle2 size={16} color="var(--color-accent-gold)" fill="var(--color-accent-gold)" style={{ color: '#FAFAFA' }} />}
          </div>
          <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Digital Creator • @{profileUser.username}
          </Text>

          <Text variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {profileUser.bio || 'Digital citizen of the Jain community. Exploring art, philosophy, and ahimsa.'}
          </Text>

          {/* Counts metrics */}
          <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'baseline' }}>
              <Text variant="body" style={{ fontWeight: 700 }}>{posts.length}</Text>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)' }}>portfolio items</Text>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'baseline' }}>
              <Text variant="body" style={{ fontWeight: 700 }}>{profileUser.followersCount || 0}</Text>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)' }}>collaborators</Text>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'baseline' }}>
              <Text variant="body" style={{ fontWeight: 700 }}>{profileUser.projectsCompleted || 4}</Text>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)' }}>gigs done</Text>
            </div>
          </div>
        </div>

        {/* Available For Checklist - Premium UI Identity */}
        <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid rgba(17,17,17,0.03)', paddingTop: 'var(--space-5)' }}>
          <Text variant="body" style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Available For</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {availableFor.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Check size={12} color="var(--color-accent-gold)" strokeWidth={3} />
                </div>
                <Text variant="body" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {item}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Award size={18} color="var(--color-accent-gold)" />
            <Text variant="body" style={{ fontWeight: 700 }}>Contributions & Badges</Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {achievements.map((badge, index) => (
              <span 
                key={index} 
                style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  backgroundColor: 'rgba(212, 175, 55, 0.08)', 
                  color: 'var(--color-accent-gold)', 
                  padding: '4px 10px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Recommendations Testimonials list */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <MessageSquare size={18} color="var(--color-accent-gold)" />
            <Text variant="body" style={{ fontWeight: 700 }}>Recommendations</Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(17, 17, 17, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <img 
                    src={rec.photo} 
                    alt={rec.name} 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <Text variant="body" style={{ fontWeight: 600, fontSize: '13px' }}>{rec.name}</Text>
                    <Text variant="metadata" color="secondary" style={{ fontSize: '10px' }}>{rec.role}</Text>
                  </div>
                </div>
                <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4, fontSize: '12px', fontStyle: 'italic' }}>
                  "{rec.text}"
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Contact details */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Button
            variant="primary"
            fullWidth
            style={{
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)'
            }}
            onClick={() => alert(`Initiating direct contact with ${profileUser.name}... phone details locked.`)}
          >
            <PhoneCall size={18} />
            <span>Connect & Hire</span>
          </Button>
        </div>

        {/* Portfolio Showcase Grid */}
        <div 
          style={{ 
            display: 'flex', 
            marginTop: 'var(--space-8)', 
            borderBottom: '1px solid var(--color-border-light)',
            paddingBottom: '2px'
          }}
        >
          <button 
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              borderBottom: '2px solid var(--color-text-primary)',
              padding: 'var(--space-3) 0', 
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <Grid size={18} color="var(--color-text-primary)" />
            <Text variant="metadata" style={{ fontWeight: 600 }}>Portfolio Showcase</Text>
          </button>
        </div>

        {/* Posts Media Grid */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          {posts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-12) 0', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '32px' }}>📷</span>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)' }}>No portfolio items uploaded yet</Text>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {posts.map((post) => {
                const imgUrl = post.mediaUrls[0];
                return (
                  <div 
                    key={post.postId} 
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1/1', 
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: 'scale(1)',
                      transition: 'transform var(--duration-fast) ease',
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.96)';
                    }}
                    onPointerUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onPointerLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <img 
                      src={imgUrl} 
                      alt="portfolio showcase grid item" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Elegant Bottom Drawer for Settings (Nesting Settings Inside Profile) */}
      {showSettingsDrawer && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'pageFadeIn 0.2s ease'
          }}
        >
          {/* Click outside to close */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowSettingsDrawer(false)} />
          
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: 'var(--space-6) var(--space-5) calc(var(--space-8) + 12px) var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
              zIndex: 10000,
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <Text variant="h3" style={{ fontWeight: 700 }}>Identity Settings</Text>
              <button 
                onClick={() => setShowSettingsDrawer(false)}
                style={{
                  border: 'none',
                  background: 'rgba(17, 17, 17, 0.05)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Option Buttons */}
            <button 
              onClick={() => {
                alert('Preferences panel coming soon.');
                setShowSettingsDrawer(false);
              }}
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                textAlign: 'left',
                border: 'none',
                background: 'rgba(17, 17, 17, 0.02)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer'
              }}
            >
              Account Details
            </button>

            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                textAlign: 'left',
                border: 'none',
                background: 'rgba(255, 59, 48, 0.05)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--color-error)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Elegant Viewfinder Shutter Drawer for Portfolio Publish */}
      {showPublishDrawer && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'pageFadeIn 0.2s ease'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowPublishDrawer(false)} />
          
          <form 
            onSubmit={handlePublish}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: 'var(--space-6) var(--space-5) calc(var(--space-8) + 12px) var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
              zIndex: 10000,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <Text variant="h3" style={{ fontWeight: 700 }}>Publish Portfolio Work</Text>
              <button 
                type="button"
                onClick={() => setShowPublishDrawer(false)}
                style={{
                  border: 'none',
                  background: 'rgba(17, 17, 17, 0.05)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Viewfinder Camera Area */}
            <div 
              style={{ 
                width: '100%', 
                aspectRatio: '4/3', 
                backgroundColor: '#111111', 
                position: 'relative',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                marginTop: 'var(--space-2)'
              }}
            >
              {selectedImg ? (
                <img 
                  src={selectedImg} 
                  alt="portfolio preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <>
                  {/* Viewfinder borders */}
                  <div style={{ position: 'absolute', top: 16, left: 16, width: 16, height: 16, borderTop: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
                  <div style={{ position: 'absolute', top: 16, right: 16, width: 16, height: 16, borderTop: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 16, width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
                  <div style={{ position: 'absolute', bottom: 16, right: 16, width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />

                  {/* Focal point */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  </div>

                  {/* Camera capture shutter button */}
                  <label 
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'absolute',
                      bottom: '20px',
                      zIndex: 10
                    }}
                  >
                    <div 
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: '3px solid #FFFFFF',
                        padding: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={18} color="#111111" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageSelect}
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {isUploading && (
                    <div style={{ position: 'absolute', bottom: '80px' }}>
                      <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 600 }}>Uploading image...</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Work Title / Description</Text>
              <textarea 
                placeholder="Describe your design, art, or contribution..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                required
                rows={2}
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

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Hashtags</Text>
              <input 
                type="text"
                placeholder="e.g. #Ahimsa #Design"
                value={tagsStr}
                onChange={e => setTagsStr(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) 0',
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
              fullWidth
              disabled={!selectedImg}
              style={{
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                marginTop: 'var(--space-2)'
              }}
            >
              Publish Portfolio Work
            </Button>
          </form>
        </div>
      )}

    </div>
  );
};
export default ProfileScreen;
