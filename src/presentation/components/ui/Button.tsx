import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--color-bg-surface)',
          color: 'var(--color-text-primary)',
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 'var(--radius-sm)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-sm)',
        };
      case 'icon':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary)',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-full)',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-accent-primary)',
          color: '#FFFFFF',
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 'var(--radius-sm)',
        };
    }
  };

  return (
    <button
      {...props}
      style={{
        border: 'none',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontWeight: variant === 'icon' ? 400 : 700,
        fontSize: 'var(--text-base)',
        width: fullWidth ? '100%' : 'auto',
        opacity: props.disabled ? 0.5 : 1,
        transition: 'transform var(--duration-fast) var(--spring-bouncy), opacity var(--duration-fast)',
        ...getVariantStyles(),
        ...style
      }}
      onPointerDown={(e) => {
        if (!props.disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onPointerUp={(e) => {
        if (!props.disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
      onPointerLeave={(e) => {
        if (!props.disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
};
