import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Plus, X, MessageCircle } from 'lucide-react';
import { Text } from '../components/ui/Text';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';

interface Opportunity {
  id: string;
  title: string;
  type: 'hiring' | 'work-wanted';
  role: string;
  compensation: string;
  postedBy: {
    name: string;
    photo: string;
    org?: string;
  };
  location: string;
  description: string;
  tags: string[];
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Video Editor for Paryushan Documentary',
    type: 'hiring',
    role: 'Video Editor',
    compensation: '₹25,000 Project Budget',
    postedBy: {
      name: 'Ahimsa Media Trust',
      photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=200&auto=format&fit=crop',
      org: 'Media & NGO'
    },
    location: 'Remote',
    description: 'Looking for a skilled video editor to assemble a 20-minute editorial documentary on the historical origins of Paryushan Parva. Clean aesthetics and editorial storytelling required.',
    tags: ['Premiere Pro', 'Documentary', 'Editorial']
  },
  {
    id: '2',
    title: 'Available for UI Design & Dev consulting',
    type: 'work-wanted',
    role: 'UI Designer / Dev',
    compensation: 'Available for Freelance Gigs',
    postedBy: {
      name: 'Aarav Shah',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop'
    },
    location: 'Bangalore / Remote',
    description: 'Experienced frontend developer and designer looking to volunteer or consult on temple registries, NGO portal builds, and community directory applications.',
    tags: ['React', 'Figma', 'Consulting']
  },
  {
    id: '3',
    title: 'Speaker needed for Business Summit',
    type: 'hiring',
    role: 'Keynote Speaker',
    compensation: 'Expenses Covered + Honorarium',
    postedBy: {
      name: 'JIO Youth Alliance',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      org: 'JIO Organization'
    },
    location: 'Mumbai',
    description: 'We are looking for a young entrepreneur to deliver the opening address on integrating satvik ethical principles in modern tech startups at our yearly meet.',
    tags: ['Speaking', 'Ethics', 'Startups']
  }
];

