import type { AuditLog } from '@/types';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Historique d'audit de démonstration — les actions réelles prises dans l'app (bloquer, vérifier, résoudre) s'ajoutent en tête via adminStore.ts. */
export const MOCK_AUDIT_LOG: AuditLog[] = [
  { id: 'audit-1', actorId: 'demo-admin', action: 'Compte bloqué', target: 'Binta Camara', module: 'Utilisateurs', result: 'SUCCESS', sessionId: 'sess-seed001', createdAt: hoursAgo(30) },
  { id: 'audit-2', actorId: 'demo-admin', action: 'Chauffeur vérifié', target: 'Ibrahima Soumah', module: 'Chauffeurs', result: 'SUCCESS', sessionId: 'sess-seed001', createdAt: hoursAgo(50) },
  { id: 'audit-3', actorId: 'demo-super-admin', action: 'Ticket support résolu', target: 'Chauffeur impoli pendant la course', module: 'Support', result: 'SUCCESS', sessionId: 'sess-seed002', createdAt: hoursAgo(96) },
];
