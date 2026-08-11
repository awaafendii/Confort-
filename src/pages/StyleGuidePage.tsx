import React, { useMemo, useState } from 'react';
import {
  Car,
  Bike,
  Star,
  Wallet,
  Users,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Bell,
  Search,
  ArrowRight,
  Home,
  Briefcase,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Input,
  SearchInput,
  Card,
  Badge,
  Avatar,
  Rating,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Modal,
  BottomSheet,
  StatCard,
  toast,
} from '@/components/ui';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { calculateFaresByCategory, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatFare } from '@/utils/format';
import type { RideCategory } from '@/types';

// Classes statiques (Tailwind scanne le code source, pas les template strings interpolées).
const PRIMARY_SWATCHES = [
  { key: 50, cls: 'bg-primary-50' },
  { key: 100, cls: 'bg-primary-100' },
  { key: 200, cls: 'bg-primary-200' },
  { key: 300, cls: 'bg-primary-300' },
  { key: 400, cls: 'bg-primary-400' },
  { key: 500, cls: 'bg-primary-500' },
  { key: 600, cls: 'bg-primary-600' },
  { key: 700, cls: 'bg-primary-700' },
  { key: 800, cls: 'bg-primary-800' },
  { key: 900, cls: 'bg-primary-900' },
  { key: 950, cls: 'bg-primary-950' },
];
const SECONDARY_SWATCHES = [
  { key: 50, cls: 'bg-secondary-50' },
  { key: 100, cls: 'bg-secondary-100' },
  { key: 200, cls: 'bg-secondary-200' },
  { key: 300, cls: 'bg-secondary-300' },
  { key: 400, cls: 'bg-secondary-400' },
  { key: 500, cls: 'bg-secondary-500' },
  { key: 600, cls: 'bg-secondary-600' },
  { key: 700, cls: 'bg-secondary-700' },
  { key: 800, cls: 'bg-secondary-800' },
  { key: 900, cls: 'bg-secondary-900' },
  { key: 950, cls: 'bg-secondary-950' },
];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <div className="mb-5">
        <h2 className="font-display text-h2 text-foreground">{title}</h2>
        {description && <p className="mt-1 text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  const [originId, setOriginId] = useState(NEIGHBORHOODS[0].id);
  const [destId, setDestId] = useState(NEIGHBORHOODS[2].id);
  const [category, setCategory] = useState<RideCategory>('STANDARD');
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [ratingDemo, setRatingDemo] = useState(4);
  const [search, setSearch] = useState('');

  const fares = useMemo(() => calculateFaresByCategory(originId, destId), [originId, destId]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-800">
              <span className="font-display text-sm font-extrabold text-white">C+</span>
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              Confort<span className="text-secondary-700">+</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface">
              <Bell className="h-5 w-5" />
            </button>
            <Avatar name="Aïssatou Diallo" size="sm" status="online" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-10">
        <div className="mb-14">
          <Badge variant="secondary" className="mb-4">
            Phase 1 — Design System &amp; Architecture
          </Badge>
          <h1 className="font-display text-display text-foreground">
            Confort<span className="text-secondary-700">+</span>
          </h1>
          <p className="mt-3 max-w-xl text-[17px] text-muted-foreground">
            La mobilité premium à Conakry. Voiture ou moto-taxi, estimation instantanée,
            suivi en temps réel — un design system sobre, rassurant et 100% guinéen.
          </p>
        </div>

        <Section title="Palette de marque" description="Bleu nuit (primary) et vert profond (secondary) sur fond blanc.">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">Primary — Bleu nuit</p>
              <div className="flex overflow-hidden rounded-xl border border-border">
                {PRIMARY_SWATCHES.map((s) => (
                  <div key={s.key} className={`h-14 flex-1 ${s.cls}`} title={`primary-${s.key}`} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">Secondary — Vert profond</p>
              <div className="flex overflow-hidden rounded-xl border border-border">
                {SECONDARY_SWATCHES.map((s) => (
                  <div key={s.key} className={`h-14 flex-1 ${s.cls}`} title={`secondary-${s.key}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="success">Succès</Badge>
            <Badge variant="warning">Avertissement</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="neutral">Neutre</Badge>
          </div>
        </Section>

        <Section title="Typographie" description="Manrope pour les titres, Inter pour le texte courant.">
          <div className="space-y-3">
            <p className="font-display text-display text-foreground">Display 56/700</p>
            <p className="font-display text-h1 text-foreground">Titre H1</p>
            <p className="font-display text-h2 text-foreground">Titre H2</p>
            <p className="font-display text-h3 text-foreground">Titre H3</p>
            <p className="text-[17px] text-foreground">Corps de texte — 17px / 400, pour les descriptions.</p>
            <p className="text-sm text-muted-foreground">Small — 14px, texte secondaire et légendes.</p>
          </div>
        </Section>

        <Section title="Boutons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Confirmer la course</Button>
            <Button variant="secondary">Action secondaire</Button>
            <Button variant="outline">Contour</Button>
            <Button variant="ghost">Discret</Button>
            <Button variant="danger">Annuler</Button>
            <Button variant="primary" loading>
              Recherche...
            </Button>
            <Button variant="primary" size="icon" aria-label="Localisation">
              <MapPin className="h-5 w-5" />
            </Button>
          </div>
        </Section>

        <Section title="Champs de saisie">
          <div className="grid max-w-xl grid-cols-1 gap-4">
            <Input label="Numéro de téléphone" placeholder="622 00 11 22" />
            <Input label="Email" icon={<Search className="h-4 w-4" />} placeholder="vous@exemple.com" />
            <Input label="Mot de passe" type="password" error="Minimum 8 caractères requis" />
            <SearchInput value={search} onChange={setSearch} />
          </div>
        </Section>

        <Section
          title="Sélection de véhicule & tarification"
          description="Grille tarifaire portée depuis la configuration WONKHAI (quartiers de Conakry)."
        >
          <Card className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((cat) => {
              const config = RIDE_CATEGORIES_CONFIG[cat];
              const isMoto = cat === 'MOTO_SINGLE';
              return (
                <Card
                  key={cat}
                  interactive
                  selected={category === cat}
                  onClick={() => setCategory(cat)}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                      {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                    </div>
                    {category === cat && <CheckCircle2 className="h-5 w-5 text-secondary-700" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.capacity}</p>
                  </div>
                  <p className="font-display text-lg font-bold text-foreground">{formatFare(fares[cat])}</p>
                </Card>
              );
            })}
          </div>

          <Button variant="primary" size="lg" className="mt-6 w-full sm:w-auto">
            Confirmer la course — {formatFare(fares[category])}
          </Button>
        </Section>

        <Section
          title="Couleurs de véhicules"
          description="Rendu réel des véhicules sur la carte (façon Yango) — indépendant de la palette de marque."
        >
          <div className="flex flex-wrap gap-4">
            {Object.entries(VEHICLE_COLORS).map(([id, c]) => (
              <div key={id} className="flex flex-col items-center gap-2">
                <div
                  className="h-10 w-10 rounded-full border border-border shadow-card"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Cartes de profil & évaluation">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex items-center gap-4">
              <Avatar name="Mamadou Bah" size="lg" status="online" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Mamadou Bah</p>
                <p className="text-sm text-muted-foreground">Toyota Corolla · RC-1234-A</p>
                <Rating value={4.9} showValue size={14} className="mt-1" />
              </div>
            </Card>
            <Card>
              <p className="mb-2 text-sm font-medium text-foreground">Noter le chauffeur</p>
              <Rating value={ratingDemo} interactive onChange={setRatingDemo} size={26} />
            </Card>
          </div>
        </Section>

        <Section title="Indicateurs (aperçu admin)">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Courses aujourd'hui" value="248" trend={{ value: '+12% vs hier' }} icon={<Car className="h-5 w-5" />} />
            <StatCard label="Chauffeurs actifs" value="63" trend={{ value: '+4 nouveaux' }} icon={<Users className="h-5 w-5" />} />
            <StatCard label="Revenu du jour" value={formatFare(1850000)} icon={<Wallet className="h-5 w-5" />} />
            <StatCard label="Note moyenne" value="4.8/5" icon={<Star className="h-5 w-5" />} />
          </div>
        </Section>

        <Section title="États d'interface" description="Loading, empty, error — jamais d'écran vide.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card noPadding className="p-5">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Loading</p>
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <SkeletonText lines={2} className="flex-1" />
              </div>
              <SkeletonCard className="mt-4" />
            </Card>
            <Card noPadding>
              <EmptyState
                icon={<Clock className="h-7 w-7" />}
                title="Aucune course récente"
                description="Vos trajets apparaîtront ici."
                actionLabel="Réserver une course"
                onAction={() => toast('Réservation à venir en Phase 4')}
              />
            </Card>
            <Card noPadding>
              <ErrorState onRetry={() => toast.success('Nouvelle tentative lancée')} />
            </Card>
          </div>
        </Section>

        <Section title="Lieux enregistrés">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4" /> Domicile
            </Button>
            <Button variant="outline" size="sm">
              <Briefcase className="h-4 w-4" /> Travail
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4" /> Récents
            </Button>
          </div>
        </Section>

        <Section title="Overlays" description="Modal et Bottom Sheet — animations via Framer Motion.">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Ouvrir une modale
            </Button>
            <Button variant="outline" onClick={() => setSheetOpen(true)}>
              Ouvrir un bottom sheet
            </Button>
            <Button variant="ghost" onClick={() => toast('Confort+ est prêt pour la Phase 2')}>
              Déclencher un toast
            </Button>
          </div>
        </Section>

        <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-secondary-700" />
          Confort+ · Phase 1 validée — en attente de votre feu vert pour la Phase 2 (Authentification &amp; Onboarding).
        </footer>
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Annuler la course ?">
        <p className="text-sm text-muted-foreground">
          Votre chauffeur a déjà été notifié. Des frais d'annulation peuvent s'appliquer après 3 minutes.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
            Retour
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => setModalOpen(false)}>
            Confirmer l'annulation
          </Button>
        </div>
      </Modal>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <p className="mb-1 text-sm font-medium text-muted-foreground">Chauffeur trouvé</p>
        <div className="flex items-center gap-4">
          <Avatar name="Ibrahima Soumah" size="lg" status="online" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">Ibrahima Soumah</p>
            <Rating value={4.8} showValue size={14} />
          </div>
          <Badge variant="secondary">3 min</Badge>
        </div>
        <Button variant="primary" size="lg" className="mt-5 w-full" onClick={() => setSheetOpen(false)}>
          Contacter le chauffeur
        </Button>
      </BottomSheet>
    </div>
  );
}
