import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bike, Car, Lock, Mail, Phone, User as UserIcon, Users } from 'lucide-react';
import { Button, Input, toast } from '@/components/ui';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RoleSelectCard } from '@/features/auth/components/RoleSelectCard';
import { VehicleColorPicker } from '@/features/auth/components/VehicleColorPicker';
import { AuthError, startRegistration } from '@/features/auth/authService';
import type { RegisterInput, RegisterVehicleInput } from '@/features/auth/types';
import type { VehicleType } from '@/types';

type Step = 'role' | 'form';

const emptyVehicle: RegisterVehicleInput = { type: 'VOITURE', brand: '', model: '', plateNumber: '', color: 'blanc' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<RegisterInput['role']>('PASSENGER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vehicle, setVehicle] = useState<RegisterVehicleInput>(emptyVehicle);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const goBackFromForm = () => setStep('role');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const input: RegisterInput = {
        role,
        name,
        phone,
        email,
        password,
        vehicle: role === 'DRIVER' ? vehicle : undefined,
      };
      const { otp } = await startRegistration(input);
      toast(`[Mode démo] Code envoyé : ${otp}`);
      navigate('/verify-email', { state: { contact: phone, otp } });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 'role' ? 'Créer un compte' : `Infos ${role === 'PASSENGER' ? 'passager' : 'pilote'}`}
      subtitle={step === 'role' ? 'Comment souhaitez-vous utiliser Confort+ ?' : undefined}
      onBack={step === 'role' ? () => navigate(-1) : goBackFromForm}
    >
      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <RoleSelectCard
              icon={<Users className="h-6 w-6" />}
              label="Passager"
              description="Je réserve des courses"
              selected={role === 'PASSENGER'}
              onClick={() => {
                setRole('PASSENGER');
                setStep('form');
              }}
            />
            <RoleSelectCard
              icon={<Car className="h-6 w-6" />}
              label="Pilote"
              description="Je conduis et je gagne"
              accent="secondary"
              selected={role === 'DRIVER'}
              onClick={() => {
                setRole('DRIVER');
                setStep('form');
              }}
            />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={submit}
            className="space-y-4"
          >
            <Input label="Nom complet" icon={<UserIcon className="h-4 w-4" />} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Téléphone" placeholder="622 00 11 22" icon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Mot de passe" type="password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={error}
              required
            />

            {role === 'DRIVER' && (
              <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-foreground">Véhicule</p>
                <div className="flex gap-2">
                  {(['VOITURE', 'MOTO'] as VehicleType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicle((v) => ({ ...v, type }))}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                        vehicle.type === type
                          ? 'border-secondary-700 bg-secondary-50 text-secondary-800'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      {type === 'VOITURE' ? <Car className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                      {type === 'VOITURE' ? 'Voiture' : 'Moto'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Marque"
                    placeholder="Toyota"
                    value={vehicle.brand}
                    onChange={(e) => setVehicle((v) => ({ ...v, brand: e.target.value }))}
                    required
                  />
                  <Input
                    label="Modèle"
                    placeholder="Corolla"
                    value={vehicle.model}
                    onChange={(e) => setVehicle((v) => ({ ...v, model: e.target.value }))}
                    required
                  />
                </div>
                <Input
                  label="Plaque d'immatriculation"
                  placeholder="RC-1234-A"
                  value={vehicle.plateNumber}
                  onChange={(e) => setVehicle((v) => ({ ...v, plateNumber: e.target.value }))}
                  required
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Couleur du véhicule</p>
                  <VehicleColorPicker value={vehicle.color} onChange={(color) => setVehicle((v) => ({ ...v, color }))} />
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              Créer mon compte
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
