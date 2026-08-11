import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Phone } from 'lucide-react';
import { Button, Input, toast } from '@/components/ui';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { OtpInput } from '@/features/auth/components/OtpInput';
import { AuthError, confirmPasswordReset, requestPasswordReset } from '@/features/auth/authService';

type Step = 'request' | 'reset';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const { otp } = await requestPasswordReset(identifier);
      setDemoOtp(otp);
      toast(`[Mode démo] Code envoyé : ${otp}`);
      setStep('reset');
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Envoi impossible.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('6 caractères minimum.');
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(code, password);
      toast.success('Mot de passe mis à jour. Connectez-vous.');
      navigate('/login', { replace: true });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Réinitialisation impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle={
        step === 'request'
          ? 'Entrez votre téléphone ou email pour recevoir un code.'
          : 'Entrez le code reçu et choisissez un nouveau mot de passe.'
      }
      onBack={() => (step === 'request' ? navigate('/login') : setStep('request'))}
    >
      <AnimatePresence mode="wait">
        {step === 'request' ? (
          <motion.form
            key="request"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={requestCode}
            className="space-y-4"
          >
            <Input
              label="Téléphone ou email"
              placeholder="622 00 11 22"
              icon={<Phone className="h-4 w-4" />}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              Envoyer le code
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="reset"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={resetPassword}
            className="space-y-6"
          >
            {demoOtp && (
              <div className="rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-800">
                <span className="font-semibold">Mode démo :</span> votre code est{' '}
                <span className="font-mono font-bold">{demoOtp}</span>.
              </div>
            )}
            <OtpInput value={code} onChange={setCode} />
            <div className="space-y-4">
              <Input
                label="Nouveau mot de passe"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={error}
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} disabled={code.length !== 6}>
              Réinitialiser le mot de passe
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
