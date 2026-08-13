import React, { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Badge, FilterChips, SearchInput } from '@/components/ui';
import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import { formatRelativeTime } from '@/utils/format';
import type { AuditLog, AuditModule } from '@/types';

/** Résolution du nom d'auteur pour l'affichage — dupliqué ici plutôt qu'importé d'authService, même principe que DEMO_DRIVER_ENTRY dans adminStore.ts. */
const ACTOR_NAME: Record<string, string> = {
  'demo-admin': 'Admin Confort+',
  'demo-super-admin': 'Founé Camara',
};

type ModuleFilter = 'ALL' | AuditModule;

const MODULE_FILTERS: { id: ModuleFilter; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'Utilisateurs', label: 'Utilisateurs' },
  { id: 'Chauffeurs', label: 'Chauffeurs' },
  { id: 'Courses', label: 'Courses' },
  { id: 'Paiements', label: 'Paiements' },
  { id: 'Support', label: 'Support' },
];

export default function AdminAuditPage() {
  const auditLog = useAdminStore((s) => s.auditLog);
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const byModule = moduleFilter === 'ALL' ? auditLog : auditLog.filter((e) => e.module === moduleFilter);
    const query = search.trim().toLowerCase();
    if (!query) return byModule;
    return byModule.filter(
      (e) =>
        (ACTOR_NAME[e.actorId] ?? e.actorId).toLowerCase().includes(query) ||
        e.action.toLowerCase().includes(query) ||
        e.target.toLowerCase().includes(query)
    );
  }, [auditLog, moduleFilter, search]);

  const columns: AdminDataTableColumn<AuditLog>[] = [
    {
      key: 'actor',
      header: 'Auteur',
      sortValue: (e) => ACTOR_NAME[e.actorId] ?? e.actorId,
      render: (e) => <span className="font-medium">{ACTOR_NAME[e.actorId] ?? e.actorId}</span>,
    },
    { key: 'action', header: 'Action', render: (e) => e.action },
    { key: 'target', header: 'Cible', render: (e) => <span className="text-muted-foreground">{e.target}</span> },
    { key: 'module', header: 'Module', sortValue: (e) => e.module, render: (e) => <Badge variant="neutral">{e.module}</Badge> },
    { key: 'result', header: 'Résultat', render: () => <Badge variant="success">Réussi</Badge> },
    { key: 'session', header: 'Session', render: (e) => <span className="text-caption text-muted-foreground">{e.sessionId}</span> },
    {
      key: 'when',
      header: 'Quand',
      sortValue: (e) => e.createdAt,
      render: (e) => <span className="text-muted-foreground">{formatRelativeTime(e.createdAt)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Journal d'audit</h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground lg:mt-0">
        <ShieldCheck className="h-4 w-4" />
        Réservé aux comptes Super Admin — chaque action de modération prise dans l'espace admin s'enregistre ici automatiquement.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Auteur, action ou cible..." className="sm:max-w-xs" />
        <div>
          <p className="mb-1.5 text-caption font-medium text-muted-foreground">Module</p>
          <FilterChips options={MODULE_FILTERS} value={moduleFilter} onChange={setModuleFilter} label="Filtrer par module" />
        </div>
      </div>

      <p className="mt-3 text-body-sm text-muted-foreground">
        {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
      </p>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        emptyTitle="Aucune entrée"
        emptyDescription="Aucun résultat pour cette recherche ou ce filtre."
        className="mt-4"
      />
    </div>
  );
}
