import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react';
import { Button, Card, Input, Modal, toast } from '@/components/ui';
import { usePaymentMethodsStore } from '@/features/payments/paymentMethodsStore';
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

/** Numéros d'exemple standard pour les placeholders — cohérents partout dans l'app. */
const PHONE_PLACEHOLDER: Partial<Record<PaymentMethod, string>> = {
  ORANGE_MONEY: '620557799',
  MOMO: '664224466',
};

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const methods = usePaymentMethodsStore((s) => s.methods);
  const addMethod = usePaymentMethodsStore((s) => s.addMethod);
  const removeMethod = usePaymentMethodsStore((s) => s.removeMethod);
  const setDefault = usePaymentMethodsStore((s) => s.setDefault);

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<PaymentMethod>('ORANGE_MONEY');
  const [value, setValue] = useState('');

  const isCard = type === 'VISA' || type === 'PAYCARD';

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

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 text-foreground">Moyens de paiement</h1>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {methods.map((m) => (
          <Card key={m.id} className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              {METHOD_ICON[m.method]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{m.label}</p>
              {m.isDefault ? (
                <p className="flex items-center gap-1 text-xs text-secondary-700">
                  <CheckCircle2 className="h-3 w-3" /> Par défaut
                </p>
              ) : (
                <button onClick={() => setDefault(m.id)} className="text-xs font-semibold text-primary-700 hover:underline">
                  Définir par défaut
                </button>
              )}
            </div>
            {m.method !== 'ESPECE' && (
              <button
                aria-label="Supprimer"
                onClick={() => {
                  removeMethod(m.id);
                  toast('Moyen de paiement supprimé.');
                }}
                className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
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
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  type === m.id ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
                }`}
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
    </div>
  );
}
