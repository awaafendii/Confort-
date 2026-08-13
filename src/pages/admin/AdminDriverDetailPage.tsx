import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Banknote, Car, FileText, Percent, Star, TrendingUp } from 'lucide-react';
import { Avatar, BackButton, Badge, Button, Card, ConfirmDialog, EmptyState, StatCard } from '@/components/ui';
import { RideCard } from '@/components/business';
import { DOC_TYPES, DOC_STATUS_BADGE, DriverStatusBadge, isImageUrl, RIDE_STATUS_CONFIG } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatFare } from '@/utils/format';
import type { DriverVerificationStatus } from '@/types';

const ACTION_LABEL: Record<DriverVerificationStatus, { title: string; confirm: string; destructive: boolean }> = {
  VERIFIED: { title: 'Vérifier ce chauffeur ?', confirm: 'Vérifier', destructive: false },
  SUSPENDED: { title: 'Suspendre ce chauffeur ?', confirm: 'Suspendre', destructive: true },
  PENDING: { title: 'Repasser en attente ?', confirm: 'Confirmer', destructive: false },
};

export default function AdminDriverDetailPage() {
  const { driverId } = useParams();
  const drivers = useAdminStore((s) => s.drivers);
  const setDriverVerification = useAdminStore((s) => s.setDriverVerification);
  const [pendingAction, setPendingAction] = useState<DriverVerificationStatus | null>(null);

  const driver = drivers.find((d) => d.id === driverId);

  if (!driver) {
    return (
      <div className="mx-auto max-w-4xl px-5 pb-10 pt-8 lg:px-8">
        <BackButton className="mb-2" to="/admin/drivers" />
        <EmptyState icon={<Car className="h-7 w-7" />} title="Chauffeur introuvable" description="Ce profil n'existe pas ou plus." className="mt-6" />
      </div>
    );
  }

  const color = VEHICLE_COLORS[driver.vehicle.color];
  const rides = MOCK_PLATFORM_RIDES.filter((r) => r.driverId === driver.id).slice(0, 8);

  const confirmAction = () => {
    if (!pendingAction) return;
    setDriverVerification(driver.id, pendingAction);
    setPendingAction(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-10 pt-8 lg:px-8">
      <BackButton className="mb-2" to="/admin/drivers" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={driver.name} src={driver.avatar} size="lg" status={driver.status === 'ONLINE' ? 'online' : 'offline'} />
          <div>
            <h1 className="font-display text-h2 text-foreground">{driver.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <DriverStatusBadge status={driver.verification} />
              <span className="text-body-sm text-muted-foreground">{driver.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {driver.verification === 'SUSPENDED' ? (
            <Button variant="primary" onClick={() => setPendingAction('VERIFIED')}>
              Réactiver
            </Button>
          ) : (
            <>
              {driver.verification === 'PENDING' && (
                <Button variant="primary" onClick={() => setPendingAction('VERIFIED')}>
                  Vérifier
                </Button>
              )}
              <Button variant="danger" onClick={() => setPendingAction('SUSPENDED')}>
                Suspendre
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Note" value={driver.rating.toFixed(2)} icon={<Star className="h-5 w-5" />} />
        <StatCard label="Courses" value={String(driver.tripsCompleted)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Acceptation" value={`${Math.round(driver.acceptanceRate * 100)}%`} icon={<Percent className="h-5 w-5" />} />
        <StatCard label="Gains du jour" value={formatFare(driver.earningsToday)} icon={<Banknote className="h-5 w-5" />} />
      </div>

      <Card className="mt-5">
        <p className="mb-3 text-body-sm font-semibold text-foreground">Véhicule</p>
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <Car className="h-5 w-5" />
          </span>
          <div>
            <p className="text-body font-medium text-foreground">
              {driver.vehicle.brand} {driver.vehicle.model}
            </p>
            <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
              {color.label} · {driver.vehicle.plateNumber}
            </p>
          </div>
        </div>
      </Card>

      <p className="mb-3 mt-8 text-body-sm font-semibold text-foreground">Documents</p>
      <div className="space-y-2.5">
        {DOC_TYPES.map(({ type, label }) => {
          const doc = driver.documents.find((d) => d.type === type);
          const status = DOC_STATUS_BADGE[doc?.status ?? 'MISSING'];
          const showPreview = doc && isImageUrl(doc.url);
          return (
            <Card key={type}>
              <div className="flex items-center gap-3.5">
                {showPreview ? (
                  <a
                    href={doc!.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <img src={doc!.url} alt={`Aperçu — ${label}`} className="h-11 w-11 rounded-xl object-cover" />
                  </a>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-foreground">{label}</p>
                  <Badge variant={status.variant} className="mt-1">
                    {status.label}
                  </Badge>
                </div>
              </div>
              {doc?.status === 'REJECTED' && doc.rejectionReason && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/5 p-3 text-caption text-danger">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    <span className="font-semibold">Motif : </span>
                    {doc.rejectionReason}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mb-3 mt-8 text-body-sm font-semibold text-foreground">Courses récentes</p>
      {rides.length > 0 ? (
        <div className="space-y-2">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} statusConfig={RIDE_STATUS_CONFIG} />
          ))}
        </div>
      ) : (
        <p className="text-body-sm text-muted-foreground">Aucune course enregistrée.</p>
      )}

      {pendingAction && (
        <ConfirmDialog
          open={!!pendingAction}
          onClose={() => setPendingAction(null)}
          onConfirm={confirmAction}
          title={ACTION_LABEL[pendingAction].title}
          description={`${driver.name} — cette action est enregistrée dans le journal d'audit.`}
          confirmLabel={ACTION_LABEL[pendingAction].confirm}
          destructive={ACTION_LABEL[pendingAction].destructive}
        />
      )}
    </div>
  );
}
