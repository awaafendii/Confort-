import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline';
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', status, className }) => (
  <div className={cn('relative inline-flex shrink-0', className)}>
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-800',
        sizeClasses[size]
      )}
    >
      {src ? (
        <img src={src} alt={name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
    {status && (
      <span
        aria-label={status === 'online' ? 'En ligne' : 'Hors ligne'}
        className={cn(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
          status === 'online' ? 'bg-secondary-600' : 'bg-muted-foreground'
        )}
      />
    )}
  </div>
);
