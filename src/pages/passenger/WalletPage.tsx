import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Banknote, ChevronRight, Clock, CreditCard, Plus, Smartphone, Wallet as WalletIcon } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input, Modal, Tooltip, toast } from '@/components/ui';
import { PaymentMethodRow } from '@/components/business';
import { useWalletStore } from '@/features/payments/walletStore';
import { usePaymentMethodsStore } from '@/features/payments/paymentMethodsStore';
import { cn } from '@/lib/utils';
import { formatFare } from '@/utils/format';
import type { PaymentMethod, Transaction } from '@/types';

const TOPUP_AMOUNTS = [5000, 10000, 25000, 50000];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'Carte',
  VISA: 'Carte bancaire',
  KULU: 'Kulu',
};

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  ESPECE: <Banknote className="h-4 w-4" />,
  ORANGE_MONEY: <Smartphone className="h-4 w-4" />,
  MOMO: <Smartphone className="h-4 w-4" />,
  PAYCARD: <CreditCard className="h-4 w-4" />,
  VISA: <CreditCard className="h-4 w-4" />,
  KULU: <Banknote className="h-4 w-4" />,
};

type Bucket = 'today' | 'week' | 'older';
const BUCKET_LABELS: Record<Bucket, string> = { today: "Aujourd'hui", week: 'Cette semaine', older: 'Plus ancien' };
const BUCKET_ORDER: Bucket[] = ['today', 'week', 'older'];

function bucketFor(iso: string): Bucket {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= startOfToday) return 'today';
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date >= weekAgo) return 'week';
  return 'older';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function WalletPage() {
  const navigate = useNavigate();
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const mobileMoneyMethods = usePaymentMethodsStore((s) => s.methods).filter((m) => m.method !== 'ESPECE');

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState(TOPUP_AMOUNTS[1]);
  const [methodId, setMethodId] = useState(mobileMoneyMethods[0]?.id);

  const confirmTopup = () => {
    setModalOpen(false);
    toast('Le rechargement réel arrive avec l’intégration Orange Money/MoMo — pas encore disponible dans cette démo.');
  };

  const groups: Record<Bucket, Transaction[]> = { today: [], week: [], older: [] };
  transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach((tx) => groups[bucketFor(tx.date)].push(tx));

  const balanceCard = (
    <Card className="bg-primary-800 text-white">
      <div className="flex items-center gap-2 text-primary-100">
        <WalletIcon className="h-4 w-4" />
        <p className="text-body-sm">Solde disponible</p>
      </div>
      <p className="mt-2 font-display text-display font-extrabold">{formatFare(balance)}</p>
      {mobileMoneyMethods.length === 0 ? (
        <Tooltip content="Ajoutez d'abord un moyen de paiement Mobile Money">
          <Button variant="accent" size="sm" className="mt-4" disabled>
            <Plus className="h-4 w-4" /> Recharger
          </Button>
        </Tooltip>
      ) : (
        <Button variant="accent" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Recharger
        </Button>
      )}
    </Card>
  );

  const methodsSection = mobileMoneyMethods.length > 0 && (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">Mobile Money</p>
        <button
          type="button"
          onClick={() => navigate('/passenger/profile/payment-methods')}
          className="rounded-sm text-body-sm font-semibold text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Gérer
        </button>
      </div>
      <div className="space-y-2">
        {mobileMoneyMethods.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-800">
              {PAYMENT_ICONS[m.method]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium text-foreground">{m.label}</span>
              {m.isDefault && <span className="text-caption text-muted-foreground">Par défaut</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const disclaimer = (
    <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border bg-surface p-3.5 text-caption text-muted-foreground">
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      Solde et historique de démonstration — le rechargement réel (Orange Money, MoMo) arrive avec l'intégration
      Mobile Money.
    </div>
  );

  const history =
    transactions.length === 0 ? (
      <EmptyState icon={<WalletIcon className="h-7 w-7" />} title="Aucune transaction" description="Vos mouvements apparaîtront ici." />
    ) : (
      <div className="space-y-6">
        {BUCKET_ORDER.filter((b) => groups[b].length > 0).map((bucket) => (
          <div key={bucket}>
            <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{BUCKET_LABELS[bucket]}</p>
            <div className="space-y-2">
              {groups[bucket].map((tx) => {
                const clickable = !!tx.rideId;
                return (
                  <Card
                    key={tx.id}
                    noPadding
                    interactive={clickable}
                    onClick={clickable ? () => navigate(`/passenger/trips/${tx.rideId}`) : undefined}
                    className="flex items-center gap-3.5 px-4 py-3.5"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        tx.type === 'CREDIT' ? 'bg-accent-50 text-accent-700' : 'bg-surface text-muted-foreground'
                      )}
                    >
                      {tx.type === 'CREDIT' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-medium text-foreground">{tx.description}</p>
                      <p className="text-caption text-muted-foreground">
                        {formatDate(tx.date)} · {PAYMENT_LABELS[tx.method]}
                      </p>
                    </div>
                    <p className={cn('shrink-0 text-body font-bold', tx.type === 'CREDIT' ? 'text-accent-700' : 'text-foreground')}>
                      {tx.type === 'CREDIT' ? '+' : '−'}
                      {formatFare(tx.amount)}
                    </p>
                    {clickable && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-4xl lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Portefeuille</h1>

      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8">
        <div className="mt-6 space-y-5 lg:mt-2">
          {balanceCard}
          {methodsSection}
          {disclaimer}
        </div>

        <div className="mt-8 lg:mt-2">
          <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-muted-foreground">Historique</p>
          {history}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Recharger mon compte">
        <Badge variant="warning" className="mb-4">
          Aperçu — bientôt disponible
        </Badge>

        <p className="mb-3 text-body-sm font-medium text-foreground">Montant</p>
        <div className="grid grid-cols-4 gap-2">
          {TOPUP_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={cn(
                'rounded-md border py-2.5 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                amount === a ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
              )}
            >
              {(a / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
        <Input
          className="mt-2.5"
          type="number"
          inputMode="numeric"
          min={500}
          step={500}
          placeholder="Autre montant (FG)"
          aria-label="Autre montant en francs guinéens"
          value={amount || ''}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
        />

        <p className="mb-2 mt-5 text-body-sm font-medium text-foreground">Moyen de paiement</p>
        <div role="radiogroup" aria-label="Moyen de paiement" className="space-y-2">
          {mobileMoneyMethods.map((m) => (
            <PaymentMethodRow key={m.id} method={m} icon={PAYMENT_ICONS[m.method]} selected={methodId === m.id} onSelect={() => setMethodId(m.id)} />
          ))}
        </div>

        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={confirmTopup} disabled={amount <= 0}>
          Recharger {formatFare(amount)}
        </Button>
      </Modal>
    </div>
  );
}
