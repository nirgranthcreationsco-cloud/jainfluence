import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import type { PostModel } from '../../data/types';

import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

const WEEKLY_PICKS = [
  { id: '1', title: 'Top Creator', name: 'Siddharth Shah', label: 'Temple Architect', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop' },
  { id: '2', title: 'Helpful Member', name: 'Aarav Jain', label: 'Volunteered 24h', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop' },
  { id: '3', title: 'Rising Artist', name: 'Devika Singhi', label: 'Ahimsa Painter', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' }
];

// Pinned curated editorial cards that always appear at the top of the stream
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
    desc: 'Expanding marble preservation efforts in partnership with heritage architects from Rajasthan.',
    image: null,
    actionLabel: 'View Community Page',
    actionTarget: '/community' as const
  }
];

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { posts, isLoading, loadFeed, likePost, isLiked } = useFeedStore();

  useEffect(() => {
    loadFeed(user?.uid);
  }, [user?.uid, loadFeed]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  };

  return (
    <div className="page-fade-in" style={{ paddingBottom: '120px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>

      {/* Header */}
      <div
        style={{
          padding: 'var(--space-6) var(--space-5) var(--space-4) var(--space-5)',
          borderBottom: '1px solid rgba(17,17,17,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          backgroundColor: 'var(--color-bg-base)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
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
      <div style={{ padding: 'var(--space-4) var(--space-5) var(--space-2) var(--space-5)' }}>
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
                textAlign: 'center', gap: '6px', cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-accent-gold)', textTransform: 'uppercase' }}>
                {pick.title}
              </span>
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
                flexShrink: 0, width: '175px',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)',
                border: '1px solid rgba(17,17,17,0.03)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px',
                boxShadow: 'var(--shadow-subtle)'
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

        {/* Pinned curated editorial cards */}
        {PINNED_CARDS.map(card => (
          <div
            key={card.id}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(17, 17, 17, 0.04)',
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
            <Button
              variant="secondary"
              onClick={() => navigate(card.actionTarget)}
              style={{ height: '34px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, alignSelf: 'flex-start', padding: '0 var(--space-4)' }}
            >
              {card.actionLabel}
            </Button>
          </div>
        ))}

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}

        {/* Real posts from Supabase */}
        {!isLoading && posts.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 'var(--space-8) var(--space-5)',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed rgba(17,17,17,0.06)'
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: 'var(--space-3)' }}>🌿</span>
            <Text variant="body" style={{ fontWeight: 700 }}>The stream is quiet</Text>
            <Text variant="metadata" color="secondary" style={{ marginTop: 'var(--space-2)', lineHeight: 1.4 }}>
              Be the first to publish your work. Go to your profile and tap "＋ Publish Work".
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate('/profile')}
              style={{ height: '40px', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-4)', fontSize: '13px' }}
            >
              Go to My Profile
            </Button>
          </div>
        )}

        {!isLoading && posts.map((post: PostModel) => {
          const liked = isLiked(post.postId);
          return (
            <div
              key={post.postId}
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(17, 17, 17, 0.04)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              {/* Post header */}
              <div
                style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-4) var(--space-4) var(--space-3) var(--space-4)', cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${post.authorId}`)}
              >
                <img
                  src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=D4AF37&color=fff&size=64`}
                  alt={post.authorName}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: 700, fontSize: '14px' }}>{post.authorName}</Text>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    🎨 Portfolio Work · {formatTime(post.timestamp)}
                  </span>
                </div>
              </div>

              {/* Post image */}
              {post.mediaUrls?.[0] && (
                <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                  <img
                    src={post.mediaUrls[0]}
                    alt="portfolio work"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              {/* Caption & hashtags */}
              <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                {post.caption && (
                  <Text variant="body" style={{ fontSize: '14px', lineHeight: 1.4 }}>{post.caption}</Text>
                )}
                {post.hashtags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'var(--space-2)' }}>
                    {post.hashtags.map((tag, i) => (
                      <span key={i} style={{ fontSize: '12px', color: 'var(--color-accent-gold)', fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reaction bar */}
              <div
                style={{
                  display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                  padding: 'var(--space-2) var(--space-4) var(--space-4) var(--space-4)',
                  borderTop: '1px solid rgba(17,17,17,0.03)'
                }}
              >
                <button
                  onClick={() => user?.uid && likePost(user.uid, post.postId)}
                  style={{
                    border: 'none', cursor: 'pointer',
                    background: liked ? 'rgba(212,175,55,0.08)' : 'transparent',
                    color: liked ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    borderRadius: 'var(--radius-full)', padding: '4px 10px',
                    fontSize: '13px', fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {liked ? '👏' : '🤍'} {post.likesCount}
                </button>
                <button
                  onClick={() => navigate(`/profile/${post.authorId}`)}
                  style={{
                    border: 'none', cursor: 'pointer',
                    background: 'transparent',
                    color: 'var(--color-text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    borderRadius: 'var(--radius-full)', padding: '4px 10px',
                    fontSize: '13px', fontWeight: 600
                  }}
                >
                  View Portfolio →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ExploreScreen;
