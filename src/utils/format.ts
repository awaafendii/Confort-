/** Formate un montant en Francs Guinéens (ex. 12 500 FG). */
export function formatFare(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} FG`;
}

/** Formate une distance en km, avec précision adaptée aux courtes distances. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Formate une durée en minutes en texte court (ex. "1 h 05", "8 min"). */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h} h ${m.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
