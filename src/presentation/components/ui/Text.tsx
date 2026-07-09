import React from 'react';

type TextVariant = 'super-hero' | 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'metadata';
type TextColor = 'primary' | 'secondary' | 'accent' | 'error' | 'inverse';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export const Text: React.FC<TextProps> = ({ 
  children, 
  variant = 'body', 
  color = 'primary',
  align = 'left',
  style,
  className,
  onClick
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'super-hero':
        return { fontSize: 'var(--text-super-hero)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1 };
      case 'hero':
        return { fontSize: 'var(--text-hero)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15 };
      case 'h1':
        return { fontSize: 'var(--text-xxl)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2 };
      case 'h2':
        return { fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.25 };
      case 'h3':
        return { fontSize: 'var(--text-lg)', fontWeight: 600, letterSpacing: '-0.2px', lineHeight: 1.3 };
      case 'metadata':
        return { fontSize: 'var(--text-sm)', fontWeight: 400, letterSpacing: '0px', lineHeight: 1.4 };
      case 'body':
      default:
        return { fontSize: 'var(--text-base)', fontWeight: 400, letterSpacing: '0px', lineHeight: 1.5 };
    }
  };

  const getColorStyles = (): string => {
    switch (color) {
      case 'secondary': return 'var(--color-text-secondary)';
      case 'accent': return 'var(--color-accent-primary)';
      case 'error': return 'var(--color-error)';
      case 'inverse': return '#FFFFFF';
      case 'primary':
      default: return 'var(--color-text-primary)';
    }
  };

  return (
    <span 
      onClick={onClick}
      className={className}
      style={{
        ...getVariantStyles(),
        color: getColorStyles(),
        textAlign: align,
        display: 'block',
        cursor: onClick ? 'pointer' : 'inherit',
        ...style
      }}
    >
      {children}
    </span>
  );
};
