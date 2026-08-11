import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Car, ChevronRight, History } from 'lucide-react';
import { Badge, Card, EmptyState } from '@/components/ui';
import { useRideHistoryStore } from '@/features/rides/rideHistoryStore';
import { formatFare } from '@/utils/format';
import type { Ride } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<Ride['status'], { label: string; variant: 'success' | 'danger' | 'neutral' }> = {
  COMPLETED: { label: 'Terminée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  REQUESTED: { label: 'Demandée', variant: 'neutral' },
  SEARCHING_DRIVER: { label: 'Recherche', variant: 'neutral' },
  DRIVER_ASSIGNED: { label: 'Assignée', variant: 'neutral' },
  DRIVER_ARRIVING: { label: 'En approche', variant: 'neutral' },
  DRIVER_ARRIVED: { label: 'Chauffeur arrivé', variant: 'neutral' },
  IN_PROGRESS: { label: 'En cours', variant: 'neutral' },
};

export default function TripsPage() {
  const navigate = useNavigate();
  const rides = useRideHistoryStore((s) => s.rides);

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Courses</h1>

      {rides.length === 0 ? (
        <EmptyState icon={<History className="h-7 w-7" />} title="Aucune course" description="Vos trajets apparaîtront ici." className="mt-6" />
      ) : (
        <div className="mt-6 space-y-3">
          {rides.map((ride) => {
            const status = STATUS_BADGE[ride.status];
            const isMoto = ride.vehicleType === 'MOTO';
            return (
              <Card key={ride.id} interactive onClick={() => navigate(`/passenger/trips/${ride.id}`)} className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                  {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {ride.pickup.label} → {ride.destination.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(ride.requestedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatFare(ride.fare)}</p>
                  <Badge variant={status.variant} className="mt-1">
                    {status.label}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
