import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Send } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useChatStore } from '@/features/chat/chatStore';
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

  useEffect(() => {
    if (!rideId || !myRole || !account) navigate(-1);
    return () => clearTimeout(replyTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = rideId ? (messagesByRide[rideId] ?? []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!rideId || !myRole || !account) return null;

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
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={otherName ?? '?'} src={otherAvatar} size="sm" />
        <p className="flex-1 truncate text-sm font-semibold text-foreground">{otherName}</p>
        {otherPhone && (
          <a
            href={`tel:${otherPhone}`}
            aria-label="Appeler"
            className="tap-target flex items-center justify-center rounded-full text-primary-700 hover:bg-primary-50"
          >
            <Phone className="h-5 w-5" />
          </a>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Démarrez la conversation avec {otherName ?? 'votre interlocuteur'}.
          </p>
        )}
        {messages.map((m: ChatMessage) => {
          const mine = m.senderRole === myRole;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-primary-800 text-white' : 'bg-surface text-foreground'}`}>
                <p className="text-sm">{m.text}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-primary-100' : 'text-muted-foreground'}`}>{formatTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-primary-300"
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
            className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Envoyer"
            className="tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-800 text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
