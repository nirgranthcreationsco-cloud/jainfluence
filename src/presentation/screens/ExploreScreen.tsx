import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { FeedSkeleton } from '../components/ui/FeedSkeleton';
import type { ActivityModel } from '../../data/types';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

const DAILY_PROMPTS = [
  "Community Moment.",         // 0: Sun
  "Show your workspace.",      // 1: Mon
  "One lesson you learned.",   // 2: Tue
  "Share today's project.",    // 3: Wed
  "Recommend someone.",        // 4: Thu
  "Show your best work.",      // 5: Fri
  "Weekly Reflection."         // 6: Sat
];

const FEATURED_CREATOR = {
  title: 'Top Architect',
  name: 'Siddharth Shah',
  photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
  reputation: 342,
  description: 'Shared 14 incredible temple designs this month.',
  authorId: 'user_siddharth'
};

const COMMUNITY_PULSE = {
  creatorsJoined: 28,
  opportunities: 14,
  events: 6,
  appreciations: 127
};

const ACTIVITY_LABELS: Record<string, string> = {
  photo: '📷 Photo',
  project: '🎨 Project',
  video: '🎥 Video',
  event: '📅 Event',
  article: '📝 Article',
  opportunity: '💼 Opportunity',
  announcement: '📍 Announcement',
  achievement: '🏆 Achievement',
};

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activities, isLoading, isFetchingMore, hasMore, loadFeed, loadMore, likePost, isLiked } = useFeedStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appreciationPopupFor, setAppreciationPopupFor] = useState<string | null>(null);
  // Store local selections to show the chosen icon visually, defaults to ❤️
  const [localAppreciations, setLocalAppreciations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFeed(user?.uid);
  }, [user?.uid, loadFeed]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingMore && hasMore) {
          loadMore(user?.uid);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFetchingMore, hasMore, loadMore, user?.uid]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (ts: string) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  const liveActivities = activities.filter(a => a.status === 'live' || a.status === 'pending');

  const renderDailyPrompt = () => {
    const today = new Date().getDay();
    const promptText = DAILY_PROMPTS[today];

    return (
      <div style={{ padding: '0 var(--space-5) var(--space-4)' }}>
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '24px',
            border: '1px solid rgba(212,175,55,0.4)',
            padding: '24px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: '0 16px 32px -8px rgba(212,175,55,0.15)',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--color-accent-gold)' }} />
          <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent-gold)', fontWeight: 800, fontSize: '10px', marginBottom: '12px' }}>
            Today's Prompt
          </Text>
          <Text variant="body" style={{ fontWeight: 800, fontSize: '20px', lineHeight: 1.3, marginBottom: '20px', color: 'var(--color-text-primary)' }}>
            {promptText}
          </Text>
          <Button
            variant="primary"
            onClick={() => navigate('/profile')}
            style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 700 }}
          >
            Post Response →
          </Button>
        </div>
      </div>
    );
  };

  const renderFeaturedCreator = () => (
    <div style={{ padding: '0 var(--space-5) var(--space-4)' }}>
      <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '11px', marginBottom: 'var(--space-2)' }}>
        FEATURED CREATOR
      </Text>
      <div
        onClick={() => navigate('/creators')}
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '20px', padding: '16px',
          border: '1px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
          boxShadow: '0 8px 16px -4px rgba(0,0,0,0.06)'
        }}
      >
        <img src={FEATURED_CREATOR.photo} alt={FEATURED_CREATOR.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-accent-gold)', textTransform: 'uppercase' }}>{FEATURED_CREATOR.title}</span>
          <Text variant="body" style={{ fontWeight: 800, fontSize: '15px' }}>{FEATURED_CREATOR.name}</Text>
          <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{FEATURED_CREATOR.description}</Text>
        </div>
      </div>
    </div>
  );

  const renderCommunityPulse = () => (
    <div style={{ padding: '0 var(--space-5) var(--space-5)' }}>
      <div
        style={{
          backgroundColor: 'rgba(17,17,17,0.02)',
          borderRadius: '16px', padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid rgba(17,17,17,0.04)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{COMMUNITY_PULSE.creatorsJoined}</div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Joined</div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(17,17,17,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{COMMUNITY_PULSE.opportunities}</div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Gigs</div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(17,17,17,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{COMMUNITY_PULSE.appreciations}</div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Appreciations</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-fade-in" style={{ paddingBottom: '120px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>

      {/* Sticky Header */}
      <div
        style={{
          padding: 'var(--space-6) var(--space-5) var(--space-4)',
          borderBottom: '1px solid rgba(17,17,17,0.03)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          backgroundColor: 'rgba(250,250,250,0.9)',
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {getGreeting()}
          </span>
          <Text variant="h1" style={{ fontWeight: 800 }}>
            {user?.name ? user.name.split(' ')[0] : 'Community Guest'}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="15" r="4.5" fill="url(#headerGoldGrad)" />
            <circle cx="50" cy="8" r="5" fill="url(#headerGoldGrad)" />
            <circle cx="64" cy="15" r="4.5" fill="url(#headerGoldGrad)" />
            <circle cx="50" cy="55" r="32" stroke="url(#headerGoldGrad)" strokeWidth="2.5" strokeDasharray="2 2" opacity="0.5" />
            <circle cx="50" cy="55" r="28" stroke="url(#headerGoldGrad)" strokeWidth="1.5" />
            <path d="M50 32 C42 45, 34 55, 34 68 C34 77, 41 83, 50 83 C59 83, 66 77, 66 68 C66 55, 58 45, 50 32 Z" stroke="url(#headerGoldGrad)" strokeWidth="2" fill="url(#headerGoldGradFill)" />
            <path d="M50 45 C45 52, 40 60, 40 68 C40 73, 44 78, 50 78 C56 78, 60 73, 60 68 C60 60, 55 52, 50 45 Z" stroke="url(#headerGoldGrad)" strokeWidth="1.5" />
            <line x1="50" y1="32" x2="50" y2="83" stroke="url(#headerGoldGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <defs>
              <linearGradient id="headerGoldGrad" x1="50" y1="5" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
              <linearGradient id="headerGoldGradFill" x1="50" y1="32" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
          <Text variant="metadata" color="accent" style={{ fontFamily: 'var(--font-family-brand)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '14px', color: 'var(--color-accent-gold)' }}>
            Jainfluence
          </Text>
        </div>
      </div>
      {renderDailyPrompt()}
      {renderFeaturedCreator()}
      {renderCommunityPulse()}


        {/* Skeleton while loading */}
        {isLoading && liveActivities.length === 0 && <FeedSkeleton count={3} />}

        {/* Beautiful empty state */}
        {!isLoading && liveActivities.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-10) var(--space-5)',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed rgba(17,17,17,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)'
            }}
          >
            <span style={{ fontSize: '40px', display: 'block' }}>🌱</span>
            <div>
              <Text variant="body" style={{ fontWeight: 800, fontSize: '16px' }}>The community is just getting started.</Text>
              <Text variant="metadata" color="secondary" style={{ marginTop: 'var(--space-2)', lineHeight: 1.6, fontSize: '13px' }}>
                Share the first moment.<br />Every contribution matters here.
              </Text>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/profile')}
              style={{ height: '42px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 700, marginTop: 'var(--space-2)', padding: '0 var(--space-6)' }}
            >
              ＋ Create
            </Button>
          </div>
        )}

        {/* Real activity cards */}
        {liveActivities.map((activity: ActivityModel) => {
          const liked = isLiked(activity.postId);
          const isPending = activity.status === 'pending';

          return (
            <React.Fragment key={activity.postId}>
            <div
              className={isPending ? 'pending-pulse' : ''}
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: '28px',
                border: isPending ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.5)',
                overflow: 'hidden',
                boxShadow: '0 16px 32px -8px rgba(0,0,0,0.08), 0 4px 16px -4px rgba(0,0,0,0.04)',
                marginBottom: 'var(--space-4)',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              {/* Author header */}
              <div
                style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: '16px 16px 12px 16px', cursor: 'pointer' }}
                onClick={() => !isPending && navigate(`/profile/${activity.authorId}`)}
              >
                <img
                  src={activity.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.authorName)}&background=D4AF37&color=fff&size=64`}
                  alt={activity.authorName}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: 700, fontSize: '14px' }}>{activity.authorName}</Text>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {ACTIVITY_LABELS[activity.activityType] ?? '📋 Activity'} · {isPending ? 'Uploading…' : formatTime(activity.timestamp)}
                  </span>
                </div>
                {isPending && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div className="shimmer" style={{ width: '48px', height: '3px', borderRadius: '999px' }} />
                  </div>
                )}
              </div>

              {/* Media — only render if URL is a real persistent URL (not a blob) */}
              {activity.mediaUrls?.[0] && !activity.mediaUrls[0].startsWith('blob:') && (
                <div style={{ width: '100%', aspectRatio: activity.activityType === 'video' ? '16/9' : '4/3', overflow: 'hidden', position: 'relative' }}>
                  {activity.activityType === 'video' ? (
                    <video
                      src={activity.mediaUrls[0]}
                      controls
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#000' }}
                    />
                  ) : (
                    <img
                      src={activity.mediaUrls[0]}
                      alt="activity"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.currentTarget.parentElement!.style.display = 'none'; }}
                    />
                  )}
                  {isPending && (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>UPLOADING…</span>
                    </div>
                  )}
                </div>
              )}

              {/* Caption + hashtags (styled beautifully for text-only) */}
              {(activity.caption || activity.hashtags?.length > 0) && (() => {
                const isOpp = activity.activityType === 'opportunity' || activity.postId.includes('_opportunity_');
                let parsedOpp: any = null;
                if (isOpp) {
                  try {
                    parsedOpp = JSON.parse(activity.caption || '');
                  } catch {
                    parsedOpp = null;
                  }
                }

                if (parsedOpp) {
                  return (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-accent-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                          💼 {parsedOpp.type === 'hiring' ? 'Hiring / Offering Work' : 'Work Wanted'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                          📍 {parsedOpp.location}
                        </span>
                      </div>
                      <div>
                        <Text variant="body" style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                          {parsedOpp.title}
                        </Text>
                        <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                          Role: {parsedOpp.role}
                        </Text>
                      </div>
                      
                      <div style={{ backgroundColor: 'rgba(17, 17, 17, 0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(17, 17, 17, 0.03)' }}>
                        <Text variant="body" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                          {parsedOpp.description}
                        </Text>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                          💰 {parsedOpp.compensation}
                        </span>
                      </div>

                      {activity.hashtags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {activity.hashtags.map((tag: string, i: number) => (
                            <span key={i} style={{ padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '12px', fontSize: '12px', color: 'var(--color-accent-gold)', fontWeight: 700 }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div style={{ padding: activity.mediaUrls?.[0] ? '12px 16px 8px' : '24px 20px' }}>
                    {activity.caption && (
                      <Text 
                        variant="body" 
                        style={{ 
                          fontSize: activity.mediaUrls?.[0] ? '14px' : '20px', 
                          fontWeight: activity.mediaUrls?.[0] ? 400 : 500,
                          lineHeight: activity.mediaUrls?.[0] ? 1.5 : 1.4,
                          letterSpacing: activity.mediaUrls?.[0] ? '0' : '-0.3px',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        {activity.caption}
                      </Text>
                    )}
                    {activity.hashtags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {activity.hashtags.map((tag, i) => (
                          <span key={i} style={{ padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '12px', fontSize: '12px', color: 'var(--color-accent-gold)', fontWeight: 700 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Reaction bar — disabled while pending */}
              {/* Reaction bar — disabled while pending */}
              {!isPending && (
                <div 
                  style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: '8px 16px 16px', borderTop: '1px solid rgba(17,17,17,0.03)', position: 'relative' }}
                  onMouseLeave={() => {
                    if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    setAppreciationPopupFor(null);
                  }}
                >
                  
                  {/* Appreciation Popup Menu */}
                  {appreciationPopupFor === activity.postId && (
                    <div 
                      style={{
                        position: 'absolute', bottom: '100%', left: '16px', marginBottom: '8px',
                        backgroundColor: 'var(--color-bg-surface)', padding: '12px',
                        borderRadius: '24px', display: 'flex', gap: '12px',
                        boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(17,17,17,0.08)', zIndex: 50,
                        animation: 'pop-in 0.2s var(--spring-bouncy) both'
                      }}
                    >
                      {[
                        { icon: '❤️', label: 'Inspired Me' },
                        { icon: '👏', label: 'Appreciated' },
                        { icon: '🤝', label: 'Want to Connect' }
                      ].map(opt => (
                        <div 
                          key={opt.icon}
                          onClick={() => {
                            setLocalAppreciations(prev => ({ ...prev, [activity.postId]: opt.icon }));
                            if (!liked && user?.uid) likePost(user.uid, activity.postId);
                            setAppreciationPopupFor(null);
                          }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <div style={{ fontSize: '24px', transition: 'transform 0.1s' }} onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.85)')} onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                            {opt.icon}
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!liked && user?.uid) likePost(user.uid, activity.postId);
                      setAppreciationPopupFor(appreciationPopupFor === activity.postId ? null : activity.postId);
                    }}
                    onMouseEnter={() => {
                      longPressTimer.current = setTimeout(() => {
                        setAppreciationPopupFor(activity.postId);
                      }, 300);
                    }}
                    onMouseLeave={() => {
                      if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    }}
                    style={{
                      border: 'none', cursor: 'pointer',
                      background: liked ? 'rgba(212,175,55,0.1)' : 'transparent',
                      color: liked ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      borderRadius: 'var(--radius-full)', padding: '5px 12px',
                      fontSize: '13px', fontWeight: 700, transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    {liked ? (localAppreciations[activity.postId] || '❤️') : '🤍'} {activity.likesCount}
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${activity.authorId}`)}
                    style={{
                      border: 'none', cursor: 'pointer', background: 'transparent',
                      color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family)',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      borderRadius: 'var(--radius-full)', padding: '5px 12px',
                      fontSize: '12px', fontWeight: 600
                    }}
                  >
                    View Profile →
                  </button>
                </div>
              )}
            </div>

            </React.Fragment>
          );
        })}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: '1px' }} />

        {/* Load-more skeleton */}
        {isFetchingMore && <FeedSkeleton count={2} />}

        {/* End of feed */}
        {!hasMore && liveActivities.length > 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              You've seen everything · {liveActivities.length} contributions
            </span>
          </div>
        )}
      </div>
  );
};

export default ExploreScreen;
