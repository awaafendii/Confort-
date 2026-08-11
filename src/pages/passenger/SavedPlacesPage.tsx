import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { Button, Card, EmptyState, Input, Modal, toast } from '@/components/ui';
import { CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { useSavedPlacesStore } from '@/features/profile/savedPlacesStore';
import type { SavedPlace } from '@/types';

const ICONS: Record<NonNullable<SavedPlace['icon']>, React.ReactNode> = {
  home: <MapPin className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
};

export default function SavedPlacesPage() {
  const navigate = useNavigate();
  const places = useSavedPlacesStore((s) => s.places);
  const addPlace = useSavedPlacesStore((s) => s.addPlace);
  const removePlace = useSavedPlacesStore((s) => s.removePlace);

  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlace({ label, address, coords: CONAKRY_MAP_CENTER, icon: 'star' });
    toast.success('Lieu ajouté.');
    setLabel('');
    setAddress('');
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

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
        <div className="mt-6 space-y-3">
          {places.map((place) => (
            <Card key={place.id} className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                {ICONS[place.icon ?? 'star']}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {place.label === 'Home' ? 'Domicile' : place.label === 'Work' ? 'Travail' : place.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">{place.address}</p>
              </div>
              <button
                aria-label="Supprimer"
                onClick={() => {
                  removePlace(place.id);
                  toast('Lieu supprimé.');
                }}
                className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
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
    </div>
  );
}
