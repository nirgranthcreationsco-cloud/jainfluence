import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

interface ActivityItem {
  id: string;
  type: 'portfolio' | 'gig-announcement' | 'achievement' | 'photography' | 'temple-update' | 'milestone';
  author: {
    name: string;
    photo: string;
    role: string;
  };
  title: string;
  desc: string;
  image?: string;
  actions: { label: string; onClick: () => void }[];
  reactions: {
    appreciate: number;
    inspiring: number;
    support: number;
    interested: number;
  };
}

const WEEKLY_PICKS = [
  { id: '1', title: 'Top Creator', name: 'Siddharth Shah', label: 'Temple Architect', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop' },
  { id: '2', title: 'Most Helpful Member', name: 'Aarav Jain', label: 'Volunteered 24h', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop' },
  { id: '3', title: 'Rising Artist', name: 'Devika Singhi', label: 'Ahimsa Painter', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' }
];

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Curated dynamic stream mock dataset representing different community nodes
    const mockActivities: ActivityItem[] = [
      {
        id: 'act_1',
        type: 'portfolio',
        author: {
          name: 'Swasti Jain',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
          role: 'Documentary Filmmaker'
        },
        title: '🎬 Swasti uploaded "Mahavir Documentary"',
        desc: 'A 10-minute cinematic preview exploring ancient Jain heritage caves in Mount Abu.',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop',
        actions: [
          { label: 'Watch Preview', onClick: () => alert('Playing video preview...') },
          { label: 'View Portfolio', onClick: () => navigate('/creators') }
        ],
        reactions: { appreciate: 12, inspiring: 18, support: 9, interested: 4 }
      },
      {
        id: 'act_2',
        type: 'gig-announcement',
        author: {
          name: 'Palitana Shrines Trust',
          photo: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=200&auto=format&fit=crop',
          role: 'Heritage Foundation'
        },
        title: '📅 Panch Kalyanak festival needs 20 creators',
        desc: 'Open call for photographers, video editors, and digital designers to volunteer for coverage of our annual heritage celebrations.',
        actions: [
          { label: 'Apply to Volunteer', onClick: () => navigate('/opportunities') }
        ],
        reactions: { appreciate: 24, inspiring: 14, support: 32, interested: 11 }
      },
      {
        id: 'act_3',
        type: 'achievement',
        author: {
          name: 'Pratham Jain',
          photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
          role: 'Full Stack Engineer'
        },
        title: '🏆 Pratham completed 15 platform portals',
        desc: 'Building and donating customized web assets to digitize temple records across Bangalore.',
        actions: [
          { label: 'See Work', onClick: () => navigate('/creators') }
        ],
        reactions: { appreciate: 41, inspiring: 28, support: 15, interested: 6 }
      },
      {
        id: 'act_4',
        type: 'photography',
        author: {
          name: 'Preeti Kothari',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
          role: 'Fine Art Photographer'
        },
        title: '📷 Preeti published "Echoes of Mount Abu"',
        desc: 'A luxury fine-art photography collection highlighting marble carvings inside Dilwara.',
        image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop',
        actions: [
          { label: 'View Gallery Collection', onClick: () => alert('Opening photo gallery preview...') }
        ],
        reactions: { appreciate: 19, inspiring: 16, support: 11, interested: 2 }
      },
      {
        id: 'act_5',
        type: 'temple-update',
        author: {
          name: 'Siddhachalam Ashram',
          photo: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=200&auto=format&fit=crop',
          role: 'Ashram Trust'
        },
        title: '🏛 Eco-Conservation Project Launch',
        desc: 'Expanding our botanical gardens to cultivate rare organic herbs for free community healthcare distribution.',
        actions: [
          { label: 'Read Full Ashram Update', onClick: () => navigate('/community') }
        ],
        reactions: { appreciate: 35, inspiring: 12, support: 22, interested: 5 }
      }
    ];
    setActivities(mockActivities);
  }, [navigate]);

  const handleReact = (activityId: string, reactionType: 'appreciate' | 'inspiring' | 'support' | 'interested') => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === activityId) {
          return {
            ...act,
            reactions: {
              ...act.reactions,
              [reactionType]: act.reactions[reactionType] + 1
            }
          };
        }
        return act;
      })
    );
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="page-fade-in" style={{ paddingBottom: '120px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      
      {/* Dynamic Magazine Greeting Header */}
      <div 
        style={{
          padding: 'var(--space-6) var(--space-5) var(--space-4) var(--space-5)',
          borderBottom: '1px solid rgba(17,17,17,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          backgroundColor: 'var(--color-bg-base)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {getGreeting()}
          </span>
          <Text variant="h1" style={{ fontWeight: 800 }}>
            {user?.name ? `${user.name.split(' ')[0]}` : 'Community Guest'}
          </Text>
        </div>
        <Text variant="metadata" color="accent" style={{ fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
          ATLAS
        </Text>
      </div>

      {/* Spotify-style "Community Picks" (Viral Loop Highlight Row) */}
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
                flexShrink: 0,
                width: '140px',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                border: '1px solid rgba(17,17,17,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-accent-gold)', textTransform: 'uppercase' }}>
                {pick.title}
              </span>
              <img 
                src={pick.photo} 
                alt={pick.name} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <Text variant="body" style={{ fontWeight: 700, fontSize: '12px' }}>{pick.name}</Text>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {pick.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spotify-style SHELF: Open Opportunities Shelf */}
      <div style={{ marginTop: 'var(--space-5)', padding: '0 var(--space-5)' }}>
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
            { title: 'Need Photographer', type: 'dilwara series', budget: '₹20,000' },
            { title: 'Video Editor Wanted', type: 'ahimsa media', budget: 'Volunteer' },
            { title: 'Tech Mentor Required', type: 'youth registry', budget: 'Consultancy' }
          ].map((opp, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/opportunities')}
              style={{
                flexShrink: 0,
                width: '180px',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-4)',
                border: '1px solid rgba(17,17,17,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <Text variant="body" style={{ fontWeight: 700, fontSize: '13px' }}>{opp.title}</Text>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{opp.type}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-gold)', marginTop: 'var(--space-2)' }}>{opp.budget}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. THE LIVING COMMUNITY STREAM (Tactile Dynamic Cards) */}
      <div style={{ marginTop: 'var(--space-6)', padding: '0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        
        <Text variant="metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '11px', marginBottom: '-2px' }}>
          COMMUNITY HEARTBEAT
        </Text>

        {activities.map((act) => (
          <div
            key={act.id}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(17, 17, 17, 0.04)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            {/* Card Creator Header */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <img 
                src={act.author.photo} 
                alt={act.author.name} 
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                  {act.author.name}
                </Text>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {act.author.role}
                </span>
              </div>
            </div>

            {/* Core Card Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <Text variant="body" style={{ fontWeight: 800, fontSize: '16px', lineHeight: 1.3 }}>
                {act.title}
              </Text>
              <Text variant="metadata" color="secondary" style={{ lineHeight: 1.4, fontSize: '13px', marginTop: '2px' }}>
                {act.desc}
              </Text>
            </div>

            {/* Visual media preview if exists */}
            {act.image && (
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', width: '100%', aspectRatio: '16/10' }}>
                <img 
                  src={act.image} 
                  alt="activity showcase" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Activity Call-To-Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '2px' }}>
              {act.actions.map((action, i) => (
                <Button
                  key={i}
                  variant={i === 0 ? 'primary' : 'secondary'}
                  onClick={action.onClick}
                  style={{
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '0 var(--space-4)'
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Tactile Community Reactions Bar */}
            <div 
              style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 'var(--space-2)', 
                marginTop: 'var(--space-2)', 
                borderTop: '1px solid rgba(17,17,17,0.03)', 
                paddingTop: 'var(--space-3)' 
              }}
            >
              {[
                { type: 'appreciate' as const, label: '👏 Appreciate', count: act.reactions.appreciate },
                { type: 'inspiring' as const, label: '🔥 Inspiring', count: act.reactions.inspiring },
                { type: 'support' as const, label: '❤️ Support', count: act.reactions.support },
                { type: 'interested' as const, label: '🤝 Interested', count: act.reactions.interested }
              ].map(reaction => (
                <button
                  key={reaction.type}
                  onClick={() => handleReact(act.id, reaction.type)}
                  style={{
                    border: 'none',
                    background: 'rgba(17,17,17,0.03)',
                    color: 'var(--color-text-primary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'transform 0.1s ease'
                  }}
                  onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.93)'}
                  onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>{reaction.label}</span>
                  <span style={{ color: 'var(--color-accent-gold)', fontWeight: 700 }}>
                    {reaction.count}
                  </span>
                </button>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
export default ExploreScreen;
