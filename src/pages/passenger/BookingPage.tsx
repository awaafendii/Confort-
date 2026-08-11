import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Bike, Car, CheckCircle2, CreditCard, Smartphone, Users } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { getNeighborhood } from '@/data/neighborhoods';
import { calculateFaresByCategory, calculateRouteEstimate, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { PaymentMethod, RideCategory } from '@/types';

const ORIGIN_ID = 'kaloum';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'ESPECE', label: 'Espèces', icon: <Banknote className="h-4 w-4" /> },
  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'MOMO', label: 'MoMo', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'VISA', label: 'Carte', icon: <CreditCard className="h-4 w-4" /> },
];

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const destinationId = (location.state as { destinationId?: string } | null)?.destinationId;

  const [category, setCategory] = useState<RideCategory>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECE');

  useEffect(() => {
    if (!destinationId) navigate('/passenger', { replace: true });
  }, [destinationId, navigate]);

  const fares = useMemo(() => (destinationId ? calculateFaresByCategory(ORIGIN_ID, destinationId) : null), [destinationId]);
  const estimate = useMemo(
    () => (destinationId ? calculateRouteEstimate(ORIGIN_ID, destinationId, category) : null),
    [destinationId, category]
  );

  if (!destinationId || !fares || !estimate) return null;

  const origin = getNeighborhood(ORIGIN_ID)!;
  const destination = getNeighborhood(destinationId)!;

  const confirm = () => {
    navigate('/passenger/booking/matching', { state: { destinationId, category, paymentMethod } });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <div className="relative h-56 bg-surface">
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="tap-target absolute left-4 top-4 z-10 flex items-center justify-center rounded-full bg-background text-muted-foreground shadow-card hover:bg-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <Car className="h-8 w-8" />
          <p className="text-xs font-medium">Aperçu de l'itinéraire — carte réelle en Phase 6</p>
        </div>
      </div>

      <div className="rounded-t-2xl border-t border-border bg-background px-5 pb-8 pt-5 shadow-sheet">
        <div className="mb-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary-700" />
              <span className="my-0.5 h-6 w-px border-l border-dashed border-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary-800" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-foreground">{origin.name}</p>
              <p className="text-sm font-medium text-foreground">{destination.name}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistance(estimate.distanceKm)} · {formatDuration(estimate.durationMin)}
          </p>
        </div>

        <div className="space-y-3">
          {(Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((cat) => {
            const config = RIDE_CATEGORIES_CONFIG[cat];
            const isMoto = cat === 'MOTO_SINGLE';
            const selected = category === cat;
            return (
              <Card key={cat} interactive selected={selected} onClick={() => setCategory(cat)} className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                  {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{config.label}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {config.capacity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-bold text-foreground">{formatFare(fares[cat])}</p>
                  {selected && <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-secondary-700" />}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-foreground">Paiement</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                  paymentMethod === option.id ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={confirm}>
          Confirmer la course — {formatFare(fares[category])}
        </Button>
      </div>
    </div>
  );
}
