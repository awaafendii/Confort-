import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Car, Clock, FileText, HelpCircle, LogOut, ShieldCheck, Shield as ShieldIcon, User as UserIcon } from 'lucide-react';
import { Avatar, Badge, Card, Rating, Skeleton } from '@/components/ui';
import { ProfileMenuItem } from '@/features/profile/components/ProfileMenuItem';
import { useAuthStore } from '@/features/auth/store';
import type { Driver, DriverDocument } from '@/types';

const REQUIRED_DOC_TYPES: DriverDocument['type'][] = ['PERMIS', 'CARTE_IDENTITE', 'CARTE_GRISE', 'ASSURANCE'];

const VERIFICATION_CONFIG: Record<Driver['verification'], { label: string; description: string; variant: 'success' | 'warning' | 'danger' }> = {
  VERIFIED: { label: 'Compte vérifié', description: 'Votre compte a été validé par notre équipe.', variant: 'success' },
  PENDING: { label: 'Vérification en cours', description: "Nous examinons votre dossier — cela peut prendre jusqu'à 48 h.", variant: 'warning' },
  SUSPENDED: { label: 'Compte suspendu', description: 'Contactez le support pour régulariser votre situation.', variant: 'danger' },
};

function DriverProfileSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <Skeleton className="h-7 w-24" />
      <div className="mt-6 flex items-center gap-4 rounded-lg border border-border bg-surface p-5 lg:mt-0">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-14 w-full rounded-lg" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account) as Driver | null;
  const logout = useAuthStore((s) => s.logout);
  if (!account) return <DriverProfileSkeleton />;

  const verificationInfo = VERIFICATION_CONFIG[account.verification];

  const missingOrRejected = REQUIRED_DOC_TYPES.filter((type) => {
    const doc = account.documents.find((d) => d.type === type);
    return !doc || doc.status !== 'VALIDATED';
  });
  const hasRejected = REQUIRED_DOC_TYPES.some((type) => account.documents.find((d) => d.type === type)?.status === 'REJECTED');

  const documentsBadge =
    missingOrRejected.length === 0 ? undefined : (
      <Badge variant={hasRejected ? 'danger' : 'warning'} className="shrink-0">
        {missingOrRejected.length === REQUIRED_DOC_TYPES.length ? 'À fournir' : `${missingOrRejected.length} en attente`}
      </Badge>
    );

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Profil</h1>

      <Card className="mt-6 flex items-center gap-4 lg:mt-0">
        <Avatar name={account.name} src={account.avatar} size="xl" status={account.status === 'ONLINE' ? 'online' : 'offline'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-lg font-semibold text-foreground">{account.name}</p>
          <p className="text-body-sm text-muted-foreground">{account.phone}</p>
          <Rating value={account.rating} showValue size={14} className="mt-1.5" />
        </div>
      </Card>

      <Card className="mt-4 flex items-start gap-3">
        {verificationInfo.variant === 'success' ? (
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-700" />
        ) : (
          <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${verificationInfo.variant === 'danger' ? 'text-danger' : 'text-warning'}`} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-body-sm font-semibold text-foreground">{verificationInfo.label}</p>
            <Badge variant={verificationInfo.variant}>{account.verification === 'VERIFIED' ? 'Vérifié' : account.verification === 'PENDING' ? 'En attente' : 'Suspendu'}</Badge>
          </div>
          <p className="mt-0.5 text-caption text-muted-foreground">{verificationInfo.description}</p>
        </div>
      </Card>

      <div className="mt-6 space-y-1">
        <ProfileMenuItem icon={<UserIcon className="h-4 w-4" />} label="Informations personnelles" onClick={() => navigate('/driver/profile/personal-info')} />
        <ProfileMenuItem icon={<Car className="h-4 w-4" />} label="Véhicule" onClick={() => navigate('/driver/profile/vehicle')} />
        <ProfileMenuItem icon={<FileText className="h-4 w-4" />} label="Documents" badge={documentsBadge} onClick={() => navigate('/driver/profile/documents')} />
        <ProfileMenuItem icon={<Clock className="h-4 w-4" />} label="Historique des courses" onClick={() => navigate('/driver/trips')} />
        <ProfileMenuItem icon={<ShieldIcon className="h-4 w-4" />} label="Sécurité" onClick={() => navigate('/driver/profile/security')} />
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
