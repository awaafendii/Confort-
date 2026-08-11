import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import {
  MoveFreelyIllustration,
  PaySecurelyIllustration,
  TrackRideIllustration,
} from '@/features/auth/components/OnboardingIllustrations';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'Déplacez-vous librement',
    description: "Voiture ou moto-taxi, où que vous soyez à Conakry, en quelques secondes.",
    Illustration: MoveFreelyIllustration,
  },
  {
    title: 'Suivez votre course',
    description: 'Localisez votre chauffeur en temps réel, du départ jusqu\'à votre arrivée.',
    Illustration: TrackRideIllustration,
  },
  {
    title: 'Payez en toute sécurité',
    description: 'Espèces, Orange Money, MoMo ou carte — vous choisissez.',
    Illustration: PaySecurelyIllustration,
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    completeOnboarding();
    navigate('/welcome', { replace: true });
  };

  const { title, description, Illustration } = STEPS[step];

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-8 safe-bottom">
      <div className="flex justify-end">
        <button onClick={finish} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          Passer
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center text-center">
        <div className="mb-10 h-64 w-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              <Illustration />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="font-display text-h2 text-foreground">{title}</h1>
            <p className="mt-3 text-[15px] text-muted-foreground">{description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary-800' : 'w-1.5 bg-border')}
            />
          ))}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
