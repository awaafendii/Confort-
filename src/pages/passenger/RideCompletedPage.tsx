import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button, Card, Input, Rating, toast } from '@/components/ui';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { useRideHistoryStore } from '@/features/rides/rideHistoryStore';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
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

export default function RideCompletedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CompletedState | null) ?? {};
  const { driver, category, paymentMethod, pickup, destination, distanceKm, durationMin, fare } = state;
  const addRide = useRideHistoryStore((s) => s.addRide);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!driver || !category || !pickup || !destination) navigate('/passenger', { replace: true });
  }, [driver, category, pickup, destination, navigate]);

  if (!driver || !category || !pickup || !destination) return null;

  const finish = () => {
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
      rating,
      ratingComment: comment.trim() || undefined,
      tip: tip || undefined,
    };
    addRide(ride);
    setSubmitted(true);
    toast.success('Merci pour votre note !');
    setTimeout(() => navigate('/passenger', { replace: true }), 900);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-background px-5 pb-8 pt-12">
      <div>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-50 text-secondary-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="font-display text-h2 text-foreground">Trajet terminé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pickup.label} → {destination.label}
          </p>
        </div>

        <Card className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-medium text-foreground">{RIDE_CATEGORIES_CONFIG[category].label}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium text-foreground">{formatDistance(distanceKm ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Durée</span>
            <span className="font-medium text-foreground">{formatDuration(durationMin ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5 text-sm">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-display text-lg font-bold text-foreground">{formatFare(fare ?? 0)}</span>
          </div>
        </Card>

        <Card className="mt-4 text-center">
          <p className="mb-3 text-sm font-medium text-foreground">Comment était votre trajet avec {driver.name.split(' ')[0]} ?</p>
          <div className="flex justify-center">
            <Rating value={rating} interactive onChange={setRating} size={30} />
          </div>
          <Input
            className="mt-4"
            placeholder="Ajouter un commentaire (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Card>

        <Card className="mt-4">
          <p className="mb-3 text-sm font-medium text-foreground">Ajouter un pourboire ?</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => setTip(amount)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  tip === amount ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
                }`}
              >
                {amount === 0 ? 'Non merci' : `+${amount}`}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Button variant="primary" size="lg" className="mt-6 w-full" onClick={finish} loading={submitted}>
        Terminer
      </Button>
    </div>
  );
}
