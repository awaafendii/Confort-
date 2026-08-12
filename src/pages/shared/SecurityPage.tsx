import React, { useState } from 'react';
import { AlertTriangle, Laptop, Lock, Shield, Smartphone } from 'lucide-react';
import { BackButton, Button, Card, ConfirmDialog, Input, Skeleton, Switch, toast } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { DEFAULT_SESSIONS, useSecurityStore } from '@/features/security/securityStore';
import { formatRelativeTime } from '@/utils/format';

function SecuritySkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <Skeleton className="h-7 w-32" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
      <Skeleton className="mt-6 h-16 w-full rounded-lg" />
      <Skeleton className="mt-6 h-16 w-full rounded-lg" />
    </div>
  );
}

export default function SecurityPage() {
  const account = useAuthStore((s) => s.account);
  const twoFactor = useSecurityStore((s) => s.twoFactor);
  const sessions = useSecurityStore((s) => s.sessions);
  const deletionRequestedAt = useSecurityStore((s) => s.deletionRequestedAt);
  const toggleTwoFactor = useSecurityStore((s) => s.toggleTwoFactor);
  const revokeSession = useSecurityStore((s) => s.revokeSession);
  const requestDeletion = useSecurityStore((s) => s.requestDeletion);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

  if (!account) return <SecuritySkeleton />;

  const isEnabled = twoFactor[account.id] ?? false;
  const mySessions = sessions[account.id] ?? DEFAULT_SESSIONS;
  const deletionRequested = deletionRequestedAt[account.id];
  const pendingSession = mySessions.find((s) => s.id === pendingRevokeId);

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    toast("Le changement de mot de passe réel arrivera avec l'authentification Supabase — pas encore disponible dans cette démo.");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2 lg:hidden" />
      <h1 className="font-display text-h2 text-foreground">Sécurité</h1>

      <form onSubmit={changePassword} className="mt-6 space-y-4">
        <p className="text-body-sm font-semibold text-foreground">Mot de passe</p>
        <Input
          label="Mot de passe actuel"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          label="Nouveau mot de passe"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          label="Confirmer le nouveau mot de passe"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="outline" className="w-full">
          Mettre à jour le mot de passe
        </Button>
      </form>

      <Card className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
          <div>
            <p className="text-body-sm font-semibold text-foreground">Authentification à deux facteurs</p>
            <p className="text-caption text-muted-foreground">Un code supplémentaire sera demandé à chaque connexion.</p>
          </div>
        </div>
        <Switch checked={isEnabled} onChange={() => toggleTwoFactor(account.id)} label="Authentification à deux facteurs" />
      </Card>

      <p className="mt-6 text-body-sm font-semibold text-foreground">Sessions actives</p>
      <div className="mt-2 space-y-2">
        <Card className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 shrink-0 text-secondary-700" />
          <div className="flex-1">
            <p className="text-body-sm font-semibold text-foreground">Cet appareil</p>
            <p className="text-caption text-muted-foreground">Session active maintenant</p>
          </div>
        </Card>
        {mySessions.map((session) => (
          <Card key={session.id} className="flex items-center gap-3">
            <Laptop className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-body-sm font-semibold text-foreground">{session.device}</p>
              <p className="text-caption text-muted-foreground">
                {session.location} · {formatRelativeTime(session.lastActive)}
              </p>
            </div>
            <button
              onClick={() => setPendingRevokeId(session.id)}
              className="rounded-sm text-caption font-semibold text-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Déconnecter
            </button>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-body-sm font-semibold text-danger">Zone sensible</p>
      <Card className="mt-2 border-danger/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-body-sm font-semibold text-foreground">Supprimer mon compte</p>
            {deletionRequested ? (
              <p className="mt-1 text-caption text-muted-foreground">
                Demande envoyée {formatRelativeTime(deletionRequested)} — traitement sous 30 jours.
              </p>
            ) : (
              <p className="mt-1 text-caption text-muted-foreground">Cette action est irréversible une fois traitée.</p>
            )}
            {!deletionRequested && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setDeleteConfirming(true)}>
                Demander la suppression
              </Button>
            )}
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={pendingRevokeId !== null}
        onClose={() => setPendingRevokeId(null)}
        onConfirm={() => {
          if (!pendingRevokeId) return;
          revokeSession(account.id, pendingRevokeId);
          setPendingRevokeId(null);
          toast('Session déconnectée.');
        }}
        title="Déconnecter cette session ?"
        description={pendingSession ? `« ${pendingSession.device} » sera déconnecté immédiatement.` : undefined}
        confirmLabel="Déconnecter"
        destructive
      />

      <ConfirmDialog
        open={deleteConfirming}
        onClose={() => setDeleteConfirming(false)}
        onConfirm={() => {
          requestDeletion(account.id);
          setDeleteConfirming(false);
          toast('Demande de suppression enregistrée.');
        }}
        title="Supprimer votre compte ?"
        description="Cette action est irréversible une fois traitée. Votre demande sera examinée sous 30 jours."
        confirmLabel="Supprimer mon compte"
        destructive
      />
    </div>
  );
}
