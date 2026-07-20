import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProposalStore } from '../store/proposalStore';
import { Button } from './ui/Button';

interface SendProposalModalProps {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
}

export const SendProposalModal: React.FC<SendProposalModalProps> = ({
  opportunityId,
  opportunityTitle,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { submitProposal } = useProposalStore();

  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(user?.instagramUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!offerPrice.trim() || !message.trim() || !estimatedDelivery.trim()) {
      setError('Please fill in Offer Price, Message, and Estimated Delivery.');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    const ok = await submitProposal({
      opportunityId,
      applicantId: user.uid,
      applicantName: user.name,
      applicantPhoto: user.profilePhoto,
      creatorCategories: user.creatorCategories ?? [],
      offerPrice: offerPrice.trim(),
      message: message.trim(),
      estimatedDelivery: estimatedDelivery.trim(),
      portfolioUrl: portfolioUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
    });

    setIsSubmitting(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => onClose(), 1800);
    } else {
      setError('Failed to send proposal. Please try again.');
    }
  };

  const inputStyle = (): React.CSSProperties => ({
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '15px',
    fontFamily: 'var(--font-family)',
    color: '#111111',
    padding: 0,
  });

  const fieldWrapStyle = (field: string): React.CSSProperties => ({
    borderBottom: `1.5px solid ${focusedField === field ? '#D4AF37' : 'rgba(17,17,17,0.1)'}`,
    paddingBottom: '10px',
    marginBottom: '20px',
    transition: 'border-color 0.15s ease',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: '#A3A3A3',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '6px',
    display: 'block',
    fontFamily: 'var(--font-family)',
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8000,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'pageFadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '28px 28px 0 0',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0 0 40px 0',
          boxShadow: '0 -16px 48px -8px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.35s cubic-bezier(0.2,0.8,0.2,1) both',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '999px', backgroundColor: 'rgba(17,17,17,0.12)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 24px 0' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Send Proposal
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111111', fontFamily: 'var(--font-family)', lineHeight: 1.3, maxWidth: '260px' }}>
              {opportunityTitle}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: 'none', backgroundColor: 'rgba(17,17,17,0.06)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#737373', flexShrink: 0,
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pop-in 0.35s var(--spring-bouncy) both' }}>
              <span style={{ fontSize: '28px' }}>✓</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111111' }}>Proposal Sent!</div>
            <div style={{ fontSize: '14px', color: '#737373' }}>The opportunity owner will review your proposal shortly.</div>
          </div>
        ) : (
          <div style={{ padding: '24px 24px 0' }}>
            {/* Offer Price */}
            <label style={labelStyle}>Offer Price</label>
            <div style={fieldWrapStyle('price')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', color: '#737373', fontWeight: 600, fontFamily: 'var(--font-family)' }}>₹</span>
                <input
                  style={inputStyle()}
                  placeholder="e.g. 5000"
                  value={offerPrice}
                  onChange={e => setOfferPrice(e.target.value)}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                  type="text"
                />
              </div>
            </div>

            {/* Message */}
            <label style={labelStyle}>Message</label>
            <div style={{ ...fieldWrapStyle('message'), borderBottom: `1.5px solid ${focusedField === 'message' ? '#D4AF37' : 'rgba(17,17,17,0.1)'}` }}>
              <textarea
                style={{
                  ...inputStyle(),
                  resize: 'none',
                  minHeight: '80px',
                  lineHeight: 1.6,
                }}
                placeholder="Introduce yourself and explain why you're the right fit..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Estimated Delivery */}
            <label style={labelStyle}>Estimated Delivery</label>
            <div style={fieldWrapStyle('delivery')}>
              <input
                style={inputStyle()}
                placeholder="e.g. 7 days, 2 weeks..."
                value={estimatedDelivery}
                onChange={e => setEstimatedDelivery(e.target.value)}
                onFocus={() => setFocusedField('delivery')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Portfolio */}
            <label style={labelStyle}>Portfolio URL <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '10px' }}>(optional)</span></label>
            <div style={fieldWrapStyle('portfolio')}>
              <input
                style={inputStyle()}
                placeholder="https://yourportfolio.com"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                onFocus={() => setFocusedField('portfolio')}
                onBlur={() => setFocusedField(null)}
                type="url"
              />
            </div>

            {/* Instagram */}
            <label style={labelStyle}>Instagram Profile <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '10px' }}>(auto-filled)</span></label>
            <div style={{ ...fieldWrapStyle('instagram'), marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#A3A3A3', fontFamily: 'var(--font-family)' }}>instagram.com/</span>
                <input
                  style={inputStyle()}
                  placeholder="yourhandle"
                  value={instagramUrl.replace(/^https?:\/\/instagram\.com\//i, '').replace(/^@/, '')}
                  onChange={e => setInstagramUrl(`https://instagram.com/${e.target.value.replace(/^@/, '')}`)}
                  onFocus={() => setFocusedField('instagram')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 14px', backgroundColor: 'rgba(255,59,48,0.06)', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.12)', color: '#FF3B30', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-family)' }}>
                {error}
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ height: '52px', borderRadius: '14px', fontSize: '15px' }}
            >
              {isSubmitting ? 'Sending…' : (
                <><Send size={16} /> Submit Proposal</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
