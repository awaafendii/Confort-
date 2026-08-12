import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Avatar, BackButton, Button, Input, Skeleton, toast } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';

const PHONE_PATTERN = /^\+?[0-9\s]{8,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Pas d'opération asynchrone réelle derrière `updateAccount` — ce délai rend le spinner du bouton honnête plutôt que cosmétique (audit § 5.2). */
const SAVE_DELAY_MS = 500;

function PersonalInfoSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <Skeleton className="h-7 w-56" />
      <div className="mt-8 flex flex-col items-center gap-3">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="mt-6 space-y-6">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}

/** Générique — réutilisée par les espaces passager et chauffeur (les deux éditent le même compte). */
export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(account?.name ?? '');
  const [phone, setPhone] = useState(account?.phone ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [avatar, setAvatar] = useState(account?.avatar);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});

  if (!account) return <PersonalInfoSkeleton />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!PHONE_PATTERN.test(phone.trim())) next.phone = 'Numéro de téléphone invalide.';
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) next.email = 'Adresse email invalide.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      updateAccount({ name, phone, email, avatar });
      toast.success('Informations mises à jour.');
      navigate(-1);
    }, SAVE_DELAY_MS);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2 lg:hidden" />
      <h1 className="font-display text-h2 text-foreground">Informations personnelles</h1>

      <form onSubmit={save} className="mt-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Changer la photo de profil"
            className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar name={name || account.name} src={avatar} size="xl" />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary-800 text-white">
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <Input label="Nom complet" icon={<UserIcon className="h-4 w-4" />} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Téléphone"
          icon={<Phone className="h-4 w-4" />}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          error={errors.phone}
          required
        />
        <Input
          label="Email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
        />

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={saving}>
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
