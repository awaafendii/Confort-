import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button, Card, Rating, Textarea, toast } from '@/components/ui';
import { RideSummary } from '@/components/business';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { useRideHistoryStore } from '@/features/rides/rideHistoryStore';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Driver, PaymentMethod, Ride, RideCategory, RideStop } from '@/types';

interface CompletedState {
  driver?: Driver;
  category?: RideCategory;
  paymentMethod?: PaymentMethod;
  pickup?: RideStop;
  destination?: RideStop;
  distanceKm?: number;
  durationMin?: number;
  fare?: number;
}

const TIP_OPTIONS = [0, 500, 1000, 2000];
/** Laisse le temps de lire la confirmation avant de repartir vers l'accueil (brief : pas de redirection trop rapide). */
const RETURN_DELAY_MS = 1500;

export default function RideCompletedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CompletedState | null) ?? {};
  const { driver, category, paymentMethod, pickup, destination, distanceKm, durationMin, fare } = state;
  const addRide = useRideHistoryStore((s) => s.addRide);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);
  const [submitting, setSubmitting] = useState<'finish' | 'receipt' | null>(null);

  useEffect(() => {
    if (!driver || !category || !pickup || !destination) navigate('/passenger', { replace: true });
  }, [driver, category, pickup, destination, navigate]);

  if (!driver || !category || !pickup || !destination) return null;

  const persistRide = (): Ride => {
    const now = new Date().toISOString();
    const ride: Ride = {
      id: `ride-${Date.now()}`,
      passengerId: 'demo-passenger',
      driverId: driver.id,
      pickup,
      destination,
      category,
      vehicleType: driver.vehicle.type,
      status: 'COMPLETED',
      distanceKm: distanceKm ?? 0,
      durationMin: durationMin ?? 0,
      fare: fare ?? 0,
      currency: 'GNF',
      paymentMethod: paymentMethod ?? 'ESPECE',
      requestedAt: now,
      completedAt: now,
      rating: rating || undefined,
      ratingComment: comment.trim() || undefined,
      tip: tip || undefined,
    };
    addRide(ride);
    return ride;
  };

  const finish = () => {
    if (submitting) return;
    setSubmitting('finish');
    persistRide();
    toast.success('Merci pour votre note !');
    setTimeout(() => navigate('/passenger', { replace: true }), RETURN_DELAY_MS);
  };

  const viewReceipt = () => {
    if (submitting) return;
    setSubmitting('receipt');
    const ride = persistRide();
    navigate(`/passenger/trips/${ride.id}`, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-background px-5 pb-8 pt-12">
      <div>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="font-display text-h2 text-foreground">Trajet terminé</p>
        </div>

        <Card>
          <RideSummary pickup={pickup} destination={destination} />
          <div className="mt-4 space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Catégorie</span>
              <span className="font-medium text-foreground">{RIDE_CATEGORIES_CONFIG[category].label}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium text-foreground">{formatDistance(distanceKm ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium text-foreground">{formatDuration(durationMin ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-h3 text-foreground">{formatFare(fare ?? 0)}</span>
            </div>
          </div>
        </Card>

        <Card className="mt-4 text-center">
          <p className="mb-3 text-body font-medium text-foreground">Comment était votre trajet avec {driver.name.split(' ')[0]} ?</p>
          <div className="flex justify-center">
            <Rating value={rating} interactive onChange={setRating} size={30} />
          </div>
          <Textarea className="mt-4" placeholder="Un commentaire ?" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
        </Card>

        <Card className="mt-4">
          <p className="mb-3 text-body font-medium text-foreground">Ajouter un pourboire ?</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTip(amount)}
                className={cn(
                  'rounded-md border py-2.5 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  tip === amount ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
                )}
              >
                {amount === 0 ? 'Non merci' : `+${amount}`}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        <Button variant="primary" size="lg" className="w-full" onClick={finish} loading={submitting === 'finish'} disabled={submitting !== null && submitting !== 'finish'}>
          Terminer
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={viewReceipt}
          loading={submitting === 'receipt'}
          disabled={submitting !== null && submitting !== 'receipt'}
        >
          Voir le reçu
        </Button>
      </div>
    </div>
  );
}
