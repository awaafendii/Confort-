import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Phone } from 'lucide-react';
import { Button, Input, toast } from '@/components/ui';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GoogleIcon, AppleIcon } from '@/features/auth/components/BrandIcons';
import { AuthError, DEMO_ACCOUNTS, login } from '@/features/auth/authService';
import { useAuthStore } from '@/features/auth/store';

const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAccount = useAuthStore((s) => s.setAccount);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (id: string, pwd: string) => {
    setError(undefined);
    setLoading(true);
    try {
      const account = await login(id, pwd);
      setAccount(account);
      toast.success(`Bon retour, ${account.name.split(' ')[0]} !`);
      navigate('/home', { replace: true });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Connexion" subtitle="Entrez vos identifiants pour continuer." onBack={() => navigate(-1)}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit(identifier, password);
        }}
      >
        <Input
          label="Téléphone ou email"
          placeholder="622 00 11 22"
          icon={<Phone className="h-4 w-4" />}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-semibold text-primary-700 hover:underline"
          >
            Mot de passe oublié ?
          </button>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Continuer
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => toast('Connexion Google bientôt disponible.')}
        >
          <GoogleIcon className="h-5 w-5" /> Continuer avec Google
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => toast('Connexion Apple bientôt disponible.')}
        >
          <AppleIcon className="h-5 w-5" /> Continuer avec Apple
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <button onClick={() => navigate('/register')} className="font-semibold text-primary-700 hover:underline">
          Inscrivez-vous
        </button>
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-border p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Accès rapide démo
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map(({ label, account }) => (
            <button
              key={account.id}
              type="button"
              onClick={() => submit(account.phone, DEMO_PASSWORD)}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-foreground hover:border-primary-300 hover:bg-primary-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
