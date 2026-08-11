import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Badge, Card, EmptyState, Rating } from '@/components/ui';
import { useRideHistoryStore } from '@/features/rides/rideHistoryStore';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

export default function RideDetailPage() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const ride = useRideHistoryStore((s) => s.rides).find((r) => r.id === rideId);

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      {!ride ? (
        <EmptyState icon={<FileQuestion className="h-7 w-7" />} title="Course introuvable" description="Ce trajet n'existe plus." />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-h2 text-foreground">Détail de la course</h1>
            <Badge variant={ride.status === 'COMPLETED' ? 'success' : 'danger'}>{STATUS_LABEL[ride.status] ?? ride.status}</Badge>
          </div>

          <Card>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary-700" />
                <span className="my-0.5 h-6 w-px border-l border-dashed border-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary-800" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm font-medium text-foreground">{ride.pickup.label}</p>
                <p className="text-sm font-medium text-foreground">{ride.destination.label}</p>
              </div>
            </div>
          </Card>

          <Card className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Catégorie</span>
              <span className="font-medium text-foreground">{RIDE_CATEGORIES_CONFIG[ride.category].label}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium text-foreground">{formatDistance(ride.distanceKm)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium text-foreground">{formatDuration(ride.durationMin)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paiement</span>
              <span className="font-medium text-foreground">{ride.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5 text-sm">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-lg font-bold text-foreground">{formatFare(ride.fare)}</span>
            </div>
          </Card>

          {typeof ride.rating === 'number' && (
            <Card className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Votre note</span>
              <Rating value={ride.rating} showValue size={16} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
