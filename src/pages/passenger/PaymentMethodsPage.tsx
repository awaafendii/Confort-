import React, { useState } from 'react';
import { Banknote, CreditCard, Plus, Smartphone, Wallet } from 'lucide-react';
import { BackButton, Button, ConfirmDialog, EmptyState, Input, Modal, toast } from '@/components/ui';
import { PaymentMethodRow } from '@/components/business';
import { usePaymentMethodsStore } from '@/features/payments/paymentMethodsStore';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

const ADDABLE_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'ORANGE_MONEY', label: 'Orange Money' },
  { id: 'MOMO', label: 'MoMo' },
  { id: 'VISA', label: 'Carte bancaire' },
];

const METHOD_ICON: Record<PaymentMethod, React.ReactNode> = {
  ESPECE: <Banknote className="h-4 w-4" />,
  ORANGE_MONEY: <Smartphone className="h-4 w-4" />,
  MOMO: <Smartphone className="h-4 w-4" />,
  VISA: <CreditCard className="h-4 w-4" />,
  PAYCARD: <CreditCard className="h-4 w-4" />,
  KULU: <CreditCard className="h-4 w-4" />,
};

const PHONE_PLACEHOLDER: Partial<Record<PaymentMethod, string>> = {
  ORANGE_MONEY: '620557799',
  MOMO: '664224466',
};

const CATEGORIES: { label: string; methods: PaymentMethod[] }[] = [
  { label: 'Mobile Money', methods: ['ORANGE_MONEY', 'MOMO', 'KULU'] },
  { label: 'Carte bancaire', methods: ['VISA', 'PAYCARD'] },
  { label: 'Espèces', methods: ['ESPECE'] },
];

export default function PaymentMethodsPage() {
  const methods = usePaymentMethodsStore((s) => s.methods);
  const addMethod = usePaymentMethodsStore((s) => s.addMethod);
  const removeMethod = usePaymentMethodsStore((s) => s.removeMethod);
  const setDefault = usePaymentMethodsStore((s) => s.setDefault);

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<PaymentMethod>('ORANGE_MONEY');
  const [value, setValue] = useState('');
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const isCard = type === 'VISA' || type === 'PAYCARD';
  const pendingMethod = methods.find((m) => m.id === pendingRemoveId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const methodLabel = ADDABLE_METHODS.find((m) => m.id === type)!.label;
    if (isCard) {
      addMethod({ method: type, label: `${methodLabel} · •••• ${value.slice(-4)}`, last4: value.slice(-4) });
    } else {
      addMethod({ method: type, label: `${methodLabel} · ${value}` });
    }
    toast.success('Moyen de paiement ajouté.');
    setValue('');
    setModalOpen(false);
  };

  const confirmRemove = () => {
    if (!pendingRemoveId) return;
    removeMethod(pendingRemoveId);
    toast('Moyen de paiement supprimé.');
    setPendingRemoveId(null);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2 lg:hidden" />

      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 text-foreground">Moyens de paiement</h1>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {methods.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-7 w-7" />}
          title="Aucun moyen de paiement"
          description="Ajoutez Orange Money, MoMo ou une carte pour régler vos courses."
          actionLabel="Ajouter"
          onAction={() => setModalOpen(true)}
          className="mt-8"
        />
      ) : (
        <div className="mt-6 space-y-6">
          {CATEGORIES.map((category) => {
            const inCategory = methods.filter((m) => category.methods.includes(m.method));
            if (inCategory.length === 0) return null;
            return (
              <div key={category.label}>
                <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{category.label}</p>
                <div className="space-y-2.5">
                  {inCategory.map((m) => (
                    <PaymentMethodRow
                      key={m.id}
                      method={m}
                      icon={METHOD_ICON[m.method]}
                      onSetDefault={() => setDefault(m.id)}
                      onRemove={m.method === 'ESPECE' ? undefined : () => setPendingRemoveId(m.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-caption text-muted-foreground">
        Confort+ ne traite aucun paiement réel pour le moment — ces moyens servent uniquement à préparer vos
        courses. L'intégration Orange Money, MoMo et carte bancaire arrivera avec le vrai backend.
      </p>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un moyen de paiement">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {ADDABLE_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setType(m.id)}
                className={cn(
                  'rounded-md border py-2.5 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  type === m.id ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <Input
            label={isCard ? 'Numéro de carte' : 'Numéro de téléphone'}
            placeholder={isCard ? '4111 1111 1111 1111' : PHONE_PLACEHOLDER[type]}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Enregistrer
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingRemoveId !== null}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={confirmRemove}
        title="Supprimer ce moyen de paiement ?"
        description={pendingMethod ? `« ${pendingMethod.label} » ne sera plus disponible pour régler vos courses.` : undefined}
        confirmLabel="Supprimer"
        destructive
      />
    </div>
  );
}
