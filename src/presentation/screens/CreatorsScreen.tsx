import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../../data/services/storage';
import type { UserModel, CreatorCategory } from '../../data/types';
import { ALL_CREATOR_CATEGORIES } from '../../data/types';
import { Text } from '../components/ui/Text';
import { GuestAuthModal } from '../components/GuestAuthModal';
import { useAuthStore } from '../store/authStore';

const CATEGORY_ICONS: Record<CreatorCategory, string> = {
  'Photographer': '📷',
  'Videographer': '🎬',
  'Graphic Designer': '🎨',
  'Website Developer': '💻',
  'App Developer': '📱',
  'Artist': '🖌️',
};

const CATEGORY_COLORS: Record<CreatorCategory, string> = {
  'Photographer': '#7C3AED',
  'Videographer': '#DC2626',
  'Graphic Designer': '#D97706',
  'Website Developer': '#2563EB',
  'App Developer': '#059669',
  'Artist': '#DB2777',
};

type CategoryFilter = 'All' | CreatorCategory;

export const CreatorsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creators, setCreators] = useState<UserModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    const fetchCreators = async () => {
      const users = await StorageService.getUsers();
      // Show users who have Creator role OR any creator categories set
      const creatorsOnly = users.filter(u =>
        u.roles?.includes('Creator') || (u.creatorCategories && u.creatorCategories.length > 0)
      );
      setCreators(creatorsOnly.length > 0 ? creatorsOnly : users); // fallback: show all if none tagged yet
      setIsLoading(false);
    };
    fetchCreators();
  }, []);

  const filteredCreators = creators.filter(c => {
    const matchesCategory = selectedCategory === 'All' ||
      (c.creatorCategories && c.creatorCategories.includes(selectedCategory as CreatorCategory)) ||
      // Legacy fallback: skills matching
      (c.skills && c.skills.some(s => s.toLowerCase().includes((selectedCategory as string).toLowerCase().split(' ')[0].toLowerCase())));

    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.creatorCategories && c.creatorCategories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const requireAuth = (action: () => void) => {
    if (!user) { setShowGuestModal(true); return; }
    action();
  };

  return (
    <div className="page-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {showGuestModal && <GuestAuthModal onClose={() => setShowGuestModal(false)} />}

      {/* Header */}
      <div style={{ padding: '24px 20px 16px' }}>
        <Text variant="hero" style={{ fontWeight: 800 }}>Find Talent</Text>
        <Text variant="body" style={{ color: '#737373', marginTop: '4px', fontSize: '14px' }}>
          Discover Jain creators and professionals
        </Text>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(17,17,17,0.05)' }}>
          <Search size={18} color="#A3A3A3" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search creators, skills, city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '15px', fontFamily: 'var(--font-family)', color: '#111111', flex: 1 }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ paddingLeft: '20px', paddingBottom: '20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', paddingRight: '20px' }}>
          {(['All', ...ALL_CREATOR_CATEGORIES] as CategoryFilter[]).map(cat => {
            const active = selectedCategory === cat;
            const color = cat !== 'All' ? CATEGORY_COLORS[cat as CreatorCategory] : '#111111';
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1.5px solid ${active ? color : 'rgba(17,17,17,0.1)'}`,
                  backgroundColor: active ? `${color}12` : '#FFFFFF',
                  color: active ? color : '#737373',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {cat !== 'All' && <span style={{ fontSize: '14px' }}>{CATEGORY_ICONS[cat as CreatorCategory]}</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer" style={{ height: '100px', borderRadius: '20px' }} />
          ))}
        </div>
      )}

      {/* Creators Grid */}
      {!isLoading && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCreators.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#A3A3A3' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <Text variant="body" style={{ fontWeight: 700, color: '#737373' }}>No creators found</Text>
              <Text variant="metadata" style={{ color: '#A3A3A3', marginTop: '6px' }}>Try a different filter or search term</Text>
            </div>
          )}

          {filteredCreators.map(creator => {
            const topCategory = creator.creatorCategories?.[0];
            const color = topCategory ? CATEGORY_COLORS[topCategory] : '#D4AF37';

            return (
              <div
                key={creator.uid}
                onClick={() => navigate(`/profile/${creator.uid}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '16px',
                  border: `1px solid ${color}18`,
                  borderLeft: `3px solid ${color}`,
                  boxShadow: '0 4px 16px -4px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <img
                    src={creator.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=${color.slice(1)}&color=fff&size=80`}
                    alt={creator.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <Text variant="body" style={{ fontWeight: 800, fontSize: '16px' }}>{creator.name}</Text>
                      {creator.isVerified && <CheckCircle2 size={14} color="#D4AF37" />}
                    </div>

                    {/* Category chips */}
                    {creator.creatorCategories && creator.creatorCategories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {creator.creatorCategories.slice(0, 3).map(cat => (
                          <span key={cat} style={{ fontSize: '10px', fontWeight: 700, color: CATEGORY_COLORS[cat], backgroundColor: `${CATEGORY_COLORS[cat]}12`, padding: '2px 8px', borderRadius: '999px' }}>
                            {CATEGORY_ICONS[cat]} {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    <Text variant="metadata" style={{ color: '#737373', fontSize: '12px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as any}>
                      {creator.bio || 'Member of the Jain community.'}
                    </Text>

                    {creator.city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <MapPin size={11} color="#A3A3A3" />
                        <span style={{ fontSize: '11px', color: '#A3A3A3', fontFamily: 'var(--font-family)' }}>{creator.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(17,17,17,0.04)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#111111' }}>{creator.followersCount || 0}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Followers</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#111111' }}>{creator.projectsCompleted || 0}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#111111' }}>{creator.hireCount || 0}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hires</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={e => { e.stopPropagation(); requireAuth(() => navigate(`/profile/${creator.uid}`)); }}
                    style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${color}`, backgroundColor: `${color}0A`, color: color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 0.15s ease' }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
