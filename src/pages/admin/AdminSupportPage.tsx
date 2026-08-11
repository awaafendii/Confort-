import React, { useMemo, useState } from 'react';
import { CheckCircle2, MessageSquareText, XCircle } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { useAdminStore } from '@/features/admin/adminStore';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { formatRelativeTime } from '@/utils/format';
import type { SupportTicket } from '@/types';

type FilterId = 'ALL' | SupportTicket['status'];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'OPEN', label: 'Ouverts' },
  { id: 'IN_PROGRESS', label: 'En cours' },
  { id: 'RESOLVED', label: 'Résolus' },
  { id: 'CLOSED', label: 'Fermés' },
];

const STATUS_BADGE: Record<SupportTicket['status'], { label: string; variant: 'warning' | 'neutral' | 'success' | 'danger' }> = {
  OPEN: { label: 'Ouvert', variant: 'warning' },
  IN_PROGRESS: { label: 'En cours', variant: 'neutral' },
  RESOLVED: { label: 'Résolu', variant: 'success' },
  CLOSED: { label: 'Fermé', variant: 'danger' },
};

function userNameFor(id: string, drivers: { id: string; name: string }[]): string {
  return MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ?? drivers.find((d) => d.id === id)?.name ?? id;
}

export default function AdminSupportPage() {
  const tickets = useAdminStore((s) => s.tickets);
  const drivers = useAdminStore((s) => s.drivers);
  const setTicketStatus = useAdminStore((s) => s.setTicketStatus);
  const [filter, setFilter] = useState<FilterId>('ALL');

  const filtered = useMemo(() => (filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter)), [tickets, filter]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Support</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              filter === f.id ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucun ticket dans cette catégorie.</p>}
        {filtered.map((ticket) => {
          const status = STATUS_BADGE[ticket.status];
          const isOpenish = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';
          return (
            <Card key={ticket.id} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                  <MessageSquareText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{ticket.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {userNameFor(ticket.userId, drivers)} · {formatRelativeTime(ticket.createdAt)}
                  </p>
                  <Badge variant={status.variant} className="mt-2">
                    {status.label}
                  </Badge>
                </div>
              </div>
              {isOpenish && (
                <div className="flex shrink-0 flex-col items-end gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setTicketStatus(ticket.id, 'RESOLVED')}
                    className="flex items-center gap-1.5 text-secondary-700 hover:underline"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Résoudre
                  </button>
                  <button onClick={() => setTicketStatus(ticket.id, 'CLOSED')} className="flex items-center gap-1.5 text-danger hover:underline">
                    <XCircle className="h-3.5 w-3.5" /> Fermer
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
