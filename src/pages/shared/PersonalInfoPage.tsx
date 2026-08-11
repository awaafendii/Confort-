import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Avatar, Button, Input, toast } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';

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

  if (!account) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateAccount({ name, phone, email, avatar });
    toast.success('Informations mises à jour.');
    setSaving(false);
    navigate(-1);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="font-display text-h2 text-foreground">Informations personnelles</h1>

      <form onSubmit={save} className="mt-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="relative">
            <Avatar name={name || account.name} src={avatar} size="xl" />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary-800 text-white">
              <Camera className="h-3.5 w-3.5" />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <Input label="Nom complet" icon={<UserIcon className="h-4 w-4" />} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Téléphone" icon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} />

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={saving}>
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
