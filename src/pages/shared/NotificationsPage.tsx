import React from 'react';
import { Bell, Car, Gift, Info, Shield, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { formatRelativeTime } from '@/utils/format';
import type { NotificationType } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; bg: string; text: string }> = {
  RIDE: { icon: <Car className="h-4 w-4" />, bg: 'bg-primary-50', text: 'text-primary-800' },
  PAYMENT: { icon: <Wallet className="h-4 w-4" />, bg: 'bg-secondary-50', text: 'text-secondary-700' },
  PROMOTION: { icon: <Gift className="h-4 w-4" />, bg: 'bg-warning/10', text: 'text-warning' },
  SECURITY: { icon: <Shield className="h-4 w-4" />, bg: 'bg-danger/10', text: 'text-danger' },
  SYSTEM: { icon: <Info className="h-4 w-4" />, bg: 'bg-surface', text: 'text-muted-foreground' },
};

/** Générique — réutilisée par les espaces passager et chauffeur (filtrées par compte connecté). */
export default function NotificationsPage() {
  const account = useAuthStore((s) => s.account);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);

  if (!account) return null;

  const mine = notifications
    .filter((n) => n.userId === account.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = mine.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="font-display text-h2 text-foreground">Notifications</h1>
      </div>

      {unreadCount > 0 && (
        <div className="mt-2 flex justify-end">
          <button onClick={() => markAllAsRead(account.id)} className="text-sm font-semibold text-primary-700 hover:underline">
            Tout marquer comme lu
          </button>
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="Aucune notification"
          description="Vos alertes de courses, paiements et promotions apparaîtront ici."
          className="mt-6"
        />
      ) : (
        <div className="mt-4 space-y-2">
          {mine.map((n) => {
            const config = TYPE_CONFIG[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-colors',
                  n.read ? 'border-border bg-background' : 'border-primary-200 bg-primary-50/40'
                )}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', config.bg, config.text)}>
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn('truncate text-sm', n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>
                      {n.title}
                    </p>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-700" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
