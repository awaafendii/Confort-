import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Card, Input, Switch, Textarea } from '@/components/ui';
import { METHOD_LABEL } from '@/components/admin';
import { RIDE_CATEGORIES_CONFIG, calculateStandardFare } from '@/data/pricing';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { useAuthStore } from '@/features/auth/store';
import { useAdminSettingsStore } from '@/features/admin/adminSettingsStore';
import type { PaymentMethod, RideCategory } from '@/types';

const SAMPLE_FARE_KALOUM_MADINA = calculateStandardFare('kaloum', 'madina');

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-sm font-semibold text-foreground">{children}</p>;
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const logout = useAuthStore((s) => s.logout);

  const general = useAdminSettingsStore((s) => s.general);
  const featureFlags = useAdminSettingsStore((s) => s.featureFlags);
  const maintenance = useAdminSettingsStore((s) => s.maintenance);
  const paymentMethods = useAdminSettingsStore((s) => s.paymentMethods);
  const notifications = useAdminSettingsStore((s) => s.notifications);
  const security = useAdminSettingsStore((s) => s.security);
  const setGeneral = useAdminSettingsStore((s) => s.setGeneral);
  const setFeatureFlag = useAdminSettingsStore((s) => s.setFeatureFlag);
  const setMaintenanceEnabled = useAdminSettingsStore((s) => s.setMaintenanceEnabled);
  const setMaintenanceMessage = useAdminSettingsStore((s) => s.setMaintenanceMessage);
  const setPaymentMethodEnabled = useAdminSettingsStore((s) => s.setPaymentMethodEnabled);
  const setNotification = useAdminSettingsStore((s) => s.setNotification);
  const setSecurity = useAdminSettingsStore((s) => s.setSecurity);

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

      <SectionLabel>Général</SectionLabel>
      <Card className="mt-2 space-y-4">
        <Input label="Email support" type="email" value={general.supportEmail} onChange={(e) => setGeneral({ supportEmail: e.target.value })} />
        <Input label="Téléphone support" value={general.supportPhone} onChange={(e) => setGeneral({ supportPhone: e.target.value })} />
      </Card>

      <SectionLabel>Tarification</SectionLabel>
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

      <SectionLabel>Zones</SectionLabel>
      <p className="mt-1 text-xs text-muted-foreground">{NEIGHBORHOODS.length} zones actives à Conakry. Gestion des zones réservée à l'équipe produit.</p>
      <Card className="mt-2">
        <div className="flex flex-wrap gap-1.5">
          {NEIGHBORHOODS.map((n) => (
            <span key={n.id} className="rounded-full border border-border px-2.5 py-1 text-caption text-muted-foreground">
              {n.name}
            </span>
          ))}
        </div>
      </Card>

      <SectionLabel>Paiements</SectionLabel>
      <Card noPadding className="mt-2 divide-y divide-border">
        {(Object.keys(paymentMethods) as PaymentMethod[]).map((method) => (
          <ToggleRow
            key={method}
            label={METHOD_LABEL[method]}
            description={`Accepter ${METHOD_LABEL[method]} comme moyen de paiement.`}
            checked={paymentMethods[method]}
            onChange={() => setPaymentMethodEnabled(method)}
          />
        ))}
      </Card>

      <SectionLabel>Notifications</SectionLabel>
      <Card noPadding className="mt-2 divide-y divide-border">
        <ToggleRow
          label="Alertes par email"
          description="Recevoir un email pour les événements critiques (annulations élevées, incidents)."
          checked={notifications.emailAlerts}
          onChange={() => setNotification('emailAlerts')}
        />
        <ToggleRow
          label="Alertes push"
          description="Recevoir une notification push sur le navigateur admin."
          checked={notifications.pushAlerts}
          onChange={() => setNotification('pushAlerts')}
        />
      </Card>

      <SectionLabel>Sécurité</SectionLabel>
      <Card noPadding className="mt-2 divide-y divide-border">
        <ToggleRow
          label="Double authentification requise"
          description="Exiger la double authentification pour tous les comptes admin."
          checked={security.twoFactorRequired}
          onChange={() => setSecurity('twoFactorRequired')}
        />
        <ToggleRow
          label="Expiration de session"
          description="Déconnecter automatiquement après une période d'inactivité."
          checked={security.sessionTimeout}
          onChange={() => setSecurity('sessionTimeout')}
        />
      </Card>

      <SectionLabel>Fonctionnalités</SectionLabel>
      <Card noPadding className="mt-2 divide-y divide-border">
        <ToggleRow
          label="Nouvelles inscriptions chauffeurs"
          description="Autoriser les nouveaux chauffeurs à créer un compte."
          checked={featureFlags.signupsEnabled}
          onChange={() => setFeatureFlag('signupsEnabled')}
        />
        <ToggleRow
          label="Moto-taxi activé"
          description="Rendre la catégorie Moto-Taxi réservable à Conakry."
          checked={featureFlags.motoEnabled}
          onChange={() => setFeatureFlag('motoEnabled')}
        />
      </Card>

      <SectionLabel>Maintenance</SectionLabel>
      <Card className="mt-2 space-y-4">
        <ToggleRow
          label="Mode maintenance"
          description="Suspendre temporairement les nouvelles courses côté passager."
          checked={maintenance.enabled}
          onChange={setMaintenanceEnabled}
        />
        <Textarea
          label="Message affiché aux utilisateurs"
          value={maintenance.message}
          onChange={(e) => setMaintenanceMessage(e.target.value)}
          rows={3}
        />
      </Card>
    </div>
  );
}
