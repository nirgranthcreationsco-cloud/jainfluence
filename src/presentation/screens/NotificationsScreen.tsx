import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useProposalStore } from '../store/proposalStore';
import { Text } from '../components/ui/Text';
import type { NotificationModel } from '../../data/types';
import { Check, X, ChevronRight, ShoppingCart } from 'lucide-react';

type Tab = 'activity' | 'marketplace';

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  like: { icon: '❤️', label: 'liked your post' },
  follow: { icon: '👤', label: 'started following you' },
  comment: { icon: '💬', label: 'commented on your post' },
  proposal_received: { icon: '📩', label: 'sent you a proposal' },
  proposal_accepted: { icon: '✅', label: 'Your proposal was accepted!' },
  proposal_rejected: { icon: '✗', label: 'Proposal not selected' },
  hiring_confirmed: { icon: '🏆', label: 'Hiring confirmed!' },
};

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchNotifications, markAllRead, activityNotifications, marketplaceNotifications, unreadCount, isLoading } = useNotificationStore();
  const { proposals, fetchProposalsForOpportunity, acceptProposal, rejectProposal } = useProposalStore();
  const [activeTab, setActiveTab] = useState<Tab>('marketplace');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchNotifications(user.uid);
    markAllRead(user.uid);
  }, [user?.uid]);

  const activityList = activityNotifications();
  const marketplaceList = marketplaceNotifications();

  const formatTime = (ts: string) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  const renderNotificationCard = (notif: NotificationModel) => {
    const meta = TYPE_LABELS[notif.type] ?? { icon: '🔔', label: notif.message };
    const isProposalReceived = notif.type === 'proposal_received';

    return (
      <div key={notif.id} style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '16px',
        marginBottom: '10px',
        border: `1px solid ${notif.read ? 'rgba(17,17,17,0.05)' : 'rgba(212,175,55,0.25)'}`,
        boxShadow: notif.read ? 'none' : '0 4px 16px -4px rgba(212,175,55,0.12)',
        animation: 'pageFadeIn 0.3s ease both',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* Avatar / Icon */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {notif.senderPhoto ? (
              <img src={notif.senderPhoto} alt={notif.senderName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {meta.icon}
              </div>
            )}
            {!notif.read && (
              <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D4AF37', border: '2px solid white' }} />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: notif.senderName ? 700 : 600, color: '#111111', fontFamily: 'var(--font-family)', lineHeight: 1.4 }}>
              {notif.senderName && <span>{notif.senderName} </span>}
              <span style={{ fontWeight: 400, color: '#555555' }}>{meta.label}</span>
            </div>

            <div style={{ fontSize: '12px', color: '#A3A3A3', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
              {formatTime(notif.createdAt)}
            </div>

            {/* For proposal_received: show proposal details inline */}
            {isProposalReceived && (
              <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: 'rgba(17,17,17,0.02)', borderRadius: '10px', border: '1px solid rgba(17,17,17,0.04)' }}>
                <div style={{ fontSize: '13px', color: '#555555', fontFamily: 'var(--font-family)', lineHeight: 1.5 }}>
                  {notif.message}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for proposal_received */}
        {isProposalReceived && notif.referenceId && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={() => navigate(`/profile/${notif.senderId}`)}
              style={{ flex: 1, height: '36px', borderRadius: '10px', border: '1px solid rgba(17,17,17,0.1)', backgroundColor: 'transparent', color: '#555555', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ChevronRight size={13} /> View Profile
            </button>
            <button
              onClick={async () => {
                // Load proposals for this opportunity then accept the matching one
                await fetchProposalsForOpportunity(notif.referenceId!);
                const matching = proposals.find(p => p.applicantId === notif.senderId && p.opportunityId === notif.referenceId);
                if (matching && user) {
                  await acceptProposal(matching, user.uid);
                  navigate('/hiring-summary');
                }
              }}
              style={{ flex: 1, height: '36px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(5,150,105,0.1)', color: '#059669', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Check size={13} /> Accept
            </button>
            <button
              onClick={async () => {
                await fetchProposalsForOpportunity(notif.referenceId!);
                const matching = proposals.find(p => p.applicantId === notif.senderId && p.opportunityId === notif.referenceId);
                if (matching) await rejectProposal(matching.id);
              }}
              style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(220,38,38,0.08)', color: '#DC2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-fade-in" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 0', position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Text variant="h1" style={{ fontWeight: 800 }}>Notifications</Text>
          {unreadCount > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.12)', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(212,175,55,0.25)' }}>
              {unreadCount} new
            </span>
          )}
        </div>

        {/* Segmented Control */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(17,17,17,0.05)', borderRadius: '12px', padding: '3px', marginBottom: '20px' }}>
          {(['activity', 'marketplace'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, height: '36px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                color: activeTab === tab ? '#111111' : '#737373',
                fontSize: '13px', fontWeight: activeTab === tab ? 700 : 500,
                fontFamily: 'var(--font-family)',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              {tab === 'marketplace' && <span>💼</span>}
              {tab === 'activity' && <span>❤️</span>}
              {tab === 'marketplace' ? 'Marketplace' : 'Activity'}
              {tab === 'marketplace' && marketplaceList.filter(n => !n.read).length > 0 && (
                <span style={{ backgroundColor: '#D4AF37', color: '#fff', fontSize: '10px', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {marketplaceList.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: '80px', borderRadius: '18px' }} />)}
          </div>
        )}

        {!isLoading && activeTab === 'activity' && (
          activityList.length === 0 ? (
            <EmptyState icon="❤️" title="No activity yet" subtitle="Likes, follows, and comments will appear here." />
          ) : activityList.map(renderNotificationCard)
        )}

        {!isLoading && activeTab === 'marketplace' && (
          marketplaceList.length === 0 ? (
            <EmptyState icon="📬" title="No marketplace activity" subtitle="Proposals received, accepted, and hiring updates appear here." />
          ) : marketplaceList.map(renderNotificationCard)
        )}

        {/* Hiring Summary shortcut */}
        <div
          onClick={() => navigate('/hiring-summary')}
          style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 4px 16px -4px rgba(212,175,55,0.1)' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={18} color="#D4AF37" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111111', fontFamily: 'var(--font-family)' }}>Hiring Summary</div>
            <div style={{ fontSize: '12px', color: '#737373', fontFamily: 'var(--font-family)' }}>View accepted creators & confirm hiring</div>
          </div>
          <ChevronRight size={18} color="#A3A3A3" />
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ icon: string; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div style={{ textAlign: 'center', padding: '56px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
    <div style={{ fontSize: '40px' }}>{icon}</div>
    <Text variant="body" style={{ fontWeight: 700, color: '#555555' }}>{title}</Text>
    <Text variant="metadata" style={{ color: '#A3A3A3', lineHeight: 1.6, maxWidth: '240px' }}>{subtitle}</Text>
  </div>
);
