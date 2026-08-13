import React, { useRef, useState } from 'react';
import { AlertTriangle, FileText, Upload } from 'lucide-react';
import { BackButton, Badge, Button, Card, Skeleton, toast } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import type { Driver, DriverDocument } from '@/types';

const DOC_TYPES: { type: DriverDocument['type']; label: string }[] = [
  { type: 'PERMIS', label: 'Permis de conduire' },
  { type: 'CARTE_IDENTITE', label: "Carte d'identité" },
  { type: 'CARTE_GRISE', label: 'Carte grise' },
  { type: 'ASSURANCE', label: 'Assurance' },
];

const STATUS_BADGE: Record<DriverDocument['status'] | 'MISSING', { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  VALIDATED: { label: 'Validé', variant: 'success' },
  PENDING: { label: 'En cours de vérification', variant: 'warning' },
  REJECTED: { label: 'Rejeté', variant: 'danger' },
  MISSING: { label: 'Non fourni', variant: 'neutral' },
};

function isImageUrl(url: string): boolean {
  return url.startsWith('data:image') || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes('placehold.co');
}

function DocumentsSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-52" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const account = useAuthStore((s) => s.account) as Driver | null;
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<DriverDocument['type'] | null>(null);

  if (!account) return <DocumentsSkeleton />;

  const startUpload = (type: DriverDocument['type']) => {
    setUploadingType(type);
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingType) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const next = account.documents.filter((d) => d.type !== uploadingType);
      next.push({ type: uploadingType, url: reader.result as string, status: 'PENDING' });
      updateAccount({ documents: next });
      toast.success('Document envoyé — en cours de vérification.');
      setUploadingType(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-6 lg:hidden" />
      <h1 className="font-display text-h2 text-foreground">Documents</h1>
      <p className="mt-2 text-body-sm text-muted-foreground">Requis pour circuler sur Confort+.</p>

      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />

      <div className="mt-6 space-y-3">
        {DOC_TYPES.map(({ type, label }) => {
          const doc = account.documents.find((d) => d.type === type);
          const status = STATUS_BADGE[doc?.status ?? 'MISSING'];
          const showPreview = doc && isImageUrl(doc.url);
          return (
            <Card key={type}>
              <div className="flex items-center gap-3.5">
                {showPreview ? (
                  <a href={doc!.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <img src={doc!.url} alt={`Aperçu — ${label}`} className="h-11 w-11 rounded-xl object-cover" />
                  </a>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-foreground">{label}</p>
                  <Badge variant={status.variant} className="mt-1">
                    {status.label}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => startUpload(type)}>
                  <Upload className="h-4 w-4" /> {doc ? 'Remplacer' : 'Téléverser'}
                </Button>
              </div>
              {doc?.status === 'REJECTED' && doc.rejectionReason && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/5 p-3 text-caption text-danger">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    <span className="font-semibold">Motif : </span>
                    {doc.rejectionReason}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
