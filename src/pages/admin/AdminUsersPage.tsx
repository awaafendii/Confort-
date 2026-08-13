import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConfirmDialog, FilterChips, SearchInput } from '@/components/ui';
import { UserDetailsDrawer, UserTable } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import type { PlatformUser } from '@/types';

const FILTERS: { id: PlatformUser['status'] | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'ACTIVE', label: 'Actifs' },
  { id: 'NEW', label: 'Nouveaux' },
  { id: 'SUSPENDED', label: 'Suspendus' },
  { id: 'BLOCKED', label: 'Bloqués' },
];

export default function AdminUsersPage() {
  const users = useAdminStore((s) => s.users);
  const setUserStatus = useAdminStore((s) => s.setUserStatus);

  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<PlatformUser['status'] | 'ALL'>('ALL');
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [pendingUser, setPendingUser] = useState<PlatformUser | null>(null);

  const filtered = useMemo(() => {
    const byStatus = filter === 'ALL' ? users : users.filter((u) => u.status === filter);
    const query = search.trim().toLowerCase();
    if (!query) return byStatus;
    return byStatus.filter(
      (u) => u.name.toLowerCase().includes(query) || u.phone.includes(query) || (u.email ?? '').toLowerCase().includes(query)
    );
  }, [users, filter, search]);

  const willBlock = pendingUser?.status !== 'BLOCKED';

  const confirmToggle = () => {
    if (!pendingUser) return;
    const nextStatus = willBlock ? 'BLOCKED' : 'ACTIVE';
    setUserStatus(pendingUser.id, nextStatus);
    setSelectedUser((current) => (current?.id === pendingUser.id ? { ...current, status: nextStatus } : current));
    setPendingUser(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Utilisateurs</h1>

      <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Nom, téléphone ou email..." className="lg:max-w-xs" />
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filtrer par statut" />
      </div>

      <p className="mt-3 text-body-sm text-muted-foreground">
        {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
      </p>

      <UserTable users={filtered} onView={setSelectedUser} onToggleStatus={setPendingUser} className="mt-4" />

      <UserDetailsDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onToggleStatus={setPendingUser} />

      <ConfirmDialog
        open={!!pendingUser}
        onClose={() => setPendingUser(null)}
        onConfirm={confirmToggle}
        title={willBlock ? 'Bloquer ce compte ?' : 'Débloquer ce compte ?'}
        description={
          pendingUser
            ? willBlock
              ? `${pendingUser.name} ne pourra plus se connecter ni réserver de course tant que le compte reste bloqué.`
              : `${pendingUser.name} retrouvera un accès normal à son compte.`
            : undefined
        }
        confirmLabel={willBlock ? 'Bloquer' : 'Débloquer'}
        destructive={willBlock}
      />
    </div>
  );
}
