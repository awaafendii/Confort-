import { useEffect, useRef, useState } from 'react';
import type { GeoPoint, RideStatus } from '@/types';

/**
 * Simule le déplacement d'un chauffeur le long d'un trajet en deux étapes
 * (jusqu'au point de départ, puis jusqu'à la destination), en l'absence
 * d'un flux GPS temps réel réel (celui-ci nécessitera Supabase Realtime /
 * WebSockets, prévu avec le vrai backend en Phase 11).
 *
 * La position est recalculée à partir du temps écoulé réel (Date.now()),
 * pas d'un compteur de ticks — reste correcte même si l'onglet est en
 * arrière-plan et que le navigateur ralentit les timers (voir la Phase 5 :
 * un `setInterval` qui compte simplement ses propres exécutions dérive,
 * un calcul basé sur l'horloge réelle se rattrape toujours).
 */

const DEFAULT_TO_PICKUP_MS = 9000;
const DEFAULT_ARRIVED_PAUSE_MS = 2200;
const DEFAULT_TO_DESTINATION_MS = 18000;
const ARRIVING_THRESHOLD = 0.7;
const TICK_MS = 250;

export interface TripSimulationConfig {
  /** Trajet du point de départ du chauffeur jusqu'au pickup (>= 2 points). */
  toPickupPath: GeoPoint[];
  /** Trajet du pickup jusqu'à la destination (>= 2 points). */
  toDestinationPath: GeoPoint[];
  /** Durée "réelle" affichée (ETA), indépendante du rythme de l'animation démo. */
  estimatedTotalMin: number;
  toPickupMs?: number;
  arrivedPauseMs?: number;
  toDestinationMs?: number;
  onComplete?: () => void;
  /**
   * Côté chauffeur (DriverTrackingPage) : la progression au-delà de "arrivé au pickup" et
   * "arrivé à destination" attend une confirmation explicite (confirmArrival/confirmStart/
   * confirmFinish) plutôt que d'avancer seule au bout d'un délai — corrige le problème
   * principal relevé par l'audit ("le chauffeur est spectateur de sa propre course").
   * Défaut false = comportement automatique inchangé (passager : rien à confirmer soi-même).
   */
  manual?: boolean;
}

export interface TripSimulationState {
  status: RideStatus;
  position: GeoPoint;
  heading: number;
  etaMin: number;
  progress: number;
  /** `manual` uniquement : le trajet a rejoint le pickup et attend confirmArrival(). */
  awaitingArrival: boolean;
  /** `manual` uniquement : l'arrivée est confirmée, en attente de confirmStart(). */
  awaitingStart: boolean;
  /** `manual` uniquement : la destination est atteinte, en attente de confirmFinish(). */
  awaitingFinish: boolean;
  /** Confirme l'arrivée au point de prise en charge (ignoré hors `manual`/`awaitingArrival`). */
  confirmArrival: () => void;
  /** Démarre le trajet vers la destination (ignoré hors `manual`/`awaitingStart`). */
  confirmStart: () => void;
  /** Termine la course et déclenche `onComplete` (ignoré hors `manual`/`awaitingFinish`). */
  confirmFinish: () => void;
}

