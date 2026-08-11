import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, FileText, HelpCircle, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { Avatar, Card, Rating } from '@/components/ui';
import { ProfileMenuItem } from '@/features/profile/components/ProfileMenuItem';
import { useAuthStore } from '@/features/auth/store';
import type { Driver } from '@/types';

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account) as Driver | null;
  const logout = useAuthStore((s) => s.logout);
  if (!account) return null;

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Profil</h1>

      <Card className="mt-6 flex items-center gap-4 lg:mt-0">
        <Avatar name={account.name} src={account.avatar} size="xl" status={account.status === 'ONLINE' ? 'online' : 'offline'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-foreground">{account.name}</p>
          <p className="text-sm text-muted-foreground">{account.phone}</p>
          <Rating value={account.rating} showValue size={14} className="mt-1.5" />
        </div>
      </Card>

      <div className="mt-6 space-y-1">
        <ProfileMenuItem icon={<UserIcon className="h-4 w-4" />} label="Informations personnelles" onClick={() => navigate('/driver/profile/personal-info')} />
        <ProfileMenuItem icon={<Car className="h-4 w-4" />} label="Véhicule" onClick={() => navigate('/driver/profile/vehicle')} />
        <ProfileMenuItem icon={<FileText className="h-4 w-4" />} label="Documents" onClick={() => navigate('/driver/profile/documents')} />
        <ProfileMenuItem icon={<Shield className="h-4 w-4" />} label="Sécurité" onClick={() => navigate('/driver/profile/security')} />
        <ProfileMenuItem icon={<HelpCircle className="h-4 w-4" />} label="Aide" onClick={() => navigate('/driver/profile/help')} />
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
