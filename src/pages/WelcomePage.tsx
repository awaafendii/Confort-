import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-primary-900 px-6 py-10 text-white safe-bottom">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <span className="font-display text-sm font-extrabold">C+</span>
        </div>
        <span className="font-display text-lg font-extrabold tracking-tight">
          Confort<span className="text-secondary-400">+</span>
        </span>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <ShieldCheck className="h-7 w-7 text-secondary-400" />
        </div>
        <h1 className="font-display text-display leading-[1.05] text-white">
          La mobilité
          <br />
          premium à Conakry.
        </h1>
        <p className="mt-4 text-[17px] text-primary-100">
          Voiture ou moto-taxi. Estimation instantanée, suivi en temps réel, paiement à votre façon.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-3">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/login')}>
          Se connecter
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => navigate('/register')}
        >
          Créer un compte
        </Button>
      </div>
    </div>
  );
}
