import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, MessageSquareText } from 'lucide-react';
import { Badge, Card, EmptyState, FilterChips, SearchInput, StatusBadge } from '@/components/ui';
import { TICKET_PRIORITY_CONFIG, TICKET_STATUS_CONFIG } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { formatRelativeTime } from '@/utils/format';
import type { SupportTicket, TicketPriority } from '@/types';

type StatusFilter = 'ALL' | SupportTicket['status'];
type PriorityFilter = 'ALL' | TicketPriority;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'NEW', label: 'Nouveaux' },
  { id: 'IN_PROGRESS', label: 'En cours' },
  { id: 'WAITING', label: 'En attente' },
  { id: 'RESOLVED', label: 'Résolus' },
  { id: 'CLOSED', label: 'Fermés' },
];

const PRIORITY_FILTERS: { id: PriorityFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'HIGH', label: 'Haute' },
  { id: 'MEDIUM', label: 'Moyenne' },
  { id: 'LOW', label: 'Basse' },
];

function userNameFor(id: string, drivers: { id: string; name: string }[]): string {
  return MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ?? drivers.find((d) => d.id === id)?.name ?? id;
}

export default function AdminSupportPage() {
  const navigate = useNavigate();
  const tickets = useAdminStore((s) => s.tickets);
  const drivers = useAdminStore((s) => s.drivers);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const byStatus = statusFilter === 'ALL' ? tickets : tickets.filter((t) => t.status === statusFilter);
    const byPriority = priorityFilter === 'ALL' ? byStatus : byStatus.filter((t) => t.priority === priorityFilter);
    const query = search.trim().toLowerCase();
    if (!query) return byPriority;
    return byPriority.filter((t) => t.subject.toLowerCase().includes(query) || userNameFor(t.userId, drivers).toLowerCase().includes(query));
  }, [tickets, statusFilter, priorityFilter, search, drivers]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Support</h1>

      <div className="mt-4 lg:mt-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Sujet ou utilisateur..." />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
        <div>
          <p className="mb-1.5 text-caption font-medium text-muted-foreground">Statut</p>
          <FilterChips options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} label="Filtrer par statut" />
        </div>
        <div>
          <p className="mb-1.5 text-caption font-medium text-muted-foreground">Priorité</p>
          <FilterChips options={PRIORITY_FILTERS} value={priorityFilter} onChange={setPriorityFilter} label="Filtrer par priorité" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="Aucun ticket" description="Aucun résultat pour cette recherche ou ces filtres." />
        )}
        {filtered.map((ticket) => (
          <Card key={ticket.id} interactive onClick={() => navigate(`/admin/support/${ticket.id}`)} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <MessageSquareText className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{ticket.subject}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {userNameFor(ticket.userId, drivers)} · {formatRelativeTime(ticket.createdAt)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusBadge status={ticket.status} config={TICKET_STATUS_CONFIG} />
                <Badge variant={TICKET_PRIORITY_CONFIG[ticket.priority].variant}>{TICKET_PRIORITY_CONFIG[ticket.priority].label}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
