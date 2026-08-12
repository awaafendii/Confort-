import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inverse';
  showWordmark?: boolean;
  className?: string;
}

const MARK_SIZE: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

/** Remplace le "C+" recodé en dur dans au moins 3 fichiers (WelcomePage, AuthLayout, StyleGuidePage). */
export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'default', showWordmark = true, className }) => (
  <div className={cn('flex items-center gap-2.5', className)}>
    <div
      className={cn(
        'flex items-center justify-center rounded-md font-display font-extrabold',
        MARK_SIZE[size],
        variant === 'inverse' ? 'bg-white text-primary-800' : 'bg-primary-800 text-white'
      )}
    >
      C+
    </div>
    {showWordmark && (
      <span
        className={cn(
          'font-display text-lg font-extrabold tracking-tight',
          variant === 'inverse' ? 'text-white' : 'text-foreground'
        )}
      >
        Confort<span className={variant === 'inverse' ? 'text-accent-300' : 'text-accent-600'}>+</span>
      </span>
    )}
  </div>
);