export const OpportunitiesScreen: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'hiring' | 'work-wanted'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostDrawer, setShowPostDrawer] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'hiring' | 'work-wanted'>('hiring');
  const [role, setRole] = useState('');
  const [compensation, setCompensation] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !role || !location || !description) {
      alert('Please fill out the required fields.');
      return;
    }
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const newOpp: Opportunity = {
      id: 'opp_' + Date.now(),
      title,
      type,
      role,
      compensation: compensation || (type === 'hiring' ? 'Budget TBD' : 'Available'),
      postedBy: {
        name: 'You',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
      },
      location,
      description,
      tags
    };
    setOpportunities([newOpp, ...opportunities]);
    setShowPostDrawer(false);
    // Reset form fields
    setTitle('');
    setRole('');
    setCompensation('');
    setLocation('');
    setDescription('');
    setTagsStr('');
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesFilter = selectedFilter === 'All' || opp.type === selectedFilter;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', position: 'relative' }}>
      
      {/* Header Panel */}
      <div style={{ padding: 'var(--space-5) var(--space-5) var(--space-3) var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text variant="hero" style={{ fontWeight: 800 }}>Opportunities</Text>
          <Text variant="body" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>Connect, hire, and contribute.</Text>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowPostDrawer(true)} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
        >
          <Plus size={20} color="#FFFFFF" />
        </Button>
      </div>

      {/* Search Field */}
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
            placeholder="Search roles, skills, keywords..."
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

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          padding: '0 var(--space-5) var(--space-4) var(--space-5)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={() => setSelectedFilter('All')}
          style={{
            border: 'none',
            background: selectedFilter === 'All' ? 'var(--color-accent-gold)' : 'rgba(17, 17, 17, 0.03)',
            color: selectedFilter === 'All' ? '#FFFFFF' : 'var(--color-text-secondary)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            transition: 'all var(--duration-fast) ease',
          }}
        >
          All Gigs
        </button>
        <button
          onClick={() => setSelectedFilter('hiring')}
          style={{
            border: 'none',
            background: selectedFilter === 'hiring' ? 'var(--color-accent-gold)' : 'rgba(17, 17, 17, 0.03)',
            color: selectedFilter === 'hiring' ? '#FFFFFF' : 'var(--color-text-secondary)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            transition: 'all var(--duration-fast) ease',
          }}
        >
          Hiring Talents
        </button>
        <button
          onClick={() => setSelectedFilter('work-wanted')}
          style={{
            border: 'none',
            background: selectedFilter === 'work-wanted' ? 'var(--color-accent-gold)' : 'rgba(17, 17, 17, 0.03)',
            color: selectedFilter === 'work-wanted' ? '#FFFFFF' : 'var(--color-text-secondary)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            transition: 'all var(--duration-fast) ease',
          }}
        >
          Work Wanted
        </button>
      </div>

      {/* Opportunity Listings List */}
      <div style={{ padding: '0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredOpportunities.map((item) => (
          <Surface
            key={item.id}
            elevated
            padding="md"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(17, 17, 17, 0.04)',
              backgroundColor: 'var(--color-bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <img 
                  src={item.postedBy.photo} 
                  alt={item.postedBy.name} 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <Text variant="body" style={{ fontWeight: 700, fontSize: '14px' }}>
                    {item.postedBy.name}
                  </Text>
                  {item.postedBy.org && (
                    <Text variant="metadata" color="secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
                      {item.postedBy.org}
                    </Text>
                  )}
                </div>
              </div>

              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: item.type === 'hiring' ? '#B45309' : '#047857',
                backgroundColor: item.type === 'hiring' ? '#FEF3C7' : '#D1FAE5',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {item.type === 'hiring' ? 'Hiring' : 'Available'}
              </span>
            </div>

            {/* Title & description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Text variant="body" style={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.3 }}>
                {item.title}
              </Text>
              <Text variant="metadata" color="secondary" style={{ lineHeight: 1.4, marginTop: '2px' }}>
                {item.description}
              </Text>
            </div>

            {/* Compensation / Location */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: '2px', borderTop: '1px solid rgba(17,17,17,0.03)', paddingTop: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} color="var(--color-accent-gold)" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {item.compensation}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--color-text-secondary)" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {item.location}
                </span>
              </div>
            </div>

            {/* Skills tag chips */}
            {item.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17, 17, 17, 0.03)',
                      color: 'var(--color-text-secondary)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action connects */}
            <Button
              variant={item.type === 'hiring' ? 'primary' : 'secondary'}
              fullWidth
              style={{
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                marginTop: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => alert(`Connecting with ${item.postedBy.name} for role of ${item.role}`)}
            >
              <MessageCircle size={14} />
              <span>{item.type === 'hiring' ? 'Apply for Gig' : 'Contact Creator'}</span>
            </Button>

          </Surface>
        ))}

        {filteredOpportunities.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
            <span style={{ fontSize: '32px' }}>💼</span>
            <Text variant="h3" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              No opportunities listed
            </Text>
          </div>
        )}
      </div>

      {/* Elegant Add Listing drawer */}
      {showPostDrawer && (
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
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowPostDrawer(false)} />
          
          <form 
            onSubmit={handlePostSubmit}
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
              <Text variant="h3" style={{ fontWeight: 700 }}>Post Opportunity</Text>
              <button 
                type="button"
                onClick={() => setShowPostDrawer(false)}
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
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Type</Text>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setType('hiring')}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: 'var(--space-2) 0',
                    borderRadius: 'var(--radius-sm)',
                    background: type === 'hiring' ? 'var(--color-accent-gold)' : 'rgba(17,17,17,0.03)',
                    color: type === 'hiring' ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  We are Hiring
                </button>
                <button
                  type="button"
                  onClick={() => setType('work-wanted')}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: 'var(--space-2) 0',
                    borderRadius: 'var(--radius-sm)',
                    background: type === 'work-wanted' ? 'var(--color-accent-gold)' : 'rgba(17,17,17,0.03)',
                    color: type === 'work-wanted' ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Looking for Work
                </button>
              </div>
            </div>

            <div>
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Opportunity Title</Text>
              <input 
                type="text"
                placeholder="e.g. Logo Designer for Jain Patrika"
                value={title}
                onChange={e => setTitle(e.target.value)}
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
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Role Needed</Text>
              <input 
                type="text"
                placeholder="e.g. Graphic Designer"
                value={role}
                onChange={e => setRole(e.target.value)}
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
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Compensation / Budget</Text>
              <input 
                type="text"
                placeholder="e.g. Paid Gig • ₹10,000 or Volunteer Role"
                value={compensation}
                onChange={e => setCompensation(e.target.value)}
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
                placeholder="e.g. Remote or Mumbai, India"
                value={location}
                onChange={e => setLocation(e.target.value)}
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
              <Text variant="metadata" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Tags (comma separated)</Text>
              <input 
                type="text"
                placeholder="Figma, UI, Branding"
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
              Post to Board
            </Button>
          </form>
        </div>
      )}

    </div>
  );
};
export default OpportunitiesScreen;
