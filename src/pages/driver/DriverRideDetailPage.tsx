import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, FileQuestion } from 'lucide-react';
import { BackButton, Badge, Card, EmptyState, IconButton, Rating, toast } from '@/components/ui';
import { RideSummary, PriceBreakdown } from '@/components/business';
import { useAuthStore } from '@/features/auth/store';
import { useDriverRideHistoryStore } from '@/features/rides/driverRideHistoryStore';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { Driver, PaymentMethod } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'Carte',
  VISA: 'Carte bancaire',
  KULU: 'Kulu',
};

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <IconButton icon={icon} aria-label={label} variant="outline" onClick={onClick} />
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function DriverRideDetailPage() {
  const { rideId } = useParams();
  const account = useAuthStore((s) => s.account) as Driver | null;
  const ride = useDriverRideHistoryStore((s) => s.rides).find((r) => r.id === rideId);

  if (!ride) {
    return (
      <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
        <BackButton className="mb-2" />
        <EmptyState icon={<FileQuestion className="h-7 w-7" />} title="Course introuvable" description="Ce trajet n'existe plus." className="mt-6" />
      </div>
    );
  }

  const when = new Date(ride.completedAt ?? ride.requestedAt);
  const reportIssue = () => toast.success('Signalement envoyé à notre équipe.');

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2" />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-h2 text-foreground">Détail de la course</h1>
        <Badge variant={ride.status === 'COMPLETED' ? 'success' : 'danger'}>{STATUS_LABEL[ride.status] ?? ride.status}</Badge>
      </div>

      <Card>
        <RideSummary pickup={ride.pickup} destination={ride.destination} />
        <div className="mt-4 space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium text-foreground">{when.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Heure</span>
            <span className="font-medium text-foreground">{when.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {account && (
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Véhicule</span>
              <span className="font-medium text-foreground">
                {account.vehicle.brand} {account.vehicle.model} · {VEHICLE_COLORS[account.vehicle.color].label}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium text-foreground">{formatDistance(ride.distanceKm)}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Durée</span>
            <span className="font-medium text-foreground">{formatDuration(ride.durationMin)}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Paiement</span>
            <span className="font-medium text-foreground">{PAYMENT_LABELS[ride.paymentMethod]}</span>
          </div>
        </div>
      </Card>

      {ride.status === 'COMPLETED' && (
        <Card className="mt-3">
          <PriceBreakdown items={[{ label: RIDE_CATEGORIES_CONFIG[ride.category].label, amount: ride.fare }]} total={ride.fare} />
        </Card>
      )}

      {typeof ride.rating === 'number' && (
        <Card className="mt-3 flex items-center justify-between">
          <span className="text-body-sm font-medium text-foreground">Note reçue</span>
          <Rating value={ride.rating} showValue size={16} />
        </Card>
      )}

      <div className="mt-5 flex justify-center">
        <ActionButton icon={<AlertTriangle className="h-5 w-5" />} label="Signaler" onClick={reportIssue} />
      </div>
    </div>
  );
}
