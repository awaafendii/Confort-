import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { useAdminStore } from '@/features/admin/adminStore';
import { formatRelativeTime } from '@/utils/format';

/** Résolution du nom d'auteur pour l'affichage — dupliqué ici plutôt qu'importé d'authService, même principe que DEMO_DRIVER_ENTRY dans adminStore.ts. */
const ACTOR_NAME: Record<string, string> = {
  'demo-admin': 'Admin Confort+',
  'demo-super-admin': 'Founé Camara',
};

export default function AdminAuditPage() {
  const auditLog = useAdminStore((s) => s.auditLog);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Journal d'audit</h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground lg:mt-0">
        <ShieldCheck className="h-4 w-4" />
        Réservé aux comptes Super Admin — chaque action de modération prise dans l'espace admin s'enregistre ici automatiquement.
      </p>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Auteur</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>Cible</TableHeaderCell>
            <TableHeaderCell>Quand</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {auditLog.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{ACTOR_NAME[entry.actorId] ?? entry.actorId}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell className="text-muted-foreground">{entry.target}</TableCell>
              <TableCell className="text-muted-foreground">{formatRelativeTime(entry.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
