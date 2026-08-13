import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { RideSummary } from '@/components/business';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { RideStop } from '@/types';

interface CompletedState {
  passengerName?: string;
  pickup?: RideStop;
  destination?: RideStop;
  distanceKm?: number;
  durationMin?: number;
  fare?: number;
}

export default function DriverRideCompletedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CompletedState | null) ?? {};
  const { passengerName, pickup, destination, distanceKm, durationMin, fare } = state;

  if (!pickup || !destination) {
    navigate('/driver', { replace: true });
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-background px-5 pb-8 pt-12">
      <div>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="font-display text-h2 text-foreground">Course terminée</p>
          {passengerName && <p className="mt-1 text-body text-muted-foreground">Avec {passengerName.split(' ')[0]}</p>}
        </div>

        <Card>
          <RideSummary pickup={pickup} destination={destination} />
          <div className="mt-4 space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium text-foreground">{formatDistance(distanceKm ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium text-foreground">{formatDuration(durationMin ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="font-semibold text-foreground">Gains de la course</span>
              <span className="font-display text-h3 text-foreground">{formatFare(fare ?? 0)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/driver', { replace: true })}>
          Terminer
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/driver/earnings', { replace: true })}>
          Voir mes gains
        </Button>
      </div>
    </div>
  );
}
