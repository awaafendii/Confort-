import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Send } from 'lucide-react';
import { Avatar, BackButton, EmptyState, IconButton } from '@/components/ui';
import { ConversationCard, MessageBubble } from '@/components/business';
import { useAuthStore } from '@/features/auth/store';
import { useChatStore } from '@/features/chat/chatStore';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/format';
import type { ChatMessage } from '@/types';

interface ChatState {
  rideId?: string;
  myRole?: 'PASSENGER' | 'DRIVER';
  otherName?: string;
  otherAvatar?: string;
  otherPhone?: string;
}

const QUICK_REPLIES = ['Je suis là', 'Où êtes-vous ?', 'Je serai là dans 2 minutes'];

const CANNED_REPLIES = [
  "D'accord, merci !",
  'Bien reçu 👍',
  'Pas de souci, à tout de suite.',
  "J'arrive dans quelques minutes.",
];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Générique — réutilisée par les espaces passager et chauffeur (conversation liée à la course en cours). */
export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { rideId, myRole, otherName, otherAvatar, otherPhone } = (location.state as ChatState | null) ?? {};
  const account = useAuthStore((s) => s.account);
  const messagesByRide = useChatStore((s) => s.messagesByRide);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isListMode = !rideId;

  useEffect(() => {
    if (!account) navigate(-1);
    // Sans état de course, seul le passager a un historique de conversations à lister
    // (voir la liste ci-dessous, dérivée par driverId — le chauffeur n'a pas d'équivalent).
    else if (isListMode && account.role !== 'PASSENGER') navigate(-1);
    return () => clearTimeout(replyTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = rideId ? (messagesByRide[rideId] ?? []) : [];
  const lastMessage = messages[messages.length - 1];

  const conversations = useMemo(() => {
    if (!isListMode) return [];
    return Object.entries(messagesByRide)
      .map(([driverId, msgs]) => {
        const driver = MOCK_DRIVERS_POOL.find((d) => d.id === driverId);
        const last = msgs[msgs.length - 1];
        return driver && last ? { driver, last } : null;
      })
      .filter((c): c is { driver: (typeof MOCK_DRIVERS_POOL)[number]; last: ChatMessage } => !!c)
      .sort((a, b) => new Date(b.last.createdAt).getTime() - new Date(a.last.createdAt).getTime());
  }, [isListMode, messagesByRide]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!account || (isListMode && account.role !== 'PASSENGER')) return null;

  if (isListMode) {
    return (
      <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
        <BackButton className="mb-2" label="Retour" />
        <h1 className="font-display text-h2 text-foreground">Messages</h1>

        {conversations.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-7 w-7" />}
            title="Aucune conversation"
            description="Vos échanges avec vos chauffeurs apparaîtront ici pendant vos courses."
            className="mt-6"
          />
        ) : (
          <div className="mt-6 space-y-2.5">
            {conversations.map(({ driver, last }) => (
              <ConversationCard
                key={driver.id}
                name={driver.name}
                avatar={driver.avatar}
                lastMessage={last.text}
                time={formatRelativeTime(last.createdAt)}
                onClick={() =>
                  navigate('/passenger/chat', {
                    state: { rideId: driver.id, myRole: 'PASSENGER', otherName: driver.name, otherAvatar: driver.avatar, otherPhone: driver.phone },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!rideId || !myRole) return null;

  const otherRole = myRole === 'PASSENGER' ? 'DRIVER' : 'PASSENGER';

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(rideId, { rideId, senderId: account.id, senderRole: myRole, text: trimmed });
    setDraft('');
    replyTimeout.current = setTimeout(() => {
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      sendMessage(rideId, { rideId, senderId: 'other-party', senderRole: otherRole, text: reply });
    }, 1200 + Math.random() * 900);
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background lg:max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <IconButton icon={<ArrowLeft className="h-5 w-5" />} aria-label="Retour" onClick={() => navigate(-1)} />
        <Avatar name={otherName ?? '?'} src={otherAvatar} size="sm" />
        <p className="flex-1 truncate text-body font-semibold text-foreground">{otherName}</p>
        {otherPhone && (
          <a
            href={`tel:${otherPhone}`}
            aria-label="Appeler"
            className="tap-target flex items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="h-5 w-5" />
          </a>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {lastMessage ? `${lastMessage.senderRole === myRole ? 'Vous' : otherName ?? 'Interlocuteur'} : ${lastMessage.text}` : ''}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-7 w-7" />}
            title="Aucun message"
            description={`Démarrez la conversation avec ${otherName ?? 'votre interlocuteur'}.`}
            className="mt-8"
          />
        ) : (
          messages.map((m: ChatMessage) => (
            <MessageBubble key={m.id} text={m.text} time={formatTime(m.createdAt)} mine={m.senderRole === myRole} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="shrink-0 whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5 text-caption font-medium text-foreground transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrire un message..."
            aria-label="Votre message"
            className={cn(
              'h-11 flex-1 rounded-full border border-input bg-background px-4 text-body-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground',
              'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          />
          <IconButton type="submit" icon={<Send className="h-4 w-4" />} aria-label="Envoyer" variant="primary" disabled={!draft.trim()} />
        </form>
      </div>
    </div>
  );
}
