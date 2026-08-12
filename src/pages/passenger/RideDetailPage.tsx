import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Download, FileQuestion, RotateCcw, Share2 } from 'lucide-react';
import { BackButton, Badge, Button, Card, EmptyState, IconButton, Rating, toast } from '@/components/ui';
import { RideSummary, PriceBreakdown } from '@/components/business';
import { useRideHistoryStore } from '@/features/rides/rideHistoryStore';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { PaymentMethod } from '@/types';

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

export default function RideDetailPage() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const ride = useRideHistoryStore((s) => s.rides).find((r) => r.id === rideId);
  const driver = ride ? MOCK_DRIVERS_POOL.find((d) => d.id === ride.driverId) : undefined;

  if (!ride) {
    return (
      <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
        <BackButton className="mb-2" />
        <EmptyState icon={<FileQuestion className="h-7 w-7" />} title="Course introuvable" description="Ce trajet n'existe plus." className="mt-6" />
      </div>
    );
  }

  const when = new Date(ride.completedAt ?? ride.requestedAt);

  const shareReceipt = async () => {
    const text = `Reçu Confort+ — ${ride.pickup.label} → ${ride.destination.label}, ${formatFare(ride.fare)}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Reçu Confort+', text });
      } catch {
        // L'utilisateur a annulé la boîte de partage native — rien à signaler.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success('Reçu copié.');
    } else {
      toast('Partage indisponible sur cet appareil.');
    }
  };

  const downloadReceipt = () => toast('Téléchargement du reçu — bientôt disponible.');
  const reportIssue = () => toast.success('Signalement envoyé à notre équipe.');
  const redoRide = () => {
    const neighborhoodId = NEIGHBORHOODS.find((n) => n.name === ride.destination.label)?.id;
    if (neighborhoodId) navigate('/passenger/booking', { state: { destinationId: neighborhoodId } });
    else navigate('/passenger/search');
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2" />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-h2 text-foreground">Reçu de course</h1>
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
          {driver && (
            <>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-muted-foreground">Chauffeur</span>
                <span className="font-medium text-foreground">{driver.name}</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-muted-foreground">Véhicule</span>
                <span className="font-medium text-foreground">
                  {driver.vehicle.brand} {driver.vehicle.model} · {VEHICLE_COLORS[driver.vehicle.color].label}
                </span>
              </div>
            </>
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

      <Card className="mt-3">
        <PriceBreakdown items={[{ label: RIDE_CATEGORIES_CONFIG[ride.category].label, amount: ride.fare }]} total={ride.fare} />
      </Card>

      {typeof ride.rating === 'number' && (
        <Card className="mt-3 flex items-center justify-between">
          <span className="text-body-sm font-medium text-foreground">Votre note</span>
          <Rating value={ride.rating} showValue size={16} />
        </Card>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <ActionButton icon={<Download className="h-5 w-5" />} label="Télécharger" onClick={downloadReceipt} />
        <ActionButton icon={<Share2 className="h-5 w-5" />} label="Partager" onClick={shareReceipt} />
        <ActionButton icon={<AlertTriangle className="h-5 w-5" />} label="Signaler" onClick={reportIssue} />
      </div>

      <Button variant="primary" size="lg" className="mt-4 w-full" onClick={redoRide}>
        <RotateCcw className="h-4 w-4" /> Refaire cette course
      </Button>
    </div>
  );
}
