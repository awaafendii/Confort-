import React, { useState } from 'react';
import { Banknote, Calendar, Car, Clock, Info, Wallet } from 'lucide-react';
import { Badge, Button, Card, Input, Modal, StatCard, toast } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { usePayoutRequestsStore } from '@/features/payments/payoutRequestsStore';
import { MOCK_DRIVER_RIDES } from '@/data/mockDriverRides';
import { formatFare } from '@/utils/format';
import type { Driver } from '@/types';

export default function DriverEarningsPage() {
  const account = useAuthStore((s) => s.account) as Driver | null;
  const requests = usePayoutRequestsStore((s) => s.requests);
  const addRequest = usePayoutRequestsStore((s) => s.addRequest);

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');

  if (!account) return null;

  const weekTotal = MOCK_DRIVER_RIDES.reduce((sum, r) => sum + r.fare, 0) + account.earningsToday;
  const maxAmount = account.earningsToday;

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Math.min(Number(amount) || 0, maxAmount);
    if (value <= 0) return;
    addRequest({ amount: value, method: 'ORANGE_MONEY', destinationLabel: `Orange Money · ${account.phone}` });
    toast.success('Demande de retrait envoyée — traitement sous 24 à 48 h.');
    setAmount('');
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Mes gains</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Aujourd'hui" value={formatFare(account.earningsToday)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Cette semaine" value={formatFare(weekTotal)} icon={<Calendar className="h-5 w-5" />} />
        <StatCard label="Courses (semaine)" value={String(MOCK_DRIVER_RIDES.length)} icon={<Car className="h-5 w-5" />} />
        <StatCard label="Gain moyen / course" value={formatFare(weekTotal / Math.max(1, MOCK_DRIVER_RIDES.length))} icon={<Banknote className="h-5 w-5" />} />
      </div>

      <Card className="mt-5 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-50 text-secondary-800">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Retrait vers Mobile Money</p>
          <p className="text-xs text-muted-foreground">Orange Money · {account.phone}</p>
        </div>
      </Card>
      <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => setModalOpen(true)} disabled={maxAmount <= 0}>
        Retirer mes gains
      </Button>

      {requests.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold text-foreground">Demandes de retrait</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <Card key={r.id} noPadding className="flex items-center gap-3.5 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{formatFare(r.amount)}</p>
                  <p className="text-xs text-muted-foreground">{r.destinationLabel}</p>
                </div>
                <Badge variant="warning">En attente</Badge>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Retirer mes gains">
        <p className="mb-4 text-sm text-muted-foreground">
          Disponible : <span className="font-semibold text-foreground">{formatFare(maxAmount)}</span>
        </p>
        <form onSubmit={submitRequest} className="space-y-4">
          <Input
            label="Montant à retirer (FG)"
            type="number"
            min={1}
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            Aucun virement réel n'est effectué dans cette démo — la demande sera enregistrée en attente, sans
            intégration Mobile Money branchée.
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Envoyer la demande
          </Button>
        </form>
      </Modal>
    </div>
  );
}
