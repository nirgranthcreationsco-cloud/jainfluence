import React from 'react';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  elevated = false,
  padding = 'md',
  fullWidth = false,
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return 'var(--space-2) var(--space-3)';
      case 'lg': return 'var(--space-6) var(--space-8)';
      case 'md':
      default: return 'var(--space-4) var(--space-5)';
    }
  };

  return (
    <div
      {...props}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        padding: getPadding(),
        width: fullWidth ? '100%' : 'auto',
        boxShadow: elevated ? 'var(--shadow-subtle)' : 'var(--shadow-none)',
        borderRadius: elevated ? 'var(--radius-md)' : 'var(--radius-none)',
        border: elevated ? '1px solid #F5F5F5' : 'none',
        borderBottom: elevated ? 'none' : '1px solid var(--color-border-light)',
        ...style
      }}
    >
      {children}
    </div>
  );
};
