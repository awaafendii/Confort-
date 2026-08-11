import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Laptop, Lock, Shield, Smartphone } from 'lucide-react';
import { Button, Card, Input, toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store';
import { DEFAULT_SESSIONS, useSecurityStore } from '@/features/security/securityStore';
import { formatRelativeTime } from '@/utils/format';

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked ? 'bg-secondary-700' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-6 w-6 rounded-full bg-white shadow-card transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export default function SecurityPage() {
  const navigate = useNavigate();
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

  if (!account) return null;

  const isEnabled = twoFactor[account.id] ?? false;
  const mySessions = sessions[account.id] ?? DEFAULT_SESSIONS;
  const deletionRequested = deletionRequestedAt[account.id];

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
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="font-display text-h2 text-foreground">Sécurité</h1>

      <form onSubmit={changePassword} className="mt-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Mot de passe</p>
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
            <p className="text-sm font-semibold text-foreground">Authentification à deux facteurs</p>
            <p className="text-xs text-muted-foreground">Un code supplémentaire sera demandé à chaque connexion.</p>
          </div>
        </div>
        <Switch checked={isEnabled} onChange={() => toggleTwoFactor(account.id)} label="Authentification à deux facteurs" />
      </Card>

      <p className="mt-6 text-sm font-semibold text-foreground">Sessions actives</p>
      <div className="mt-2 space-y-2">
        <Card className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 shrink-0 text-secondary-700" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Cet appareil</p>
            <p className="text-xs text-muted-foreground">Session active maintenant</p>
          </div>
        </Card>
        {mySessions.map((session) => (
          <Card key={session.id} className="flex items-center gap-3">
            <Laptop className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{session.device}</p>
              <p className="text-xs text-muted-foreground">
                {session.location} · {formatRelativeTime(session.lastActive)}
              </p>
            </div>
            <button
              onClick={() => revokeSession(account.id, session.id)}
              className="text-xs font-semibold text-danger hover:underline"
            >
              Déconnecter
            </button>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm font-semibold text-danger">Zone sensible</p>
      <Card className="mt-2 border-danger/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Supprimer mon compte</p>
            {deletionRequested ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Demande envoyée {formatRelativeTime(deletionRequested)} — traitement sous 30 jours.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Cette action est irréversible une fois traitée.</p>
            )}
            {!deletionRequested && (
              <div className="mt-3">
                {deleteConfirming ? (
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        requestDeletion(account.id);
                        setDeleteConfirming(false);
                        toast('Demande de suppression enregistrée.');
                      }}
                    >
                      Confirmer la suppression
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirming(false)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setDeleteConfirming(true)}>
                    Demander la suppression
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
