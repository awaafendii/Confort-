import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Car, Gift, Info, Shield, Wallet } from 'lucide-react';
import { EmptyState, FilterChips } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { formatRelativeTime } from '@/utils/format';
import type { AppNotification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; bg: string; text: string }> = {
  RIDE: { icon: <Car className="h-4 w-4" />, bg: 'bg-primary-50', text: 'text-primary-800' },
  PAYMENT: { icon: <Wallet className="h-4 w-4" />, bg: 'bg-accent-50', text: 'text-accent-700' },
  PROMOTION: { icon: <Gift className="h-4 w-4" />, bg: 'bg-warning/10', text: 'text-warning' },
  SECURITY: { icon: <Shield className="h-4 w-4" />, bg: 'bg-danger/10', text: 'text-danger' },
  SYSTEM: { icon: <Info className="h-4 w-4" />, bg: 'bg-surface', text: 'text-muted-foreground' },
};

/**
 * Route de contenu pertinente selon le type — cette page est partagée entre passager et
 * chauffeur (comptes/espaces distincts), donc la destination dépend aussi du rôle. Les types
 * sans destination claire (promo, système) restent inertes au clic.
 */
function getTypeRoute(type: NotificationType, isDriver: boolean): string | undefined {
  switch (type) {
    case 'RIDE':
      return isDriver ? '/driver/trips' : '/passenger/trips';
    case 'PAYMENT':
      return isDriver ? '/driver/earnings' : '/passenger/wallet';
    case 'SECURITY':
      return isDriver ? '/driver/profile/security' : '/passenger/profile/security';
    default:
      return undefined;
  }
}

type Bucket = 'today' | 'week' | 'older';
const BUCKET_LABELS: Record<Bucket, string> = { today: "Aujourd'hui", week: 'Cette semaine', older: 'Plus ancien' };
const BUCKET_ORDER: Bucket[] = ['today', 'week', 'older'];

function bucketFor(iso: string): Bucket {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= startOfToday) return 'today';
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date >= weekAgo) return 'week';
  return 'older';
}

/** Générique — réutilisée par les espaces passager et chauffeur (filtrées par compte connecté). */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!account) return null;

  const mine = notifications
    .filter((n) => n.userId === account.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = mine.filter((n) => !n.read).length;
  const visible = filter === 'UNREAD' ? mine.filter((n) => !n.read) : mine;

  const groups: Record<Bucket, AppNotification[]> = { today: [], week: [], older: [] };
  visible.forEach((n) => groups[bucketFor(n.createdAt)].push(n));

  const isDriver = account.role === 'DRIVER';

  const open = (n: AppNotification) => {
    markAsRead(n.id);
    const target = getTypeRoute(n.type, isDriver);
    if (target) navigate(target);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="font-display text-h2 text-foreground">Notifications</h1>
      </div>

      {mine.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <FilterChips
            label="Filtrer les notifications"
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'ALL', label: 'Toutes' },
              { id: 'UNREAD', label: `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            ]}
          />
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead(account.id)}
              className="shrink-0 whitespace-nowrap rounded-sm text-body-sm font-semibold text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="Aucune notification"
          description="Vos alertes de courses, paiements et promotions apparaîtront ici."
          className="mt-6"
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" />} title="Aucune notification non lue" description="Vous êtes à jour." className="mt-6" />
      ) : (
        <div className="mt-5 space-y-6">
          {BUCKET_ORDER.filter((b) => groups[b].length > 0).map((bucket) => (
            <div key={bucket}>
              <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{BUCKET_LABELS[bucket]}</p>
              <div className="space-y-2">
                {groups[bucket].map((n) => {
                  const config = TYPE_CONFIG[n.type];
                  const clickable = !!getTypeRoute(n.type, isDriver);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => open(n)}
                      className={cn(
                        'flex w-full items-start gap-3.5 rounded-lg border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        n.read ? 'border-border bg-background' : 'border-primary-200 bg-primary-50/40',
                        clickable && 'hover:border-primary-300'
                      )}
                    >
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.bg, config.text)}>
                        {config.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn('truncate text-body-sm', n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>
                            {n.title}
                          </p>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-700" aria-hidden="true" />}
                        </div>
                        <p className="mt-0.5 text-body-sm text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-caption text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
