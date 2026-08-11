import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, toast } from '@/components/ui';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { OtpInput } from '@/features/auth/components/OtpInput';
import { AuthError, resendRegistrationOtp, verifyRegistrationOtp } from '@/features/auth/authService';
import { useAuthStore } from '@/features/auth/store';

const RESEND_COOLDOWN_S = 30;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccount = useAuthStore((s) => s.setAccount);

  const state = location.state as { contact?: string; otp?: string } | null;
  const [demoOtp, setDemoOtp] = useState(state?.otp ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!state?.contact) navigate('/register', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const account = await verifyRegistrationOtp(code);
      setAccount(account);
      toast.success('Compte vérifié — bienvenue sur Confort+ !');
      navigate('/home', { replace: true });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Vérification impossible.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      const { otp } = await resendRegistrationOtp();
      setDemoOtp(otp);
      setCooldown(RESEND_COOLDOWN_S);
      toast(`[Mode démo] Nouveau code : ${otp}`);
    } catch (e) {
      toast.error(e instanceof AuthError ? e.message : 'Renvoi impossible.');
    }
  };

  return (
    <AuthLayout
      title="Vérification"
      subtitle={`Entrez le code à 6 chiffres envoyé à ${state?.contact ?? 'votre numéro'}.`}
      onBack={() => navigate('/register')}
    >
      {demoOtp && (
        <div className="mb-6 rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-800">
          <span className="font-semibold">Mode démo :</span> aucun SMS n'est envoyé — votre code est{' '}
          <span className="font-mono font-bold">{demoOtp}</span>.
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <OtpInput value={code} onChange={setCode} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} disabled={code.length !== 6}>
          Confirmer
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Vous n'avez rien reçu ?{' '}
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="font-semibold text-primary-700 hover:underline disabled:pointer-events-none disabled:text-muted-foreground"
        >
          {cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer le code'}
        </button>
      </p>
    </AuthLayout>
  );
}
