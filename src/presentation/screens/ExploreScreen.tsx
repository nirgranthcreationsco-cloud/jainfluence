import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { FeedSkeleton } from '../components/ui/FeedSkeleton';
import type { ActivityModel, UserRole } from '../../data/types';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { GuestAuthModal } from '../components/GuestAuthModal';
import { SendProposalModal } from '../components/SendProposalModal';

const DAILY_PROMPTS = [
  'Community Moment.',
  'Show your workspace.',
  'One lesson you learned.',
  'Share today\'s project.',
  'Recommend someone.',
  'Show your best work.',
  'Weekly Reflection.',
];

const FEATURED_CREATOR = {
  title: 'Top Architect',
  name: 'Siddharth Shah',
  photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
  reputation: 342,
  description: 'Shared 14 incredible temple designs this month.',
  authorId: 'user_siddharth',
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

// Role accent colors — subtle left-border style
const ROLE_ACCENTS: Record<UserRole, { border: string; bg: string; label: string }> = {
  Creator: { border: '#7C3AED', bg: 'rgba(124,58,237,0.06)', label: 'Creator' },
  Business: { border: '#2563EB', bg: 'rgba(37,99,235,0.06)', label: 'Business' },
  Organization: { border: '#D4AF37', bg: 'rgba(212,175,55,0.07)', label: 'Organization' },
  Individual: { border: 'transparent', bg: 'transparent', label: '' },
};

function getTopRole(roles?: UserRole[]): UserRole | null {
  if (!roles || roles.length === 0) return null;
  const priority: UserRole[] = ['Organization', 'Business', 'Creator', 'Individual'];
  return priority.find(r => roles.includes(r)) ?? null;
}

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activities, isLoading, isFetchingMore, hasMore, loadFeed, loadMore, likePost, isLiked, fetchCommunityPulse, communityPulse } = useFeedStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appreciationPopupFor, setAppreciationPopupFor] = useState<string | null>(null);
  const [localAppreciations, setLocalAppreciations] = useState<Record<string, string>>({});
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [proposalTarget, setProposalTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    loadFeed(user?.uid);
    fetchCommunityPulse();
  }, [user?.uid, loadFeed, fetchCommunityPulse]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingMore && hasMore) loadMore(user?.uid);
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFetchingMore, hasMore, loadMore, user?.uid]);

  const requireAuth = (action: () => void) => {
    if (!user) { setShowGuestModal(true); return; }
    action();
  };

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
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.4)', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 16px 32px -8px rgba(212,175,55,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#D4AF37' }} />
          <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#D4AF37', fontWeight: 800, fontSize: '10px', marginBottom: '12px' }}>Today's Prompt</Text>
          <Text variant="body" style={{ fontWeight: 800, fontSize: '20px', lineHeight: 1.3, marginBottom: '20px', color: '#111111' }}>{promptText}</Text>
          <Button variant="primary" onClick={() => requireAuth(() => navigate('/profile'))} style={{ width: '100%', height: '44px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>
            Post Response →
          </Button>
        </div>
      </div>
    );
  };

  const renderFeaturedCreator = () => (
    <div style={{ padding: '0 20px 16px' }}>
      <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', color: '#737373', fontWeight: 700, fontSize: '11px', marginBottom: '8px' }}>FEATURED CREATOR</Text>
      <div onClick={() => navigate('/creators')} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.06)' }}>
        <img src={FEATURED_CREATOR.photo} alt={FEATURED_CREATOR.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase' }}>{FEATURED_CREATOR.title}</span>
          <Text variant="body" style={{ fontWeight: 800, fontSize: '15px' }}>{FEATURED_CREATOR.name}</Text>
          <Text variant="metadata" style={{ color: '#737373', fontSize: '12px' }}>{FEATURED_CREATOR.description}</Text>
        </div>
      </div>
    </div>
  );

  const renderCommunityPulse = () => (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ backgroundColor: 'rgba(17,17,17,0.02)', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(17,17,17,0.04)' }}>
        {[
          { label: 'Members', value: communityPulse?.members },
          { label: 'Posts', value: communityPulse?.posts },
          { label: 'Gigs', value: communityPulse?.gigs },
          { label: 'Appreciations', value: communityPulse?.appreciations },
        ].map((item, idx, arr) => (
          <React.Fragment key={item.label}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111111' }}>{item.value ?? '—'}</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#737373', textTransform: 'uppercase', marginTop: '2px' }}>{item.label}</div>
            </div>
            {idx < arr.length - 1 && <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(17,17,17,0.08)' }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderRoleBadge = (activity: ActivityModel) => {
    const topRole = getTopRole(activity.authorRoles);
    if (!topRole || topRole === 'Individual') return null;
    const accent = ROLE_ACCENTS[topRole];
    return (
      <span style={{
        fontSize: '9px', fontWeight: 800,
        color: accent.border,
        backgroundColor: accent.bg,
        padding: '2px 7px',
        borderRadius: '999px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginLeft: '6px',
        border: `1px solid ${accent.border}22`,
      }}>
        {accent.label}
      </span>
    );
  };

  return (
    <div className="page-fade-in" style={{ paddingBottom: '120px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* Guest Auth Modal */}
      {showGuestModal && <GuestAuthModal onClose={() => setShowGuestModal(false)} />}

      {/* Send Proposal Modal */}
      {proposalTarget && user && (
        <SendProposalModal
          opportunityId={proposalTarget.id}
          opportunityTitle={proposalTarget.title}
          onClose={() => setProposalTarget(null)}
        />
      )}

      {/* Sticky Header */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(17,17,17,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', backgroundColor: 'rgba(250,250,250,0.9)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '1px' }}>{getGreeting()}</span>
          <Text variant="h1" style={{ fontWeight: 800 }}>
            {user?.name ? user.name.split(' ')[0] : 'Explore'}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!user && (
            <button onClick={() => navigate('/login')} style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
              Join
            </button>
          )}
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
            <circle cx="36" cy="15" r="4.5" fill="url(#headerGoldGradE)" />
            <circle cx="50" cy="8" r="5" fill="url(#headerGoldGradE)" />
            <circle cx="64" cy="15" r="4.5" fill="url(#headerGoldGradE)" />
            <circle cx="50" cy="55" r="28" stroke="url(#headerGoldGradE)" strokeWidth="1.5" />
            <path d="M50 32 C42 45, 34 55, 34 68 C34 77, 41 83, 50 83 C59 83, 66 77, 66 68 C66 55, 58 45, 50 32 Z" stroke="url(#headerGoldGradE)" strokeWidth="2" fill="url(#headerGoldFillE)" />
            <defs>
              <linearGradient id="headerGoldGradE" x1="50" y1="5" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" /><stop offset="50%" stopColor="#D4AF37" /><stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
              <linearGradient id="headerGoldFillE" x1="50" y1="32" x2="50" y2="83" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE075" stopOpacity="0.15" /><stop offset="100%" stopColor="#D4AF37" stopOpacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
          <Text variant="metadata" style={{ fontFamily: 'var(--font-family-brand)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '14px', color: '#D4AF37' }}>Jainfluence</Text>
        </div>
      </div>

      {renderDailyPrompt()}
      {renderFeaturedCreator()}
      {renderCommunityPulse()}

      {/* Skeleton while loading */}
      {isLoading && liveActivities.length === 0 && <FeedSkeleton count={3} />}

      {/* Empty state */}
      {!isLoading && liveActivities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px dashed rgba(17,17,17,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '40px' }}>🌱</span>
          <div>
            <Text variant="body" style={{ fontWeight: 800, fontSize: '16px' }}>The community is just getting started.</Text>
            <Text variant="metadata" style={{ color: '#737373', marginTop: '8px', lineHeight: 1.6, fontSize: '13px' }}>Share the first moment.</Text>
          </div>
          <Button variant="primary" onClick={() => requireAuth(() => navigate('/profile'))} style={{ height: '42px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, marginTop: '8px', padding: '0 24px' }}>
            ＋ Create
          </Button>
        </div>
      )}

      {/* Feed Cards */}
      {liveActivities.map((activity: ActivityModel) => {
        const liked = isLiked(activity.postId);
        const isPending = activity.status === 'pending';
        const isOpportunity = activity.activityType === 'opportunity' || activity.postId.includes('_opportunity_');
        const topRole = getTopRole(activity.authorRoles);
        const accent = topRole && topRole !== 'Individual' ? ROLE_ACCENTS[topRole] : null;

        let parsedOpp: any = null;
        if (isOpportunity) {
          try { parsedOpp = JSON.parse(activity.caption || ''); } catch { parsedOpp = null; }
        }

        return (
          <React.Fragment key={activity.postId}>
            <div
              className={isPending ? 'pending-pulse' : ''}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '28px',
                border: isPending ? '1px solid rgba(212,175,55,0.3)' : `1px solid ${accent ? accent.border + '20' : 'rgba(255,255,255,0.5)'}`,
                borderLeft: accent ? `3px solid ${accent.border}` : undefined,
                overflow: 'hidden',
                boxShadow: '0 16px 32px -8px rgba(0,0,0,0.08), 0 4px 16px -4px rgba(0,0,0,0.04)',
                marginBottom: '16px',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            >
              {/* Author Header */}
              <div
                style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px 16px 12px 16px', cursor: 'pointer' }}
                onClick={() => !isPending && navigate(`/profile/${activity.authorId}`)}
              >
                <img
                  src={activity.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.authorName)}&background=D4AF37&color=fff&size=64`}
                  alt={activity.authorName}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px' }}>
                    <Text variant="body" style={{ fontWeight: 700, fontSize: '14px' }}>{activity.authorName}</Text>
                    {renderRoleBadge(activity)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#737373', fontWeight: 500 }}>
                    {ACTIVITY_LABELS[activity.activityType] ?? '📋 Activity'} · {isPending ? 'Uploading…' : formatTime(activity.timestamp)}
                  </span>
                </div>
                {isPending && <div className="shimmer" style={{ width: '48px', height: '3px', borderRadius: '999px' }} />}
              </div>

              {/* Media */}
              {activity.mediaUrls?.[0] && !activity.mediaUrls[0].startsWith('blob:') && (
                <div style={{ width: '100%', aspectRatio: activity.activityType === 'video' ? '16/9' : '4/3', overflow: 'hidden', position: 'relative' }}>
                  {activity.activityType === 'video' ? (
                    <video src={activity.mediaUrls[0]} controls playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#000' }} />
                  ) : (
                    <img src={activity.mediaUrls[0]} alt="activity" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.parentElement!.style.display = 'none'; }} />
                  )}
                  {isPending && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>UPLOADING…</span>
                    </div>
                  )}
                </div>
              )}

              {/* Opportunity Card Body */}
              {parsedOpp ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      💼 {parsedOpp.type === 'hiring' ? 'Hiring / Offering Work' : 'Work Wanted'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#737373', fontWeight: 600 }}>📍 {parsedOpp.location}</span>
                  </div>
                  <Text variant="body" style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1.3 }}>{parsedOpp.title}</Text>
                  <Text variant="metadata" style={{ color: '#737373', fontWeight: 600 }}>Role: {parsedOpp.role}</Text>
                  <div style={{ backgroundColor: 'rgba(17,17,17,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(17,17,17,0.03)' }}>
                    <Text variant="body" style={{ fontSize: '13px', lineHeight: 1.5 }}>{parsedOpp.description}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37' }}>💰 {parsedOpp.compensation}</span>
                  </div>
                  {activity.hashtags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {activity.hashtags.map((tag: string, i: number) => (
                        <span key={i} style={{ padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '12px', fontSize: '12px', color: '#D4AF37', fontWeight: 700 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Send Proposal CTA */}
                  <button
                    onClick={() => requireAuth(() => setProposalTarget({ id: activity.postId, title: parsedOpp.title || 'Opportunity' }))}
                    style={{
                      width: '100%', height: '44px', borderRadius: '12px',
                      border: '1.5px solid #D4AF37', backgroundColor: 'rgba(212,175,55,0.06)',
                      color: '#B8860B', fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer', fontFamily: 'var(--font-family)',
                      transition: 'all 0.15s ease',
                    }}
                    onPointerDown={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.14)'; e.currentTarget.style.transform = 'scale(0.98)'; }}
                    onPointerUp={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    ✦ Send Proposal
                  </button>
                </div>
              ) : (
                /* Regular Caption */
                (activity.caption || activity.hashtags?.length > 0) && (
                  <div style={{ padding: activity.mediaUrls?.[0] ? '12px 16px 8px' : '24px 20px' }}>
                    {activity.caption && (
                      <Text variant="body" style={{ fontSize: activity.mediaUrls?.[0] ? '14px' : '20px', fontWeight: activity.mediaUrls?.[0] ? 400 : 500, lineHeight: activity.mediaUrls?.[0] ? 1.5 : 1.4 }}>
                        {activity.caption}
                      </Text>
                    )}
                    {activity.hashtags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {activity.hashtags.map((tag, i) => (
                          <span key={i} style={{ padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '12px', fontSize: '12px', color: '#D4AF37', fontWeight: 700 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Reaction Bar — not for opportunity cards, not pending */}
              {!isPending && !parsedOpp && (
                <div
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 16px 16px', borderTop: '1px solid rgba(17,17,17,0.03)', position: 'relative' }}
                  onMouseLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); setAppreciationPopupFor(null); }}
                >
                  {appreciationPopupFor === activity.postId && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '16px', marginBottom: '8px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '24px', display: 'flex', gap: '12px', boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)', border: '1px solid rgba(17,17,17,0.08)', zIndex: 50, animation: 'pop-in 0.2s var(--spring-bouncy) both' }}>
                      {[{ icon: '❤️', label: 'Inspired Me' }, { icon: '👏', label: 'Appreciated' }, { icon: '🤝', label: 'Want to Connect' }].map(opt => (
                        <div key={opt.icon} onClick={() => {
                          setLocalAppreciations(prev => ({ ...prev, [activity.postId]: opt.icon }));
                          requireAuth(() => { if (user && !liked) likePost(user.uid, activity.postId); });
                          setAppreciationPopupFor(null);
                        }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <div style={{ fontSize: '24px' }}>{opt.icon}</div>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#737373', whiteSpace: 'nowrap' }}>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => requireAuth(() => {
                      if (user && !liked) likePost(user.uid, activity.postId);
                      setAppreciationPopupFor(prev => prev === activity.postId ? null : activity.postId);
                    })}
                    onMouseEnter={() => { longPressTimer.current = setTimeout(() => setAppreciationPopupFor(activity.postId), 300); }}
                    onMouseLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                    style={{ border: 'none', cursor: 'pointer', background: liked ? 'rgba(212,175,55,0.1)' : 'transparent', color: liked ? '#D4AF37' : '#737373', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '999px', padding: '5px 12px', fontSize: '13px', fontWeight: 700, transition: 'all 0.15s ease', fontFamily: 'var(--font-family)' }}
                  >
                    {liked ? (localAppreciations[activity.postId] || '❤️') : '🤍'} {activity.likesCount}
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${activity.authorId}`)}
                    style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#737373', fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '999px', padding: '5px 12px', fontSize: '12px', fontWeight: 600 }}
                  >
                    View Profile →
                  </button>
                </div>
              )}

              {/* Reaction bar for non-opportunity, pending-safe */}
              {!isPending && parsedOpp && null}
            </div>
          </React.Fragment>
        );
      })}

      <div ref={sentinelRef} style={{ height: '1px' }} />
      {isFetchingMore && <FeedSkeleton count={2} />}
      {!hasMore && liveActivities.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '11px', color: '#737373', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            You've seen everything · {liveActivities.length} contributions
          </span>
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;
