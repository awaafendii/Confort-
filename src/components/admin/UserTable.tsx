import React from 'react';
import { Ban, CheckCircle2, Eye } from 'lucide-react';
import { Avatar, IconButton } from '@/components/ui';
import { AdminDataTable, type AdminDataTableColumn } from './AdminDataTable';
import { UserStatusBadge } from './UserStatusBadge';
import type { PlatformUser } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface UserTableProps {
  users: PlatformUser[];
  loading?: boolean;
  onView: (user: PlatformUser) => void;
  onToggleStatus: (user: PlatformUser) => void;
  className?: string;
}

export const UserTable: React.FC<UserTableProps> = ({ users, loading, onView, onToggleStatus, className }) => {
  const columns: AdminDataTableColumn<PlatformUser>[] = [
    {
      key: 'name',
      header: 'Utilisateur',
      sortValue: (u) => u.name,
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} src={u.avatar} size="sm" />
          <span className="font-medium">{u.name}</span>
        </div>
      ),
    },
    { key: 'phone', header: 'Téléphone', render: (u) => <span className="text-muted-foreground">{u.phone}</span> },
    { key: 'email', header: 'Email', render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: 'status', header: 'Statut', sortValue: (u) => u.status, render: (u) => <UserStatusBadge status={u.status} /> },
    { key: 'trips', header: 'Courses', sortValue: (u) => u.tripsCount, render: (u) => u.tripsCount },
    {
      key: 'createdAt',
      header: 'Créé le',
      sortValue: (u) => u.createdAt,
      render: (u) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => {
        const blocked = u.status === 'BLOCKED';
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <IconButton icon={<Eye className="h-4 w-4" />} aria-label="Voir le détail" size="sm" variant="ghost" onClick={() => onView(u)} />
            <button
              onClick={() => onToggleStatus(u)}
              className={`flex items-center gap-1.5 text-xs font-semibold ${blocked ? 'text-secondary-700' : 'text-danger'} hover:underline`}
            >
              {blocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              {blocked ? 'Débloquer' : 'Bloquer'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      rows={users}
      rowKey={(u) => u.id}
      loading={loading}
      emptyTitle="Aucun utilisateur"
      emptyDescription="Aucun résultat pour cette recherche ou ce filtre."
      onRowClick={onView}
      className={className}
    />
  );
};
