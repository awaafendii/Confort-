import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatFare, formatRelativeTime } from '@/utils/format';
import { AdminDataTable, type AdminDataTableColumn } from './AdminDataTable';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import type { PaymentMethod, PaymentStatus, Transaction } from '@/types';

const STATUS_BADGE: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  SUCCESS: { label: 'Réussie', variant: 'success' },
  PENDING: { label: 'En attente', variant: 'warning' },
  FAILED: { label: 'Échouée', variant: 'danger' },
};

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'PayCard',
  VISA: 'Carte',
  KULU: 'Kulu',
};

function userNameFor(id: string): string {
  return MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ?? id;
}

/** Un remboursement n'est possible que sur un débit réel et réussi, lié à une course, et pas déjà remboursé. */
function isRefundable(txn: Transaction, refundedRideIds: Set<string>): boolean {
  return txn.type === 'DEBIT' && txn.status === 'SUCCESS' && !!txn.rideId && !refundedRideIds.has(txn.rideId);
}

export interface PaymentTableProps {
  transactions: Transaction[];
  refundedRideIds: Set<string>;
  loading?: boolean;
  onRefund: (txn: Transaction) => void;
  className?: string;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({ transactions, refundedRideIds, loading, onRefund, className }) => {
  const columns: AdminDataTableColumn<Transaction>[] = [
    { key: 'user', header: 'Utilisateur', sortValue: (t) => userNameFor(t.userId), render: (t) => <span className="font-medium">{userNameFor(t.userId)}</span> },
    { key: 'description', header: 'Description', render: (t) => <span className="text-muted-foreground">{t.description}</span> },
    { key: 'method', header: 'Méthode', sortValue: (t) => t.method, render: (t) => <span className="text-muted-foreground">{METHOD_LABEL[t.method]}</span> },
    {
      key: 'amount',
      header: 'Montant',
      sortValue: (t) => t.amount,
      render: (t) => {
        const isCredit = t.type === 'CREDIT';
        return (
          <span className={`inline-flex items-center gap-1.5 font-semibold ${isCredit ? 'text-secondary-700' : 'text-foreground'}`}>
            {isCredit ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
            {formatFare(t.amount)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Statut',
      sortValue: (t) => t.status,
      render: (t) => <Badge variant={STATUS_BADGE[t.status].variant}>{STATUS_BADGE[t.status].label}</Badge>,
    },
    { key: 'date', header: 'Quand', sortValue: (t) => t.date, render: (t) => <span className="text-muted-foreground">{formatRelativeTime(t.date)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) =>
        isRefundable(t, refundedRideIds) ? (
          <button onClick={() => onRefund(t)} className="flex items-center gap-1.5 text-xs font-semibold text-danger hover:underline">
            <Undo2 className="h-3.5 w-3.5" /> Rembourser
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      rows={transactions}
      rowKey={(t) => t.id}
      loading={loading}
      emptyTitle="Aucune transaction"
      emptyDescription="Aucun résultat pour cette recherche ou ces filtres."
      className={className}
    />
  );
};
