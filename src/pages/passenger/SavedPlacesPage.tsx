import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { BackButton, Button, ConfirmDialog, EmptyState, Input, Modal, toast } from '@/components/ui';
import { PlaceCard } from '@/components/business';
import { CONAKRY_MAP_CENTER, NEIGHBORHOODS } from '@/data/neighborhoods';
import { useSavedPlacesStore } from '@/features/profile/savedPlacesStore';
import type { SavedPlace } from '@/types';

const CATEGORIES: { label: string; match: (place: SavedPlace) => boolean }[] = [
  { label: 'Maison', match: (p) => p.label === 'Home' },
  { label: 'Travail', match: (p) => p.label === 'Work' },
  { label: 'Favoris', match: (p) => p.label !== 'Home' && p.label !== 'Work' },
];

/** Fait correspondre l'adresse saisie à un quartier réel plutôt que de figer le centre de Conakry — un lieu ajouté ici ne doit pas tous pointer au même endroit (audit § 5.2). */
function resolveCoords(address: string) {
  const match = NEIGHBORHOODS.find((n) => address.toLowerCase().includes(n.name.toLowerCase()));
  return match?.coords ?? CONAKRY_MAP_CENTER;
}

export default function SavedPlacesPage() {
  const places = useSavedPlacesStore((s) => s.places);
  const addPlace = useSavedPlacesStore((s) => s.addPlace);
  const removePlace = useSavedPlacesStore((s) => s.removePlace);

  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const pendingPlace = places.find((p) => p.id === pendingRemoveId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlace({ label, address, coords: resolveCoords(address), icon: 'star' });
    toast.success('Lieu ajouté.');
    setLabel('');
    setAddress('');
    setModalOpen(false);
  };

  const confirmRemove = () => {
    if (!pendingRemoveId) return;
    removePlace(pendingRemoveId);
    toast('Lieu supprimé.');
    setPendingRemoveId(null);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2 lg:hidden" />

      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 text-foreground">Lieux enregistrés</h1>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {places.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-7 w-7" />}
          title="Aucun lieu enregistré"
          description="Ajoutez votre domicile ou votre lieu de travail pour réserver plus vite."
          actionLabel="Ajouter un lieu"
          onAction={() => setModalOpen(true)}
          className="mt-6"
        />
      ) : (
        <div className="mt-6 space-y-6">
          {CATEGORIES.map((category) => {
            const inCategory = places.filter(category.match);
            if (inCategory.length === 0) return null;
            return (
              <div key={category.label}>
                <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{category.label}</p>
                <div className="space-y-2.5">
                  {inCategory.map((place) => (
                    <PlaceCard key={place.id} place={place} onRemove={() => setPendingRemoveId(place.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un lieu">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nom du lieu" placeholder="Ex. Chez ma mère" value={label} onChange={(e) => setLabel(e.target.value)} required />
          <Input label="Adresse" placeholder="Quartier, Conakry" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Enregistrer
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingRemoveId !== null}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={confirmRemove}
        title="Supprimer ce lieu ?"
        description={pendingPlace ? `« ${pendingPlace.label === 'Home' ? 'Domicile' : pendingPlace.label === 'Work' ? 'Travail' : pendingPlace.label} » sera retiré de vos lieux enregistrés.` : undefined}
        confirmLabel="Supprimer"
        destructive
      />
    </div>
  );
}
