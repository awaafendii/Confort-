import React from 'react';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  text: string;
  time: string;
  mine: boolean;
  className?: string;
}

/** Bulle de message de la messagerie course (ChatPage) — passager et chauffeur partagent le même rendu. */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ text, time, mine, className }) => (
  <div className={cn('flex', mine ? 'justify-end' : 'justify-start', className)}>
    <div className={cn('max-w-[75%] rounded-lg px-4 py-2.5', mine ? 'bg-primary-800 text-white' : 'bg-surface text-foreground')}>
      <p className="text-body-sm">{text}</p>
      <p className={cn('mt-1 text-caption', mine ? 'text-primary-100' : 'text-muted-foreground')}>{time}</p>
    </div>
  </div>
);
