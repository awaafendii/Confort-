import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, Car } from 'lucide-react';
import { Button, Input, toast } from '@/components/ui';
import { VehicleColorPicker } from '@/features/auth/components/VehicleColorPicker';
import { useAuthStore } from '@/features/auth/store';
import type { Driver, VehicleType } from '@/types';

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

  if (!account) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateAccount({ vehicle: { ...account.vehicle, type, brand, model, plateNumber, color } });
    toast.success('Véhicule mis à jour.');
    setSaving(false);
    navigate(-1);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="font-display text-h2 text-foreground">Véhicule</h1>

      <form onSubmit={save} className="mt-8 space-y-4">
        <div className="flex gap-2">
          {(['VOITURE', 'MOTO'] as VehicleType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                type === t ? 'border-secondary-700 bg-secondary-50 text-secondary-800' : 'border-border bg-background text-muted-foreground'
              }`}
            >
              {t === 'VOITURE' ? <Car className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
              {t === 'VOITURE' ? 'Voiture' : 'Moto'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Marque" value={brand} onChange={(e) => setBrand(e.target.value)} required />
          <Input label="Modèle" value={model} onChange={(e) => setModel(e.target.value)} required />
        </div>
        <Input label="Plaque d'immatriculation" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Couleur du véhicule</p>
          <VehicleColorPicker value={color} onChange={setColor} />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={saving}>
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
