import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CreditCard,
  HelpCircle,
  History,
  LogOut,
  MapPin,
  MessageCircle,
  Shield,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { Avatar, Card, Rating, Skeleton } from '@/components/ui';
import { ProfileMenuItem } from '@/features/profile/components/ProfileMenuItem';
import { useAuthStore } from '@/features/auth/store';

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <Skeleton className="h-7 w-24 lg:hidden" />
      <div className="mt-6 flex items-center gap-4 rounded-lg border border-border bg-surface p-5 lg:mt-0">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const logout = useAuthStore((s) => s.logout);
  if (!account) return <ProfileSkeleton />;

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Profil</h1>

      <Card className="mt-6 flex items-center gap-4 lg:mt-0">
        <Avatar name={account.name} src={account.avatar} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-lg font-semibold text-foreground">{account.name}</p>
          <p className="text-body-sm text-muted-foreground">{account.phone}</p>
          {account.email && <p className="truncate text-body-sm text-muted-foreground">{account.email}</p>}
          {typeof account.rating === 'number' && <Rating value={account.rating} showValue size={14} className="mt-1.5" />}
        </div>
      </Card>

      <div className="mt-6 space-y-1">
        <ProfileMenuItem icon={<UserIcon className="h-4 w-4" />} label="Informations personnelles" onClick={() => navigate('/passenger/profile/personal-info')} />
        <ProfileMenuItem icon={<Wallet className="h-4 w-4" />} label="Portefeuille" onClick={() => navigate('/passenger/wallet')} />
        <ProfileMenuItem icon={<CreditCard className="h-4 w-4" />} label="Moyens de paiement" onClick={() => navigate('/passenger/profile/payment-methods')} />
        <ProfileMenuItem icon={<MapPin className="h-4 w-4" />} label="Lieux enregistrés" onClick={() => navigate('/passenger/profile/saved-places')} />
        <ProfileMenuItem icon={<History className="h-4 w-4" />} label="Historique des courses" onClick={() => navigate('/passenger/trips')} />
        <ProfileMenuItem icon={<MessageCircle className="h-4 w-4" />} label="Messages" onClick={() => navigate('/passenger/chat')} />
        <ProfileMenuItem icon={<Bell className="h-4 w-4" />} label="Notifications" onClick={() => navigate('/passenger/notifications')} />
        <ProfileMenuItem icon={<Shield className="h-4 w-4" />} label="Sécurité" onClick={() => navigate('/passenger/profile/security')} />
        <ProfileMenuItem icon={<HelpCircle className="h-4 w-4" />} label="Aide" onClick={() => navigate('/passenger/profile/help')} />
      </div>

      <div className="mt-4 border-t border-border pt-1">
        <ProfileMenuItem
          icon={<LogOut className="h-4 w-4" />}
          label="Se déconnecter"
          danger
          onClick={() => {
            logout();
            navigate('/welcome', { replace: true });
          }}
        />
      </div>
    </div>
  );
}
