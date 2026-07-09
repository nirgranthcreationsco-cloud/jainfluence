import React from 'react';

type AspectRatio = '1:1' | '4:5' | '16:9' | 'auto';

interface MediaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  ratio?: AspectRatio;
  rounded?: boolean;
  edgeToEdge?: boolean;
}

export const Media: React.FC<MediaProps> = ({
  ratio = 'auto',
  rounded = false,
  edgeToEdge = false,
  style,
  ...props
}) => {
  const getRatioString = () => {
    switch (ratio) {
      case '1:1': return '1 / 1';
      case '4:5': return '4 / 5';
      case '16:9': return '16 / 9';
      case 'auto':
      default: return 'auto';
    }
  };

  return (
    <div
      style={{
        aspectRatio: getRatioString(),
        overflow: 'hidden',
        borderRadius: rounded && !edgeToEdge ? 'var(--radius-lg)' : 'var(--radius-none)',
        backgroundColor: 'var(--color-bg-surface)', // Skeleton color
        marginLeft: edgeToEdge ? 'calc(-1 * var(--space-4))' : '0',
        marginRight: edgeToEdge ? 'calc(-1 * var(--space-4))' : '0',
        width: edgeToEdge ? 'calc(100% + var(--space-8))' : '100%',
      }}
    >
      <img
        {...props}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...style
        }}
      />
    </div>
  );
};
