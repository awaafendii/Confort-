import type { AppNotification } from '@/types';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Notifications de démonstration — passager et chauffeur démo. */
export const SEED_NOTIFICATIONS: AppNotification[] = [
  // Passager (622000001)
  {
    id: 'notif-p1',
    userId: 'demo-passenger',
    type: 'RIDE',
    title: 'Chauffeur trouvé',
    body: 'Mamadou Bah arrive dans 4 minutes en Toyota Corolla blanche.',
    read: false,
    createdAt: hoursAgo(1),
  },
  {
    id: 'notif-p2',
    userId: 'demo-passenger',
    type: 'PAYMENT',
    title: 'Paiement confirmé',
    body: 'Votre course de 3 000 FG a été réglée en Orange Money.',
    read: true,
    createdAt: hoursAgo(26),
  },
  {
    id: 'notif-p3',
    userId: 'demo-passenger',
    type: 'PROMOTION',
    title: 'Offre du week-end',
    body: '-20 % sur votre prochaine course VIP jusqu’à dimanche.',
    read: false,
    createdAt: hoursAgo(30),
  },
  {
    id: 'notif-p4',
    userId: 'demo-passenger',
    type: 'SECURITY',
    title: 'Nouvelle connexion détectée',
    body: 'Votre compte a été connecté depuis un nouvel appareil à Conakry.',
    read: true,
    createdAt: hoursAgo(70),
  },
  {
    id: 'notif-p5',
    userId: 'demo-passenger',
    type: 'SYSTEM',
    title: 'Bienvenue sur Confort+',
    body: 'Merci d’avoir rejoint Confort+ — votre mobilité premium à Conakry.',
    read: true,
    createdAt: hoursAgo(120),
  },

  // Chauffeur (622001122)
  {
    id: 'notif-d1',
    userId: 'demo-driver',
    type: 'RIDE',
    title: 'Zone à forte demande',
    body: 'Beaucoup de courses sont demandées autour de Kaloum en ce moment.',
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'notif-d2',
    userId: 'demo-driver',
    type: 'PAYMENT',
    title: 'Gains disponibles',
    body: 'Vos gains du jour sont prêts — vous pouvez demander un retrait.',
    read: false,
    createdAt: hoursAgo(5),
  },
  {
    id: 'notif-d3',
    userId: 'demo-driver',
    type: 'PROMOTION',
    title: 'Bonus chauffeur',
    body: 'Complétez 10 courses cette semaine et gagnez 10 000 FG de bonus.',
    read: true,
    createdAt: hoursAgo(48),
  },
  {
    id: 'notif-d4',
    userId: 'demo-driver',
    type: 'SECURITY',
    title: 'Document vérifié',
    body: 'Votre permis de conduire a été validé par notre équipe.',
    read: true,
    createdAt: hoursAgo(96),
  },
  {
    id: 'notif-d5',
    userId: 'demo-driver',
    type: 'SYSTEM',
    title: 'Nouveautés Confort+',
    body: 'Le suivi temps réel est maintenant disponible pour vos courses.',
    read: false,
    createdAt: hoursAgo(150),
  },
];
