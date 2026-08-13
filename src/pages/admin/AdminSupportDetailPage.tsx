import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Inbox, UserCog } from 'lucide-react';
import { Badge, BackButton, Button, Card, EmptyState, StatusBadge, Textarea } from '@/components/ui';
import { MessageBubble } from '@/components/business';
import { TICKET_CATEGORY_LABEL, TICKET_PRIORITY_CONFIG, TICKET_STATUS_CONFIG } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import { useAuthStore } from '@/features/auth/store';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { formatRelativeTime } from '@/utils/format';
import type { TicketStatus } from '@/types';

const ACTOR_NAME: Record<string, string> = {
  'demo-admin': 'Admin Confort+',
  'demo-super-admin': 'Founé Camara',
};

const STATUS_ACTIONS: { status: TicketStatus; label: string }[] = [
  { status: 'IN_PROGRESS', label: 'Prendre en charge' },
  { status: 'WAITING', label: "Mettre en attente" },
  { status: 'RESOLVED', label: 'Résoudre' },
  { status: 'CLOSED', label: 'Fermer' },
  { status: 'NEW', label: 'Rouvrir' },
];

function userNameFor(id: string, drivers: { id: string; name: string }[]): string {
  return MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ?? drivers.find((d) => d.id === id)?.name ?? id;
}

export default function AdminSupportDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const tickets = useAdminStore((s) => s.tickets);
  const drivers = useAdminStore((s) => s.drivers);
  const ticketMessages = useAdminStore((s) => s.ticketMessages);
  const auditLog = useAdminStore((s) => s.auditLog);
  const setTicketStatus = useAdminStore((s) => s.setTicketStatus);
  const assignTicket = useAdminStore((s) => s.assignTicket);
  const addTicketMessage = useAdminStore((s) => s.addTicketMessage);

  const [reply, setReply] = useState('');

  const ticket = tickets.find((t) => t.id === ticketId);

  if (!ticket) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-10 pt-8 lg:px-8">
        <BackButton className="mb-2" to="/admin/support" />
        <EmptyState icon={<Inbox className="h-7 w-7" />} title="Ticket introuvable" description="Ce ticket n'existe pas ou plus." className="mt-6" />
      </div>
    );
  }

  const ride = ticket.rideId ? MOCK_PLATFORM_RIDES.find((r) => r.id === ticket.rideId) : undefined;
  const messages = ticketMessages.filter((m) => m.ticketId === ticket.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const history = auditLog.filter((entry) => entry.target === ticket.subject);
  const userName = userNameFor(ticket.userId, drivers);

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    addTicketMessage(ticket.id, reply.trim());
    setReply('');
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-8 lg:px-8">
      <BackButton className="mb-2" to="/admin/support" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-h2 text-foreground">{ticket.subject}</h1>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusBadge status={ticket.status} config={TICKET_STATUS_CONFIG} />
        <Badge variant={TICKET_PRIORITY_CONFIG[ticket.priority].variant}>{TICKET_PRIORITY_CONFIG[ticket.priority].label}</Badge>
        <Badge variant="neutral">{TICKET_CATEGORY_LABEL[ticket.category]}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="mb-1 text-caption text-muted-foreground">Utilisateur</p>
          <button onClick={() => navigate(`/admin/users?q=${encodeURIComponent(userName)}`)} className="text-body font-semibold text-foreground hover:underline">
            {userName}
          </button>
        </Card>
        <Card>
          <p className="mb-1 text-caption text-muted-foreground">Course associée</p>
          {ride ? (
            <button onClick={() => navigate(`/admin/rides/${ride.id}`)} className="text-body font-semibold text-foreground hover:underline">
              {ride.pickup.label} → {ride.destination.label}
            </button>
          ) : (
            <p className="text-body font-semibold text-muted-foreground">Aucune</p>
          )}
        </Card>
      </div>

      <Card className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <UserCog className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-caption text-muted-foreground">Assigné à</p>
            <p className="text-body-sm font-semibold text-foreground">{ticket.assignedTo ? (ACTOR_NAME[ticket.assignedTo] ?? ticket.assignedTo) : 'Non assigné'}</p>
          </div>
        </div>
        {ticket.assignedTo !== account?.id && (
          <Button variant="outline" size="sm" onClick={() => assignTicket(ticket.id)}>
            S'assigner
          </Button>
        )}
      </Card>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_ACTIONS.filter((a) => a.status !== ticket.status).map((a) => (
          <Button key={a.status} variant="outline" size="sm" onClick={() => setTicketStatus(ticket.id, a.status)}>
            {a.label}
          </Button>
        ))}
      </div>

      <p className="mb-3 mt-8 text-body-sm font-semibold text-foreground">Conversation</p>
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} text={m.body} time={formatRelativeTime(m.createdAt)} mine={m.authorRole === 'ADMIN'} />
        ))}
      </div>
      <form onSubmit={submitReply} className="mt-3 flex items-end gap-2">
        <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Répondre à l'utilisateur..." rows={2} className="flex-1" />
        <Button type="submit" disabled={!reply.trim()}>
          Envoyer
        </Button>
      </form>

      {history.length > 0 && (
        <>
          <p className="mb-3 mt-8 text-body-sm font-semibold text-foreground">Historique</p>
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-body-sm text-foreground">
                  <span className="font-semibold">{ACTOR_NAME[entry.actorId] ?? entry.actorId}</span> · {entry.action}
                </p>
                <span className="shrink-0 text-caption text-muted-foreground">{formatRelativeTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
