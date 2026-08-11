import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-3.5 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-surface',
      danger && 'hover:bg-danger/5'
    )}
  >
    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', danger ? 'bg-danger/10 text-danger' : 'bg-surface text-muted-foreground')}>
      {icon}
    </div>
    <span className={cn('flex-1 text-[15px] font-medium', danger ? 'text-danger' : 'text-foreground')}>{label}</span>
    {!danger && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
  </button>
);
