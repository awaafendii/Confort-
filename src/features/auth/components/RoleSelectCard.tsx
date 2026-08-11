import React from 'react';
import { cn } from '@/lib/utils';

export interface RoleSelectCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected?: boolean;
  onClick: () => void;
  accent?: 'primary' | 'secondary';
}

export const RoleSelectCard: React.FC<RoleSelectCardProps> = ({ icon, label, description, selected, onClick, accent = 'primary' }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all',
      selected
        ? accent === 'primary'
          ? 'border-primary-700 bg-primary-50'
          : 'border-secondary-700 bg-secondary-50'
        : 'border-border bg-background hover:border-primary-200'
    )}
  >
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
        selected
          ? accent === 'primary'
            ? 'bg-primary-800 text-white'
            : 'bg-secondary-800 text-white'
          : 'bg-surface text-muted-foreground'
      )}
    >
      {icon}
    </div>
    <div>
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  </button>
);
