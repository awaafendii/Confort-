import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Card } from '@/components/ui';
import { RIDE_CATEGORIES_CONFIG, calculateStandardFare } from '@/data/pricing';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store';
import type { RideCategory } from '@/types';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

const TOGGLES: SettingToggle[] = [
  { id: 'signups', label: 'Nouvelles inscriptions chauffeurs', description: 'Autoriser les nouveaux chauffeurs à créer un compte.', defaultChecked: true },
  { id: 'moto', label: 'Moto-taxi activé', description: 'Rendre la catégorie Moto-Taxi réservable à Conakry.', defaultChecked: true },
  { id: 'maintenance', label: 'Mode maintenance', description: 'Suspendre temporairement les nouvelles courses côté passager.', defaultChecked: false },
];

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked ? 'bg-secondary-700' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-6 w-6 rounded-full bg-white shadow-card transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1'
        )}
      />
    </button>
  );
}

const SAMPLE_FARE_KALOUM_MADINA = calculateStandardFare('kaloum', 'madina');

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const logout = useAuthStore((s) => s.logout);
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.id, t.defaultChecked]))
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Paramètres</h1>

      <p className="mt-4 text-sm font-semibold text-foreground lg:mt-0">Compte administrateur</p>
      <Card className="mt-2">
        <p className="font-semibold text-foreground">{account?.name}</p>
        <p className="text-sm text-muted-foreground">{account?.email}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary-700">{account?.role}</p>
        <button
          onClick={() => {
            logout();
            navigate('/welcome', { replace: true });
          }}
          className="mt-4 flex items-center gap-1.5 border-t border-border pt-4 text-sm font-semibold text-danger hover:underline"
        >
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </Card>

      <p className="mt-6 text-sm font-semibold text-foreground">Fonctionnalités de la plateforme</p>
      <Card noPadding className="mt-2 divide-y divide-border">
        {TOGGLES.map((toggle) => (
          <div key={toggle.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{toggle.label}</p>
              <p className="text-xs text-muted-foreground">{toggle.description}</p>
            </div>
            <Switch
              checked={toggles[toggle.id]}
              onChange={() => setToggles((prev) => ({ ...prev, [toggle.id]: !prev[toggle.id] }))}
              label={toggle.label}
            />
          </div>
        ))}
      </Card>

      <p className="mt-6 text-sm font-semibold text-foreground">Grille tarifaire</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Référence Kaloum → Madina : {new Intl.NumberFormat('fr-FR').format(SAMPLE_FARE_KALOUM_MADINA)} FG. Modification de la
        tarification réservée à l'équipe produit.
      </p>
      <Card noPadding className="mt-2 divide-y divide-border">
        {(Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((category) => {
          const config = RIDE_CATEGORIES_CONFIG[category];
          return (
            <div key={category} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">{config.capacity}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
