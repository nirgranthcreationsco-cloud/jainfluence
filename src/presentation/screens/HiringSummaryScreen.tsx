import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposalStore } from '../store/proposalStore';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Trash2, CheckCircle2 } from 'lucide-react';

export const HiringSummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { hiringSelections, removeFromHiringList, confirmHiring } = useProposalStore();

  const parsePrice = (priceStr: string): number => {
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const total = hiringSelections.reduce((sum, s) => sum + parsePrice(s.agreedPrice), 0);
  const isConfirmed = hiringSelections.every(s => s.status === 'confirmed');

  const handleConfirm = async () => {
    const uniqueOpps = [...new Set(hiringSelections.map(s => s.opportunityId))];
    for (const oppId of uniqueOpps) {
      await confirmHiring(oppId);
    }
  };

  return (
    <div className="page-fade-in" style={{ paddingBottom: '120px', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 20px', position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(17,17,17,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(17,17,17,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color="#555555" />
          </button>
          <div>
            <Text variant="h1" style={{ fontWeight: 800, fontSize: '22px' }}>Hiring Summary</Text>
            <Text variant="metadata" style={{ color: '#737373', fontSize: '12px' }}>
              {hiringSelections.length} creator{hiringSelections.length !== 1 ? 's' : ''} selected
            </Text>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {hiringSelections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px' }}>🛒</div>
            <Text variant="body" style={{ fontWeight: 700, color: '#555555' }}>No creators selected yet</Text>
            <Text variant="metadata" style={{ color: '#A3A3A3', lineHeight: 1.6, maxWidth: '240px' }}>
              Accept proposals from the Notifications screen to build your hiring list.
            </Text>
            <Button variant="secondary" onClick={() => navigate('/notifications')} style={{ marginTop: '8px', borderRadius: '12px' }}>
              View Proposals
            </Button>
          </div>
        ) : (
          <>
            {/* Selected Creators */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              Selected Creators
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {hiringSelections.map(selection => (
                <div
                  key={selection.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    padding: '16px',
                    border: selection.status === 'confirmed' ? '1.5px solid rgba(5,150,105,0.3)' : '1px solid rgba(17,17,17,0.06)',
                    boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    animation: 'pageFadeIn 0.3s ease both',
                  }}
                >
                  {/* Photo */}
                  <img
                    src={selection.creatorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selection.creatorName)}&background=D4AF37&color=fff&size=80`}
                    alt={selection.creatorName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Text variant="body" style={{ fontWeight: 700, fontSize: '15px' }}>{selection.creatorName}</Text>
                      {selection.status === 'confirmed' && <CheckCircle2 size={14} color="#059669" />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#737373', fontFamily: 'var(--font-family)', marginTop: '2px' }}>
                      {selection.status === 'confirmed' ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>✓ Confirmed</span>
                      ) : 'Pending confirmation'}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#D4AF37' }}>₹{selection.agreedPrice}</div>
                    <div style={{ fontSize: '10px', color: '#A3A3A3', fontFamily: 'var(--font-family)', marginTop: '2px' }}>agreed</div>
                  </div>

                  {/* Remove */}
                  {selection.status !== 'confirmed' && (
                    <button
                      onClick={() => removeFromHiringList(selection.id)}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(220,38,38,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Trash2 size={14} color="#DC2626" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Summary Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 8px 24px -8px rgba(212,175,55,0.15)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <Text variant="metadata" style={{ color: '#737373', fontSize: '12px' }}>Creators</Text>
                <Text variant="metadata" style={{ color: '#737373', fontSize: '12px' }}>{hiringSelections.length}</Text>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(17,17,17,0.05)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="body" style={{ fontWeight: 800, fontSize: '16px' }}>Total Cost</Text>
                <Text variant="body" style={{ fontWeight: 800, fontSize: '22px', color: '#D4AF37' }}>₹{total.toLocaleString('en-IN')}</Text>
              </div>
              <div style={{ fontSize: '11px', color: '#A3A3A3', marginTop: '6px', fontFamily: 'var(--font-family)' }}>
                * Payment gateway coming soon. This is a hiring intent confirmation only.
              </div>
            </div>

            {/* Confirm Button */}
            {!isConfirmed ? (
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirm}
                style={{ height: '54px', borderRadius: '16px', fontSize: '16px' }}
              >
                ✓ Confirm Hiring ({hiringSelections.length} creator{hiringSelections.length !== 1 ? 's' : ''})
              </Button>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(5,150,105,0.06)', borderRadius: '16px', border: '1px solid rgba(5,150,105,0.2)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
                <Text variant="body" style={{ fontWeight: 700, color: '#059669' }}>Hiring Confirmed!</Text>
                <Text variant="metadata" style={{ color: '#737373', marginTop: '4px', fontSize: '12px' }}>
                  The selected creators have been notified. Payment and contract features coming soon.
                </Text>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
