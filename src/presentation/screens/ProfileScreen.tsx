import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, CheckCircle2, Grid, Award, LogOut, Check, MessageSquare, PhoneCall, X, MapPin, ExternalLink } from 'lucide-react';
import type { UserRole, CreatorCategory } from '../../data/types';

import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';

import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

export const ProfileScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.uid ?? '';
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const logout = useAuthStore((state) => state.logout);
  const targetId = id || currentUserId;
  const isOwn = targetId === currentUserId;

  const { profileUser, posts, isLoading, isFollowing, loadProfile, toggleFollow } = useProfileStore();
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const { deletePost } = useFeedStore();
  const [selectedProfilePost, setSelectedProfilePost] = useState<any>(null);

  // Only load profile once auth is resolved and we have a real ID
  useEffect(() => {
    if (!isInitializing && targetId) {
      loadProfile(targetId, currentUserId);
    }
  }, [targetId, currentUserId, isInitializing, loadProfile]);

  const handleLogout = () => {
    setShowSettingsDrawer(false);
    logout();
    navigate('/login');
  };

  // Show skeleton if auth is still initializing or profile is loading
  if (isInitializing || isLoading || !profileUser) {
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
                  onClick={() => setShowSettingsDrawer(true)}
                  style={{
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    border: '1px solid rgba(17, 17, 17, 0.08)'
                  }}
                >
                  Edit Profile
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Text variant="h2" style={{ fontWeight: 800 }}>{profileUser.name}</Text>
            {profileUser.isVerified && <CheckCircle2 size={16} color="var(--color-accent-gold)" fill="var(--color-accent-gold)" style={{ color: '#FAFAFA' }} />}
          </div>

          {/* V2 Role Badges */}
          {profileUser.roles && profileUser.roles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {profileUser.roles.map((role: UserRole) => {
                const roleColors: Record<string, string> = { Creator: '#7C3AED', Business: '#2563EB', Organization: '#D4AF37', Individual: '#737373' };
                const color = roleColors[role] || '#737373';
                return (
                  <span key={role} style={{ fontSize: '10px', fontWeight: 800, color, backgroundColor: `${color}10`, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${color}25`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {role}
                  </span>
                );
              })}
            </div>
          )}

          <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px' }}>
            @{profileUser.username}
          </Text>

          {/* City */}
          {profileUser.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <MapPin size={12} color="#A3A3A3" />
              <span style={{ fontSize: '12px', color: '#A3A3A3', fontFamily: 'var(--font-family)' }}>{profileUser.city}</span>
            </div>
          )}

          {/* V2 Creator Category Chips */}
          {profileUser.creatorCategories && profileUser.creatorCategories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {profileUser.creatorCategories.map((cat: CreatorCategory) => (
                <span key={cat} style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.08)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(124,58,237,0.15)' }}>
                  {cat}
                </span>
              ))}
            </div>
          )}

          <Text variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {profileUser.professionalSummary || profileUser.bio || 'Digital citizen of the Jain community. Exploring art, philosophy, and ahimsa.'}
          </Text>

          {/* Instagram & Portfolio links */}
          {(profileUser.instagramUrl || profileUser.portfolioUrl) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {profileUser.instagramUrl && (
                <a
                  href={profileUser.instagramUrl.startsWith('http') ? profileUser.instagramUrl : `https://instagram.com/${profileUser.instagramUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: '1.5px solid rgba(219,39,119,0.3)', backgroundColor: 'rgba(219,39,119,0.05)', color: '#DB2777', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-family)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> Instagram
                </a>
              )}
              {profileUser.portfolioUrl && (
                <a
                  href={profileUser.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: '1.5px solid rgba(37,99,235,0.2)', backgroundColor: 'rgba(37,99,235,0.04)', color: '#2563EB', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-family)' }}
                >
                  <ExternalLink size={13} /> Portfolio
                </a>
              )}
            </div>
          )}

          {/* New Identity Metrics: Community Reputation */}
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Community Reputation
                </span>
                <Text variant="h2" style={{ fontWeight: 900, color: 'var(--color-accent-gold)', marginTop: '2px' }}>
                  {(posts.length * 10) + ((profileUser.followersCount || 0) * 5) + 84}
                </Text>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(17,17,17,0.08)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Community Level
                </span>
                <Text variant="body" style={{ fontWeight: 800, marginTop: '2px', fontSize: '16px' }}>
                  {(() => {
                    const score = (posts.length * 10) + ((profileUser.followersCount || 0) * 5) + 84;
                    if (score > 1000) return 'Legend';
                    if (score > 500) return 'Pillar';
                    if (score > 250) return 'Mentor';
                    if (score > 100) return 'Creator';
                    if (score > 50) return 'Contributor';
                    return 'Explorer';
                  })()}
                </Text>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: '12px', padding: '10px 14px', marginTop: '4px', border: '1px solid rgba(212,175,55,0.15)', display: 'inline-block', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                {isOwn ? "You've inspired 42 people this week." : `Top 18% of contributors this month.`}
              </span>
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
                const imgUrl = post.mediaUrls?.[0];
                return (
                  <div 
                    key={post.postId} 
                    onClick={() => setSelectedProfilePost(post)}
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
                    {imgUrl && !imgUrl.startsWith('blob:') ? (
                      post.activityType === 'video' ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <video
                            src={imgUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            preload="metadata"
                            muted
                          />
                          {/* Play icon overlay */}
                          <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.25)'
                          }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: 'rgba(255,255,255,0.85)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <span style={{ fontSize: '10px', marginLeft: '2px' }}>▶</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={imgUrl} 
                          alt="portfolio showcase grid item" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      )
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundColor: 'rgba(212,175,55,0.05)',
                        border: '1px solid rgba(212,175,55,0.1)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '12px', boxSizing: 'border-box'
                      }}>
                        <span style={{ fontSize: '20px', marginBottom: '4px' }}>
                          {post.activityType === 'opportunity' ? '💼' : '📝'}
                        </span>
                        <span style={{
                          fontSize: '10px', fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          textAlign: 'center',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.3
                        }}>
                          {post.caption ? (() => {
                            try {
                              const parsed = JSON.parse(post.caption);
                              return parsed.title || parsed.description;
                            } catch {
                              return post.caption;
                            }
                          })() : 'Contribution'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Settings — centered modal (no scrolling to find it) */}
      {showSettingsDrawer && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-5)',
            animation: 'pageFadeIn 0.2s ease',
          }}
          onClick={() => setShowSettingsDrawer(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'pop-in 0.25s var(--spring-bouncy) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                padding: 'var(--space-5) var(--space-5) var(--space-4)',
                borderBottom: '1px solid rgba(17,17,17,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text variant="body" style={{ fontWeight: 800, fontSize: '16px' }}>Settings</Text>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  @{profileUser.username}
                </span>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                style={{
                  border: 'none', background: 'rgba(17,17,17,0.06)',
                  width: '30px', height: '30px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--color-text-primary)',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Menu items */}
            <div style={{ padding: 'var(--space-2) 0' }}>
              {[
                { icon: '👤', label: 'Account Details', sublabel: 'Name, phone, bio', action: () => alert('Coming soon') },
                { icon: '🔔', label: 'Notifications', sublabel: 'Manage alerts', action: () => alert('Coming soon') },
                { icon: '🔒', label: 'Privacy', sublabel: 'Who can see your profile', action: () => alert('Coming soon') },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { item.action(); setShowSettingsDrawer(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-5)',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-family)',
                    transition: 'background 0.1s ease',
                  }}
                  onPointerEnter={e => (e.currentTarget.style.background = 'rgba(17,17,17,0.03)')}
                  onPointerLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{item.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Logout — separated with a divider */}
            <div style={{ borderTop: '1px solid rgba(17,17,17,0.05)', padding: 'var(--space-2) 0 var(--space-2)' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-5)',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'var(--font-family)',
                  transition: 'background 0.1s ease',
                }}
                onPointerEnter={e => (e.currentTarget.style.background = 'rgba(255,59,48,0.04)')}
                onPointerLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={18} color="var(--color-error)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-error)' }}>Log Out</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Sign out of your account</div>
                </div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}



      {selectedProfilePost && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-5)',
            animation: 'pageFadeIn 0.2s ease',
          }}
          onClick={() => setSelectedProfilePost(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: '28px',
              border: '1px solid rgba(255,255,255,0.6)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15)',
              animation: 'pop-in 0.25s var(--spring-bouncy) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Post Detail
              </span>
              <button
                onClick={() => setSelectedProfilePost(null)}
                style={{
                  border: 'none', background: 'rgba(17,17,17,0.06)',
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--color-text-primary)',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {selectedProfilePost.mediaUrls?.[0] && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', aspectRatio: '4/3' }}>
                <img src={selectedProfilePost.mediaUrls[0]} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ padding: '4px 0' }}>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                {(() => {
                  try {
                    const data = JSON.parse(selectedProfilePost.caption || '');
                    return `💼 ${data.title}\n📍 ${data.location}\n💰 ${data.compensation}\n\n${data.description}`;
                  } catch {
                    return selectedProfilePost.caption;
                  }
                })()}
              </div>
              {selectedProfilePost.hashtags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {selectedProfilePost.hashtags.map((tag: string, i: number) => (
                    <span key={i} style={{ padding: '2px 8px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '8px', fontSize: '11px', color: 'var(--color-accent-gold)', fontWeight: 700 }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {currentUser && currentUser.uid === selectedProfilePost.authorId && (
              <Button
                variant="secondary"
                style={{
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  borderColor: 'var(--color-error)',
                  color: 'var(--color-error)',
                  marginTop: 'var(--space-2)'
                }}
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this post?')) {
                    await deletePost(selectedProfilePost.postId);
                    setSelectedProfilePost(null);
                    await loadProfile(targetId, currentUserId);
                  }
                }}
              >
                Delete Post
              </Button>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
export default ProfileScreen;
