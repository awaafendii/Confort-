import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';
import { Avatar, Badge, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { useAdminStore } from '@/features/admin/adminStore';
import type { PlatformUser } from '@/types';

const FILTERS: { id: PlatformUser['status'] | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'ACTIVE', label: 'Actifs' },
  { id: 'NEW', label: 'Nouveaux' },
  { id: 'SUSPENDED', label: 'Suspendus' },
  { id: 'BLOCKED', label: 'Bloqués' },
];

const STATUS_BADGE: Record<PlatformUser['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  ACTIVE: { label: 'Actif', variant: 'success' },
  NEW: { label: 'Nouveau', variant: 'neutral' },
  SUSPENDED: { label: 'Suspendu', variant: 'warning' },
  BLOCKED: { label: 'Bloqué', variant: 'danger' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const users = useAdminStore((s) => s.users);
  const setUserStatus = useAdminStore((s) => s.setUserStatus);
  const [filter, setFilter] = useState<PlatformUser['status'] | 'ALL'>('ALL');

  const filtered = useMemo(() => (filter === 'ALL' ? users : users.filter((u) => u.status === filter)), [users, filter]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Utilisateurs</h1>

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

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Utilisateur</TableHeaderCell>
            <TableHeaderCell>Téléphone</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell>Courses</TableHeaderCell>
            <TableHeaderCell>Créé le</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((user) => {
            const status = STATUS_BADGE[user.status];
            const blocked = user.status === 'BLOCKED';
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{user.tripsCount}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <button
                    onClick={() => setUserStatus(user.id, blocked ? 'ACTIVE' : 'BLOCKED')}
                    className={`flex items-center gap-1.5 text-xs font-semibold ${blocked ? 'text-secondary-700' : 'text-danger'} hover:underline`}
                  >
                    {blocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    {blocked ? 'Débloquer' : 'Bloquer'}
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
