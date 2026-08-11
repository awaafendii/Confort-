import React from 'react';
import { Bike, Car, History } from 'lucide-react';
import { Badge, Card, EmptyState } from '@/components/ui';
import { MOCK_DRIVER_RIDES } from '@/data/mockDriverRides';
import { formatFare } from '@/utils/format';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DriverTripsPage() {
  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Courses</h1>

      {MOCK_DRIVER_RIDES.length === 0 ? (
        <EmptyState icon={<History className="h-7 w-7" />} title="Aucune course" description="Vos courses effectuées apparaîtront ici." className="mt-6" />
      ) : (
        <div className="mt-6 space-y-3">
          {MOCK_DRIVER_RIDES.map((ride) => {
            const isMoto = ride.vehicleType === 'MOTO';
            return (
              <Card key={ride.id} className="flex items-center gap-3.5">
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
                  <p className="text-sm font-bold text-secondary-700">+{formatFare(ride.fare)}</p>
                  <Badge variant="success" className="mt-1">
                    Terminée
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
