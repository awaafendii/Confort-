import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Car } from 'lucide-react';
import { Badge, BackButton, Button, Card, Input, SegmentedControl, Skeleton, toast } from '@/components/ui';
import { VehicleColorPicker } from '@/features/auth/components/VehicleColorPicker';
import { useAuthStore } from '@/features/auth/store';
import type { Driver, DriverDocument, VehicleType } from '@/types';

/** Pas d'opération asynchrone réelle derrière `updateAccount` — ce délai rend le spinner du bouton honnête plutôt que cosmétique (même raisonnement que PersonalInfoPage). */
const SAVE_DELAY_MS = 500;

const VEHICLE_DOC_TYPES: { type: DriverDocument['type']; label: string }[] = [
  { type: 'CARTE_GRISE', label: 'Carte grise' },
  { type: 'ASSURANCE', label: 'Assurance' },
];

const STATUS_BADGE: Record<DriverDocument['status'] | 'MISSING', { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  VALIDATED: { label: 'Validée', variant: 'success' },
  PENDING: { label: 'En cours', variant: 'warning' },
  REJECTED: { label: 'Rejetée', variant: 'danger' },
  MISSING: { label: 'Non fournie', variant: 'neutral' },
};

function VehicleSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-6 h-16 w-full rounded-lg" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}

export default function VehiclePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account) as Driver | null;
  const updateAccount = useAuthStore((s) => s.updateAccount);

  const [type, setType] = useState<VehicleType>(account?.vehicle.type ?? 'VOITURE');
  const [brand, setBrand] = useState(account?.vehicle.brand ?? '');
  const [model, setModel] = useState(account?.vehicle.model ?? '');
  const [plateNumber, setPlateNumber] = useState(account?.vehicle.plateNumber ?? '');
  const [color, setColor] = useState(account?.vehicle.color ?? 'blanc');
  const [saving, setSaving] = useState(false);

  if (!account) return <VehicleSkeleton />;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateAccount({ vehicle: { ...account.vehicle, type, brand, model, plateNumber, color } });
      toast.success('Véhicule mis à jour.');
      navigate(-1);
    }, SAVE_DELAY_MS);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-6 lg:hidden" />
      <h1 className="font-display text-h2 text-foreground">Véhicule</h1>

      <Card className="mt-4">
        <p className="mb-3 text-body-sm font-semibold text-foreground">Statut des documents véhicule</p>
        <div className="space-y-2.5">
          {VEHICLE_DOC_TYPES.map(({ type: docType, label }) => {
            const status = STATUS_BADGE[account.documents.find((d) => d.type === docType)?.status ?? 'MISSING'];
            return (
              <div key={docType} className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">{label}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <form onSubmit={save} className="mt-6 space-y-4">
        <SegmentedControl
          label="Type de véhicule"
          value={type}
          onChange={setType}
          className="w-full"
          options={[
            { value: 'VOITURE', label: 'Voiture', icon: <Car className="h-4 w-4" /> },
            { value: 'MOTO', label: 'Moto', icon: <Bike className="h-4 w-4" /> },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Marque" value={brand} onChange={(e) => setBrand(e.target.value)} required />
          <Input label="Modèle" value={model} onChange={(e) => setModel(e.target.value)} required />
        </div>
        <Input label="Plaque d'immatriculation" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />

        <div>
          <p className="mb-2 text-body-sm font-medium text-foreground">Couleur du véhicule</p>
          <VehicleColorPicker value={color} onChange={setColor} />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={saving}>
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
