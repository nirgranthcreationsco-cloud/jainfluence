import React, { useState } from 'react';
import { Search, MapPin, Plus, X } from 'lucide-react';
import { Text } from '../components/ui/Text';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';

interface CommunityEntity {
  id: string;
  name: string;
  category: 'Events' | 'Temples' | 'Organizations';
  description: string;
  location: string;
  meta: string;
  photo: string;
}

const INITIAL_ENTITIES: CommunityEntity[] = [
  {
    id: '1',
    name: 'Dilwara Temples',
    category: 'Temples',
    description: 'World-famous Jain pilgrimage site in Mount Abu, Rajasthan, noted for its extraordinary marble carving.',
    location: 'Mount Abu, Rajasthan',
    meta: 'Built 11th - 13th Century AD',
    photo: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Ahimsa Foundation Trust',
    category: 'Organizations',
    description: 'Promoting non-violence, compassion, and animal welfare through community campaigns and education.',
    location: 'New Delhi',
    meta: '1,200 Volunteers Networked',
    photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Annual Jain Youth Meet 2026',
    category: 'Events',
    description: 'A three-day collaborative summit focusing on identity, professional development, and community impact.',
    location: 'Mumbai, Maharashtra',
    meta: 'July 15 - July 18 • 9:00 AM',
    photo: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Palitana Tirth Heritage',
    category: 'Temples',
    description: 'Sacred temple cluster featuring 863 marble-carved shrines resting upon the hills of Shatrunjaya.',
    location: 'Bhavnagar, Gujarat',
    meta: 'Shatrunjaya Hills Pilgrimage',
    photo: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1080&auto=format&fit=crop'
  }
];

export const CommunityScreen: React.FC = () => {
  const [entities, setEntities] = useState<CommunityEntity[]>(INITIAL_ENTITIES);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Events' | 'Temples' | 'Organizations'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Events' | 'Temples' | 'Organizations'>('Events');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meta, setMeta] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !location) {
      alert('Please fill out the required fields.');
      return;
    }
    const newEntity: CommunityEntity = {
      id: 'entity_' + Date.now(),
      name,
      category,
      description,
      location,
      meta: meta || (category === 'Events' ? 'July 20 • 6:00 PM' : 'Registered Organisation'),
      photo: category === 'Temples' 
        ? 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop'
    };
    setEntities([newEntity, ...entities]);
    setShowAddDrawer(false);
    // Reset form
    setName('');
    setDescription('');
    setLocation('');
    setMeta('');
  };

  const filteredEntities = entities.filter(e => {
    const matchesFilter = selectedFilter === 'All' || e.category === selectedFilter;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', position: 'relative' }}>
      
      {/* Header Panel */}
      <div style={{ padding: 'var(--space-5) var(--space-5) var(--space-3) var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text variant="hero" style={{ fontWeight: 800 }}>Community</Text>
          <Text variant="body" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>Explore timelines and registers.</Text>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowAddDrawer(true)} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
        >
          <Plus size={20} color="#FFFFFF" />
        </Button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '0 var(--space-5) var(--space-4) var(--space-5)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'rgba(17, 17, 17, 0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(17, 17, 17, 0.01)',
          }}
        >
          <Search size={18} color="var(--color-text-secondary)" />
          <input
            type="text"
            placeholder="Search register listings..."
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

      {/* Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          padding: '0 var(--space-5) var(--space-4) var(--space-5)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {(['All', 'Events', 'Temples', 'Organizations'] as const).map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              style={{
                border: 'none',
                background: isSelected ? 'var(--color-accent-gold)' : 'rgba(17, 17, 17, 0.03)',
                color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                transition: 'all var(--duration-fast) ease',
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Directory Listings */}
      <div style={{ padding: '0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredEntities.map((item) => (
          <Surface
            key={item.id}
            elevated
            padding="none"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(17,17,17,0.04)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-bg-surface)'
            }}
          >
            {/* Split Visual Card */}
            <div style={{ display: 'flex', height: '140px' }}>
              <div style={{ width: '120px', height: '100%' }}>
                <img 
                  src={item.photo} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              
              <div style={{ flex: 1, padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: 'var(--color-accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {item.category}
                </span>
                
                <Text variant="body" style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </Text>
                
                <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', fontSize: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                  {item.description}
                </Text>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} color="var(--color-text-secondary)" />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {item.location}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-accent-gold)', fontWeight: 600 }}>
                    {item.meta}
                  </span>
                </div>
              </div>
            </div>
          </Surface>
        ))}

        {filteredEntities.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
            <span style={{ fontSize: '32px' }}>🏛️</span>
            <Text variant="h3" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              No entities registered
            </Text>
          </div>
        )}
      </div>

      {/* Elegant Add Listing drawer */}
      {showAddDrawer && (
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
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowAddDrawer(false)} />
          
          <form 
            onSubmit={handleAddSubmit}
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
              <Text variant="h3" style={{ fontWeight: 700 }}>Register Listing</Text>
              <button 
                type="button"
                onClick={() => setShowAddDrawer(false)}
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

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Category</Text>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['Events', 'Temples', 'Organizations'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      flex: 1,
                      border: 'none',
                      padding: 'var(--space-2) 0',
                      borderRadius: 'var(--radius-sm)',
                      background: category === cat ? 'var(--color-accent-gold)' : 'rgba(17,17,17,0.03)',
                      color: category === cat ? '#FFFFFF' : 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Title / Name</Text>
              <input 
                type="text"
                placeholder="e.g. Jain Welfare Council"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3) 0',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border-light)',
                  outline: 'none',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family)',
                  background: 'transparent'
                }}
              />
            </div>

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Location</Text>
              <input 
                type="text"
                placeholder="e.g. Surat, Gujarat"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3) 0',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border-light)',
                  outline: 'none',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family)',
                  background: 'transparent'
                }}
              />
            </div>

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Date/Time or Subtitle Metadata</Text>
              <input 
                type="text"
                placeholder="e.g. July 22 • 5:00 PM or Heritage Site"
                value={meta}
                onChange={e => setMeta(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) 0',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border-light)',
                  outline: 'none',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family)',
                  background: 'transparent'
                }}
              />
            </div>

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Description</Text>
              <textarea 
                placeholder="Provide a detailed summary..."
                value={description}
                onChange={e => setDescription(e.target.value)}
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
                  resize: 'none'
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              style={{
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                marginTop: 'var(--space-2)'
              }}
            >
              Add to Register
            </Button>
          </form>
        </div>
      )}

    </div>
  );
};
export default CommunityScreen;