function distance(a: GeoPoint, b: GeoPoint): number {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

function interpolatePath(path: GeoPoint[], t: number): { position: GeoPoint; heading: number } {
  if (path.length === 1) return { position: path[0], heading: 0 };
  const segLengths = path.slice(1).map((p, i) => distance(path[i], p));
  const total = segLengths.reduce((a, b) => a + b, 0);
  if (total === 0) return { position: path[0], heading: 0 };

  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segLengths.length; i++) {
    const segLen = segLengths[i];
    if (target <= segLen || i === segLengths.length - 1) {
      const segT = segLen === 0 ? 0 : Math.min(1, target / segLen);
      const a = path[i];
      const b = path[i + 1];
      return {
        position: { lat: a.lat + (b.lat - a.lat) * segT, lng: a.lng + (b.lng - a.lng) * segT },
        heading: (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI,
      };
    }
    target -= segLen;
  }
  return { position: path[path.length - 1], heading: 0 };
}

export function useTripSimulation({
  toPickupPath,
  toDestinationPath,
  estimatedTotalMin,
  toPickupMs = DEFAULT_TO_PICKUP_MS,
  arrivedPauseMs = DEFAULT_ARRIVED_PAUSE_MS,
  toDestinationMs = DEFAULT_TO_DESTINATION_MS,
  onComplete,
  manual = false,
}: TripSimulationConfig): TripSimulationState {
  const [, forceTick] = useState(0);
  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);
  const [destinationStartedAt, setDestinationStartedAt] = useState<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    completedRef.current = false;
    setArrivalConfirmed(false);
    setDestinationStartedAt(null);
    const interval = setInterval(() => forceTick((n) => n + 1), TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toPickupPath, toDestinationPath]);

  let status: RideStatus;
  let position: GeoPoint;
  let heading = 0;
  let overallProgress: number;
  let awaitingArrival = false;
  let awaitingStart = false;
  let awaitingFinish = false;

  if (!manual) {
    // Automatique (passager) — comportement d'origine inchangé.
    const totalMs = toPickupMs + arrivedPauseMs + toDestinationMs;
    const elapsed = Math.min(Date.now() - startRef.current, totalMs);
    overallProgress = totalMs === 0 ? 1 : elapsed / totalMs;

    if (elapsed < toPickupMs) {
      const t = elapsed / toPickupMs;
      status = t >= ARRIVING_THRESHOLD ? 'DRIVER_ARRIVING' : 'DRIVER_ASSIGNED';
      ({ position, heading } = interpolatePath(toPickupPath, t));
    } else if (elapsed < toPickupMs + arrivedPauseMs) {
      status = 'DRIVER_ARRIVED';
      position = toPickupPath[toPickupPath.length - 1];
    } else {
      const t = (elapsed - toPickupMs - arrivedPauseMs) / toDestinationMs;
      status = t >= 1 ? 'COMPLETED' : 'IN_PROGRESS';
      ({ position, heading } = interpolatePath(toDestinationPath, t));
    }
  } else {
    // Manuel (chauffeur) — la progression s'arrête à chaque étape en attendant confirmArrival/confirmStart/confirmFinish.
    const elapsedToPickup = Math.min(Date.now() - startRef.current, toPickupMs);
    const tPickup = toPickupMs === 0 ? 1 : elapsedToPickup / toPickupMs;

    if (tPickup < 1) {
      status = tPickup >= ARRIVING_THRESHOLD ? 'DRIVER_ARRIVING' : 'DRIVER_ASSIGNED';
      ({ position, heading } = interpolatePath(toPickupPath, tPickup));
      overallProgress = tPickup * 0.4;
    } else if (!arrivalConfirmed) {
      status = 'DRIVER_ARRIVING';
      position = toPickupPath[toPickupPath.length - 1];
      awaitingArrival = true;
      overallProgress = 0.4;
    } else if (destinationStartedAt === null) {
      status = 'DRIVER_ARRIVED';
      position = toPickupPath[toPickupPath.length - 1];
      awaitingStart = true;
      overallProgress = 0.5;
    } else {
      const elapsedLeg = Math.max(0, Math.min(Date.now() - destinationStartedAt, toDestinationMs));
      const tDest = toDestinationMs === 0 ? 1 : elapsedLeg / toDestinationMs;
      ({ position, heading } = interpolatePath(toDestinationPath, tDest));
      status = 'IN_PROGRESS';
      if (tDest >= 1) awaitingFinish = true;
      overallProgress = 0.5 + tDest * 0.5;
    }
  }

  useEffect(() => {
    if (status === 'COMPLETED' && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [status]);

  const etaMin = status === 'COMPLETED' ? 0 : Math.max(1, Math.ceil(estimatedTotalMin * (1 - overallProgress)));

  const confirmArrival = () => {
    if (manual && awaitingArrival) setArrivalConfirmed(true);
  };
  const confirmStart = () => {
    if (manual && awaitingStart) setDestinationStartedAt(Date.now());
  };
  const confirmFinish = () => {
    if (!manual || !awaitingFinish || completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.();
  };

  return {
    status,
    position,
    heading,
    etaMin,
    progress: overallProgress,
    awaitingArrival,
    awaitingStart,
    awaitingFinish,
    confirmArrival,
    confirmStart,
    confirmFinish,
  };
}
