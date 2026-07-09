import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../../data/services/storage';
import type { UserModel } from '../../data/types';

import { Text } from '../components/ui/Text';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  'All', 'Video Editors', 'Photographers', 'Developers',
  'Speakers', 'Designers', 'Writers', 'Artists'
];

export const CreatorsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<UserModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      const users = await StorageService.getUsers();
      setCreators(users);
      setIsLoading(false);
    };
    fetchCreators();
  }, []);

  const filteredCreators = creators.filter(c => {
    // Standard mock tags or skills check
    const matchesCategory = selectedCategory === 'All' || 
      (c.skills && c.skills.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, -1)))) ||
      (selectedCategory === 'Video Editors' && c.skills && c.skills.some(s => s.toLowerCase().includes('video') || s.toLowerCase().includes('editor')));
    
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.skills && c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      
      {/* Search & Header Section */}
      <div style={{ padding: 'var(--space-5) var(--space-5) var(--space-3) var(--space-5)' }}>
        <Text variant="hero" style={{ fontWeight: 800 }}>
          Find Talent
        </Text>
        
        {/* Editorial Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-4)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'rgba(17, 17, 17, 0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(17, 17, 17, 0.01)',
          }}
        >
          <Search size={18} color="var(--color-text-secondary)" />
          <input
            type="text"
            placeholder="Search skills, names, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          padding: '0 var(--space-5) var(--space-4) var(--space-5)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                border: 'none',
                background: isSelected ? 'var(--color-accent-gold)' : 'rgba(17, 17, 17, 0.03)',
                color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all var(--duration-fast) ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Creators Visual List */}
      <div style={{ padding: '0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {isLoading ? (
          <Surface padding="md" style={{ borderRadius: 'var(--radius-lg)' }}>
            <Text color="secondary">Loading creators directory...</Text>
          </Surface>
        ) : filteredCreators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
            <span style={{ fontSize: '32px' }}>🔍</span>
            <Text variant="h3" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              No creators found
            </Text>
          </div>
        ) : (
          filteredCreators.map((creator) => (
            <Surface
              key={creator.uid}
              elevated
              padding="md"
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(17, 17, 17, 0.04)',
                backgroundColor: 'var(--color-bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/profile/${creator.uid}`)}
            >
              {/* Creator Info Row */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <img
                  src={creator.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&fit=crop'}
                  alt={creator.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Text variant="body" style={{ fontWeight: 700, fontSize: '16px' }}>{creator.name}</Text>
                    {creator.isVerified && <CheckCircle2 size={15} color="var(--color-accent-gold)" fill="var(--color-accent-gold)" style={{ color: '#FFFFFF' }} />}
                  </div>
                  
                  <Text variant="metadata" color="secondary">@{creator.username}</Text>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: '4px' }}>
                    <MapPin size={12} color="var(--color-text-secondary)" />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {creator.location || 'India'}
                    </span>
                  </div>
                </div>

                {/* Rating & reviews */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={14} color="var(--color-accent-gold)" fill="var(--color-accent-gold)" />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      {creator.reviewRating || '5.0'}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    ({creator.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Bio summary */}
              <Text variant="metadata" style={{ color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                {creator.bio || 'Digital creator. Dedicated to community growth and creative collaboration.'}
              </Text>

              {/* Skills checklist tags */}
              {creator.skills && creator.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                  {creator.skills.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(17, 17, 17, 0.03)',
                        color: 'var(--color-text-secondary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Trigger button */}
              <Button
                variant="secondary"
                fullWidth
                style={{
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  border: '1px solid rgba(17, 17, 17, 0.05)'
                }}
              >
                View living identity
              </Button>
            </Surface>
          ))
        )}
      </div>

    </div>
  );
};
export default CreatorsScreen;
