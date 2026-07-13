import React from 'react';

interface FeedSkeletonProps {
  count?: number;
}

const SkeletonCard: React.FC = () => (
  <div
    style={{
      backgroundColor: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(17,17,17,0.04)',
      overflow: 'hidden',
    }}
  >
    {/* Author header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 12px 16px' }}>
      <div className="shimmer" style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="shimmer" style={{ width: '40%', height: '13px', borderRadius: '6px' }} />
        <div className="shimmer" style={{ width: '60%', height: '11px', borderRadius: '6px' }} />
      </div>
    </div>

    {/* Image block */}
    <div className="shimmer" style={{ width: '100%', aspectRatio: '4/3' }} />

    {/* Caption lines */}
    <div style={{ padding: '12px 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="shimmer" style={{ width: '90%', height: '13px', borderRadius: '6px' }} />
      <div className="shimmer" style={{ width: '65%', height: '13px', borderRadius: '6px' }} />
    </div>

    {/* Reaction row */}
    <div style={{ display: 'flex', gap: '8px', padding: '8px 16px 16px 16px' }}>
      <div className="shimmer" style={{ width: '64px', height: '30px', borderRadius: '999px' }} />
      <div className="shimmer" style={{ width: '100px', height: '30px', borderRadius: '999px' }} />
    </div>
  </div>
);

export const FeedSkeleton: React.FC<FeedSkeletonProps> = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
