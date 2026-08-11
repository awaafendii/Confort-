import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Info, Plus, Wallet as WalletIcon } from 'lucide-react';
import { Button, Card, EmptyState, Modal, toast } from '@/components/ui';
import { useWalletStore } from '@/features/payments/walletStore';
import { usePaymentMethodsStore } from '@/features/payments/paymentMethodsStore';
import { formatFare } from '@/utils/format';

const TOPUP_AMOUNTS = [5000, 10000, 25000, 50000];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function WalletPage() {
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const methods = usePaymentMethodsStore((s) => s.methods).filter((m) => m.method !== 'ESPECE');

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState(TOPUP_AMOUNTS[1]);
  const [methodId, setMethodId] = useState(methods[0]?.id);

  const confirmTopup = () => {
    setModalOpen(false);
    toast('Le rechargement réel arrive avec l’intégration Orange Money/MoMo — pas encore disponible dans cette démo.');
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Portefeuille</h1>

      <Card className="mt-6 bg-primary-800 text-white">
        <p className="text-sm text-primary-100">Solde disponible</p>
        <p className="mt-1 font-display text-3xl font-bold">{formatFare(balance)}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => setModalOpen(true)}
          disabled={methods.length === 0}
        >
          <Plus className="h-4 w-4" /> Recharger
        </Button>
      </Card>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-dashed border-border p-3.5 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        Solde et historique de démonstration — aucun paiement réel n'est traité tant que l'intégration Mobile Money
        n'est pas branchée.
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-foreground">Historique</h2>
      {transactions.length === 0 ? (
        <EmptyState icon={<WalletIcon className="h-7 w-7" />} title="Aucune transaction" description="Vos mouvements apparaîtront ici." />
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <Card key={tx.id} noPadding className="flex items-center gap-3.5 px-4 py-3.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  tx.type === 'CREDIT' ? 'bg-secondary-50 text-secondary-700' : 'bg-surface text-muted-foreground'
                }`}
              >
                {tx.type === 'CREDIT' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(tx.date)} · {tx.method.replace('_', ' ')}
                </p>
              </div>
              <p className={`text-sm font-bold ${tx.type === 'CREDIT' ? 'text-secondary-700' : 'text-foreground'}`}>
                {tx.type === 'CREDIT' ? '+' : '−'}
                {formatFare(tx.amount)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Recharger mon compte">
        <p className="mb-4 text-sm font-medium text-foreground">Montant</p>
        <div className="grid grid-cols-4 gap-2">
          {TOPUP_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`rounded-xl border py-2.5 text-xs font-semibold ${
                amount === a ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
              }`}
            >
              {(a / 1000).toFixed(0)}k
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-sm font-medium text-foreground">Moyen de paiement</p>
        <div className="space-y-2">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodId(m.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
                methodId === m.id ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-foreground'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={confirmTopup}>
          Recharger {formatFare(amount)}
        </Button>
      </Modal>
    </div>
  );
}
