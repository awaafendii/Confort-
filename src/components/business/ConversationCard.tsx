import React from 'react';
import { Avatar, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ConversationCardProps {
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  onClick: () => void;
  className?: string;
}

/** Ligne de la liste des conversations (ChatPage sans contexte de course). */
export const ConversationCard: React.FC<ConversationCardProps> = ({ name, avatar, lastMessage, time, onClick, className }) => (
  <Card interactive onClick={onClick} className={cn('flex items-center gap-3.5', className)}>
    <Avatar name={name} src={avatar} />
    <span className="min-w-0 flex-1">
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-body font-semibold text-foreground">{name}</span>
        <span className="shrink-0 text-caption text-muted-foreground">{time}</span>
      </span>
      <span className="block truncate text-body-sm text-muted-foreground">{lastMessage}</span>
    </span>
  </Card>
);
