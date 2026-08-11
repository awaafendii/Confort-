import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/features/auth/store';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

function UnreadDot() {
  return <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-background bg-danger" aria-hidden="true" />;
}

/** Lien "aller au contenu" — invisible tant qu'il n'a pas le focus clavier, pour sauter la nav répétitive. */
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary-800 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
    >
      Aller au contenu
    </a>
  );
}

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

export interface AppShellProps {
  navItems: NavItem[];
  notificationsTo: string;
}

/**
 * Coquille applicative responsive : bottom navigation en mobile, sidebar +
 * top bar distincts en desktop (pas un simple agrandissement CSS de la
 * version mobile). Réutilisée par les espaces passager (Phase 3), chauffeur
 * (Phase 5) et admin (Phase 9) via des `navItems` différents.
 */
export const AppShell: React.FC<AppShellProps> = ({ navItems, notificationsTo }) => {
  const isDesktop = useIsDesktop();
  const account = useAuthStore((s) => s.account);
  const notifications = useNotificationsStore((s) => s.notifications);
  const navigate = useNavigate();
  const location = useLocation();

  if (!account) return null;

  const hasUnread = notifications.some((n) => n.userId === account.id && !n.read);

  if (isDesktop) {
    const activeLabel = navItems.find((item) => location.pathname === item.to || (!item.end && location.pathname.startsWith(item.to)))?.label;
    return (
      <div className="flex min-h-screen bg-background">
        <SkipToContent />
        <aside className="flex w-64 shrink-0 flex-col border-r border-border px-4 py-6">
          <div className="mb-8 flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-800">
              <span className="font-display text-sm font-extrabold text-white">C+</span>
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              Confort<span className="text-secondary-700">+</span>
            </span>
          </div>

          <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-50 text-primary-800' : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                  )
                }
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.to === notificationsTo && hasUnread && <UnreadDot />}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => navigate(navItems[navItems.length - 1].to)}
            className="flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface"
          >
            <Avatar name={account.name} src={account.avatar} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
              <p className="truncate text-xs text-muted-foreground">{account.phone}</p>
            </div>
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-8">
            <p className="font-display text-lg font-bold text-foreground">{activeLabel}</p>
            <button
              aria-label="Notifications"
              onClick={() => navigate(notificationsTo)}
              className="tap-target relative flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
            >
              <Bell className="h-5 w-5" />
              {hasUnread && <UnreadDot />}
            </button>
          </header>
          <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SkipToContent />
      <main id="main-content" tabIndex={-1} className="pb-20 outline-none">
        <Outlet />
      </main>
      <nav
        aria-label="Navigation principale"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-border bg-background/95 backdrop-blur"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex min-w-[64px] flex-1 shrink-0 flex-col items-center gap-1 py-2.5 text-[11px] font-medium tap-target',
                isActive ? 'text-primary-800' : 'text-muted-foreground'
              )
            }
          >
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {item.to === notificationsTo && hasUnread && <UnreadDot />}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
