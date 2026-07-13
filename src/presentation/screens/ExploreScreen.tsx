import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { FeedSkeleton } from '../components/ui/FeedSkeleton';
import type { ActivityModel } from '../../data/types';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

const WEEKLY_PICKS = [
  { id: '1', title: 'Top Creator', name: 'Siddharth Shah', label: 'Temple Architect', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop' },
  { id: '2', title: 'Helpful Member', name: 'Aarav Jain', label: 'Volunteered 24h', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop' },
  { id: '3', title: 'Rising Artist', name: 'Devika Singhi', label: 'Ahimsa Painter', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' }
];

const PINNED_CARDS = [
  {
    id: 'pin_1',
    emoji: '📅',
    tag: 'COMMUNITY EVENT',
    title: 'Panch Kalyanak Mahotsav',
    desc: 'Open call for photographers, video editors & digital designers to volunteer for coverage of our annual heritage celebrations.',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop',
    actionLabel: 'Apply to Volunteer',
    actionTarget: '/opportunities' as const
  },
  {
    id: 'pin_2',
    emoji: '🏛',
    tag: 'TEMPLE UPDATE',
    title: 'Dilwara Temple Conservation Drive',
    desc: 'Expanding marble preservation in partnership with heritage architects from Rajasthan.',
    image: null as null,
    actionLabel: 'View Community Page',
    actionTarget: '/community' as const
  }
];

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
        <Text variant="metadata" color="accent" style={{ fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
          ATLAS
        </Text>
      </div>

      {/* Community Picks */}
      <div style={{ padding: 'var(--space-4) var(--space-5) var(--space-2)' }}>
        <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '11px', marginBottom: 'var(--space-3)' }}>
          COMMUNITY PICKS
        </Text>
        <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
          {WEEKLY_PICKS.map(pick => (
            <div
              key={pick.id}
              onClick={() => navigate('/creators')}
              style={{
                flexShrink: 0, width: '140px', backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
                border: '1px solid rgba(17,17,17,0.04)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: '6px', cursor: 'pointer', boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-accent-gold)', textTransform: 'uppercase' }}>{pick.title}</span>
              <img src={pick.photo} alt={pick.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <Text variant="body" style={{ fontWeight: 700, fontSize: '12px' }}>{pick.name}</Text>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{pick.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Opportunities Shelf */}
      <div style={{ marginTop: 'var(--space-4)', padding: '0 var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '11px' }}>
            OPEN OPPORTUNITIES
          </Text>
          <Button variant="ghost" onClick={() => navigate('/opportunities')} style={{ padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-accent-gold)', fontWeight: 600 }}>Gig Board</span>
            <ChevronRight size={14} color="var(--color-accent-gold)" />
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { title: 'Need Photographer', org: 'Dilwara Series', budget: '₹20,000' },
            { title: 'Video Editor Wanted', org: 'Ahimsa Media', budget: 'Volunteer' },
            { title: 'Tech Mentor Required', org: 'Youth Registry', budget: 'Consultancy' }
          ].map((opp, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/opportunities')}
              style={{
                flexShrink: 0, width: '175px', backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)',
                border: '1px solid rgba(17,17,17,0.03)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <Text variant="body" style={{ fontWeight: 700, fontSize: '13px' }}>{opp.title}</Text>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{opp.org}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-gold)', marginTop: 'var(--space-2)' }}>{opp.budget}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Heartbeat Stream */}
      <div style={{ marginTop: 'var(--space-6)', padding: '0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '11px', marginBottom: '-2px' }}>
          COMMUNITY HEARTBEAT
        </Text>

        {/* Pinned editorial cards */}
        {PINNED_CARDS.map(card => (
          <div
            key={card.id}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(17,17,17,0.04)',
              padding: 'var(--space-5)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '20px' }}>{card.emoji}</span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.tag}</span>
            </div>
            <Text variant="body" style={{ fontWeight: 800, fontSize: '16px', lineHeight: 1.3 }}>{card.title}</Text>
            <Text variant="metadata" color="secondary" style={{ lineHeight: 1.4, fontSize: '13px' }}>{card.desc}</Text>
            {card.image && (
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', width: '100%', aspectRatio: '16/10' }}>
                <img src={card.image} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <Button variant="secondary" onClick={() => navigate(card.actionTarget)} style={{ height: '34px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, alignSelf: 'flex-start', padding: '0 var(--space-4)' }}>
              {card.actionLabel}
            </Button>
          </div>
        ))}

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
            <div
              key={activity.postId}
              className={isPending ? 'pending-pulse' : ''}
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: isPending ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(17,17,17,0.04)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-subtle)',
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

              {/* Media */}
              {activity.mediaUrls?.[0] && (
                <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={activity.mediaUrls[0]}
                    alt="activity"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
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

              {/* Caption + hashtags */}
              {(activity.caption || activity.hashtags?.length > 0) && (
                <div style={{ padding: '12px 16px 8px' }}>
                  {activity.caption && (
                    <Text variant="body" style={{ fontSize: '14px', lineHeight: 1.5 }}>{activity.caption}</Text>
                  )}
                  {activity.hashtags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {activity.hashtags.map((tag, i) => (
                        <span key={i} style={{ fontSize: '12px', color: 'var(--color-accent-gold)', fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reaction bar — disabled while pending */}
              {!isPending && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: '8px 16px 16px', borderTop: '1px solid rgba(17,17,17,0.03)' }}>
                  <button
                    onClick={() => user?.uid && likePost(user.uid, activity.postId)}
                    style={{
                      border: 'none', cursor: 'pointer',
                      background: liked ? 'rgba(212,175,55,0.1)' : 'transparent',
                      color: liked ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      borderRadius: 'var(--radius-full)', padding: '5px 12px',
                      fontSize: '13px', fontWeight: 700, transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-family)',
                    }}
                    onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
                    onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {liked ? '👏' : '🤍'} {activity.likesCount}
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
    </div>
  );
};

export default ExploreScreen;
