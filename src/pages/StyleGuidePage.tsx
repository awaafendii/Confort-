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
  Home,
  Briefcase,
  Clock,
  CheckCircle2,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import {
  Button,
  IconButton,
  Input,
  SearchInput,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  SegmentedControl,
  Tabs,
  Card,
  Badge,
  StatusBadge,
  type StatusConfig,
  Avatar,
  Rating,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonGroup,
  EmptyState,
  ErrorState,
  Modal,
  BottomSheet,
  ConfirmDialog,
  Tooltip,
  StatCard,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Pagination,
  FilterChips,
  Logo,
  toast,
} from '@/components/ui';
import {
  RideCard,
  RideOptionCard,
  DriverCard,
  VehicleCard,
  RideSummary,
  PriceBreakdown,
  PaymentMethodRow,
  SafetyPanel,
  MapMarkerIcon,
  MAP_MARKER_COLORS,
} from '@/components/business';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { calculateFaresByCategory, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatFare } from '@/utils/format';
import type { Ride, RideCategory, RideStatus, Driver, SavedPaymentMethod, PaymentMethod } from '@/types';

// Classes statiques (Tailwind scanne le code source, pas les template strings interpolées).
const PRIMARY_SWATCHES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((key) => ({
  key,
  cls: `bg-primary-${key}`,
}));
const ACCENT_SWATCHES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((key) => ({
  key,
  cls: `bg-accent-${key}`,
}));

const SPACING_TOKENS = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
const RADIUS_TOKENS = [
  { name: 'sm', px: '8px', cls: 'rounded-sm', usage: 'Chips, petits contrôles' },
  { name: 'md', px: '12px', cls: 'rounded-md', usage: 'Buttons, Inputs' },
  { name: 'lg', px: '16px', cls: 'rounded-lg', usage: 'Cards' },
  { name: 'xl', px: '24px', cls: 'rounded-xl', usage: 'Bottom Sheets, Modals' },
  { name: 'full', px: '9999px', cls: 'rounded-full', usage: 'Avatars, Badges' },
];
const SHADOW_TOKENS = [
  { name: 'shadow-card', cls: 'shadow-card' },
  { name: 'shadow-elevated', cls: 'shadow-elevated' },
  { name: 'shadow-sheet', cls: 'shadow-sheet' },
  { name: 'shadow-modal', cls: 'shadow-modal' },
];
const TYPE_TOKENS = [
  { cls: 'font-display text-display font-extrabold', name: 'Display', spec: '48px / 800 / 1.1' },
  { cls: 'font-display text-h1 font-bold', name: 'H1', spec: '32px / 700 / 1.2' },
  { cls: 'font-display text-h2 font-bold', name: 'H2', spec: '24px / 700 / 1.25' },
  { cls: 'font-display text-h3 font-semibold', name: 'H3', spec: '20px / 600 / 1.3' },
  { cls: 'text-body-lg font-medium', name: 'Body Large', spec: '17px / 500 / 1.5' },
  { cls: 'text-body', name: 'Body', spec: '15px / 400 / 1.5' },
  { cls: 'text-body-sm', name: 'Body Small', spec: '13px / 400 / 1.4' },
  { cls: 'text-caption font-medium', name: 'Caption', spec: '12px / 500 / 1.3' },
  { cls: 'text-button font-semibold', name: 'Button', spec: '15px / 600 / 1' },
];

const NAV_SECTIONS = [
  { id: 'colors', label: 'Couleurs' },
  { id: 'typography', label: 'Typographie' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'radius', label: 'Border radius' },
  { id: 'shadows', label: 'Ombres' },
  { id: 'buttons', label: 'Boutons' },
  { id: 'forms', label: 'Formulaires' },
  { id: 'selectors', label: 'Sélecteurs & navigation' },
  { id: 'badges', label: 'Badges & statuts' },
  { id: 'cards', label: 'Cartes & données' },
  { id: 'states', label: "États d'interface" },
  { id: 'overlays', label: 'Overlays' },
  { id: 'business', label: 'Composants métier' },
  { id: 'icons', label: 'Iconographie & logo' },
];

const RIDE_STATUS_CONFIG: Record<RideStatus, StatusConfig> = {
  REQUESTED: { label: 'Demandée', variant: 'neutral' },
  SEARCHING_DRIVER: { label: 'Recherche chauffeur', variant: 'primary' },
  DRIVER_ASSIGNED: { label: 'Chauffeur assigné', variant: 'primary' },
  DRIVER_ARRIVING: { label: 'Chauffeur en route', variant: 'accent' },
  DRIVER_ARRIVED: { label: 'Chauffeur arrivé', variant: 'accent' },
  IN_PROGRESS: { label: 'En course', variant: 'accent' },
  COMPLETED: { label: 'Terminée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
};

const MOCK_DRIVER: Driver = {
  id: 'driver-1',
  name: 'Mamadou Bah',
  phone: '+224 622 00 11 22',
  role: 'DRIVER',
  rating: 4.9,
  createdAt: new Date().toISOString(),
  vehicle: {
    id: 'veh-1',
    driverId: 'driver-1',
    type: 'VOITURE',
    brand: 'Toyota',
    model: 'Corolla',
    plateNumber: 'RC-1234-A',
    color: 'blanc',
  },
  status: 'ONLINE',
  verification: 'VERIFIED',
  tripsCompleted: 1284,
  acceptanceRate: 0.96,
  earningsToday: 185000,
  location: { lat: 9.535, lng: -13.68 },
  documents: [],
};

const MOCK_RIDE: Ride = {
  id: 'ride-1',
  passengerId: 'user-1',
  driverId: 'driver-1',
  pickup: { label: 'Kaloum', address: 'Kaloum, Conakry', coords: { lat: 9.509, lng: -13.712 } },
  destination: { label: 'Ratoma', address: 'Ratoma, Conakry', coords: { lat: 9.577, lng: -13.649 } },
  category: 'STANDARD',
  vehicleType: 'VOITURE',
  status: 'COMPLETED',
  distanceKm: 8.4,
  durationMin: 22,
  fare: 45000,
  currency: 'GNF',
  paymentMethod: 'ORANGE_MONEY',
  requestedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  completedAt: new Date().toISOString(),
  rating: 4.8,
};

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  ESPECE: <Wallet className="h-4 w-4" />,
  ORANGE_MONEY: <Smartphone className="h-4 w-4" />,
  MOMO: <Smartphone className="h-4 w-4" />,
  PAYCARD: <CreditCard className="h-4 w-4" />,
  VISA: <CreditCard className="h-4 w-4" />,
  KULU: <Wallet className="h-4 w-4" />,
};

const MOCK_PAYMENT_METHODS: SavedPaymentMethod[] = [
  { id: 'pm-1', userId: 'user-1', method: 'ORANGE_MONEY', label: 'Orange Money', isDefault: true },
  { id: 'pm-2', userId: 'user-1', method: 'VISA', label: 'Visa •••• 4242', isDefault: false, last4: '4242' },
];

const MOCK_TABLE_ROWS = [
  { id: 'u1', name: 'Fatoumata Camara', role: 'Passager', trips: 42, status: { label: 'Actif', variant: 'success' as const } },
  { id: 'u2', name: 'Ibrahima Soumah', role: 'Chauffeur', trips: 318, status: { label: 'Actif', variant: 'success' as const } },
  { id: 'u3', name: 'Aïssatou Diallo', role: 'Passager', trips: 7, status: { label: 'Suspendu', variant: 'danger' as const } },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="mb-5">
        <h2 className="font-display text-h2 text-foreground">{title}</h2>
        {description && <p className="mt-1 text-body text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SwatchRow({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-body-sm font-semibold text-muted-foreground">{label}</p>
      {children}
      {note && <p className="mt-2 text-caption text-muted-foreground">{note}</p>}
    </div>
  );
}

export default function StyleGuidePage() {
  const [category, setCategory] = useState<RideCategory>('STANDARD');
  const [paymentId, setPaymentId] = useState(MOCK_PAYMENT_METHODS[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ratingDemo, setRatingDemo] = useState(4);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [radioValue, setRadioValue] = useState('voiture');
  const [segment, setSegment] = useState<'VOITURE' | 'MOTO'>('VOITURE');
  const [tab, setTab] = useState<'apercu' | 'historique' | 'documents'>('apercu');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [page, setPage] = useState(1);

  const fares = useMemo(
    () => calculateFaresByCategory(NEIGHBORHOODS[0].id, NEIGHBORHOODS[2].id),
    []
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Bell className="h-5 w-5" />
            </button>
            <Avatar name="Aïssatou Diallo" size="sm" status="online" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-10 px-5 pt-10">
        <nav aria-label="Sommaire" className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1 border-l border-border pl-4">
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-sm py-1 text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1">
          <div className="mb-16">
            <Badge variant="accent" className="mb-4">
              Design System — Phase 3 · Style Guide
            </Badge>
            <h1 className="font-display text-display text-foreground">
              Confort<span className="text-accent-600">+</span>
            </h1>
            <p className="mt-3 max-w-xl text-body-lg text-muted-foreground">
              Référence vivante des tokens (Phase 1) et des composants (Phase 2) du design system —
              chaque bloc ci-dessous utilise le composant réel importé depuis{' '}
              <code className="rounded-sm bg-surface px-1.5 py-0.5 text-caption">src/components</code>, pas une
              reproduction visuelle.
            </p>
          </div>

          <Section id="colors" title="Couleurs" description="Primary (bleu nuit) et accent (vert profond) — échelles 50 à 950.">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <SwatchRow label="Primary — #102A43 (800) / #071A2B (900)">
                <div className="flex overflow-hidden rounded-lg border border-border">
                  {PRIMARY_SWATCHES.map((s) => (
                    <div key={s.key} className={`h-14 flex-1 ${s.cls}`} title={`primary-${s.key}`} />
                  ))}
                </div>
              </SwatchRow>
              <SwatchRow
                label="Accent — #16A875 (600) / #087A55 (800)"
                note="secondary-* reste un alias CSS de accent-* pour la rétrocompatibilité (dette technique assumée, voir DESIGN_SYSTEM.md)."
              >
                <div className="flex overflow-hidden rounded-lg border border-border">
                  {ACCENT_SWATCHES.map((s) => (
                    <div key={s.key} className={`h-14 flex-1 ${s.cls}`} title={`accent-${s.key}`} />
                  ))}
                </div>
              </SwatchRow>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SwatchRow label="Success">
                <div className="h-12 rounded-lg bg-success" />
              </SwatchRow>
              <SwatchRow label="Warning">
                <div className="h-12 rounded-lg bg-warning" />
              </SwatchRow>
              <SwatchRow label="Danger">
                <div className="h-12 rounded-lg bg-danger" />
              </SwatchRow>
              <SwatchRow label="Ring / focus">
                <div className="h-12 rounded-lg bg-ring" />
              </SwatchRow>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <SwatchRow label="Background">
                <div className="h-12 rounded-lg border border-border bg-background" />
              </SwatchRow>
              <SwatchRow label="Surface">
                <div className="h-12 rounded-lg border border-border bg-surface" />
              </SwatchRow>
              <SwatchRow label="Foreground">
                <div className="h-12 rounded-lg bg-foreground" />
              </SwatchRow>
              <SwatchRow label="Muted foreground">
                <div className="h-12 rounded-lg bg-muted-foreground" />
              </SwatchRow>
              <SwatchRow label="Border">
                <div className="h-12 rounded-lg border border-border bg-border" />
              </SwatchRow>
            </div>

            <div className="mt-8">
              <p className="mb-2 text-body-sm font-semibold text-muted-foreground">
                Couleurs de véhicules — indépendantes de la palette de marque (rendu carte façon Yango)
              </p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(VEHICLE_COLORS).map(([id, c]) => (
                  <div key={id} className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full border border-border shadow-card" style={{ backgroundColor: c.hex }} />
                    <span className="text-caption text-muted-foreground">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="typography" title="Typographie" description="Inter — famille unique, 9 tokens couvrant l'ensemble de l'app.">
            <div className="space-y-4">
              {TYPE_TOKENS.map((t) => (
                <div key={t.name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-3">
                  <p className={`${t.cls} text-foreground`}>{t.name}</p>
                  <span className="font-mono text-caption text-muted-foreground">{t.spec}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="spacing" title="Spacing" description="Échelle 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 — éviter les valeurs arbitraires.">
            <div className="space-y-2.5">
              {SPACING_TOKENS.map((px) => (
                <div key={px} className="flex items-center gap-4">
                  <span className="w-10 shrink-0 text-caption text-muted-foreground">{px}px</span>
                  <div className="h-3 rounded-full bg-accent-500" style={{ width: px * 3 }} />
                </div>
              ))}
            </div>
          </Section>

          <Section id="radius" title="Border radius" description="5 tokens — mapping fixe par type de composant.">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
              {RADIUS_TOKENS.map((r) => (
                <div key={r.name} className="text-center">
                  <div className={`mx-auto mb-2 h-16 w-16 border-2 border-primary-700 bg-primary-50 ${r.cls}`} />
                  <p className="text-body-sm font-semibold text-foreground">{r.name}</p>
                  <p className="text-caption text-muted-foreground">{r.px}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground">{r.usage}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="shadows" title="Ombres" description="4 niveaux, volontairement discrets — esthétique premium et légère.">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {SHADOW_TOKENS.map((s) => (
                <div key={s.name} className="text-center">
                  <div className={`mx-auto mb-2 h-20 w-20 rounded-lg bg-surface ${s.cls}`} />
                  <p className="text-body-sm font-medium text-foreground">{s.name}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="buttons" title="Boutons">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
              <Button variant="primary" loading>
                Chargement...
              </Button>
              <Button variant="primary" disabled>
                Désactivé
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <IconButton icon={<MapPin className="h-5 w-5" />} aria-label="Localisation" variant="primary" />
              <IconButton icon={<Search className="h-5 w-5" />} aria-label="Rechercher" variant="outline" />
              <IconButton icon={<Bell className="h-5 w-5" />} aria-label="Notifications" variant="ghost" />
              <Tooltip content="Action désactivée temporairement">
                <IconButton icon={<Wallet className="h-5 w-5" />} aria-label="Portefeuille" variant="outline" disabled />
              </Tooltip>
            </div>
          </Section>

          <Section id="forms" title="Formulaires">
            <div className="grid max-w-xl grid-cols-1 gap-4">
              <Input label="Numéro de téléphone" placeholder="622 00 11 22" />
              <Input label="Email" icon={<Search className="h-4 w-4" />} placeholder="vous@exemple.com" />
              <Input label="Mot de passe" type="password" error="Minimum 8 caractères requis" />
              <SearchInput value={search} onChange={setSearch} />
              <Textarea label="Commentaire" placeholder="Laissez un commentaire sur votre course..." />
              <Select label="Quartier" defaultValue={NEIGHBORHOODS[0].id}>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </Select>
              <Checkbox
                label="Recevoir les notifications par SMS"
                description="Vous serez alerté à chaque étape de votre course."
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <RadioGroup label="Type de véhicule préféré" orientation="horizontal">
                <Radio
                  name="vehicule-pref"
                  value="voiture"
                  label="Voiture"
                  checked={radioValue === 'voiture'}
                  onChange={() => setRadioValue('voiture')}
                />
                <Radio
                  name="vehicule-pref"
                  value="moto"
                  label="Moto"
                  checked={radioValue === 'moto'}
                  onChange={() => setRadioValue('moto')}
                />
              </RadioGroup>
              <Switch checked={switchOn} onChange={() => setSwitchOn((v) => !v)} label="Activer le mode nuit" />
            </div>
          </Section>

          <Section id="selectors" title="Sélecteurs & navigation">
            <div className="flex flex-col gap-6">
              <SegmentedControl
                label="Type de véhicule"
                value={segment}
                onChange={setSegment}
                options={[
                  { value: 'VOITURE', label: 'Voiture', icon: <Car className="h-4 w-4" /> },
                  { value: 'MOTO', label: 'Moto', icon: <Bike className="h-4 w-4" /> },
                ]}
              />
              <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: 'apercu', label: 'Aperçu' },
                  { value: 'historique', label: 'Historique' },
                  { value: 'documents', label: 'Documents' },
                ]}
              />
              <FilterChips
                label="Filtrer par statut"
                value={filter}
                onChange={setFilter}
                options={[
                  { id: 'all', label: 'Tous' },
                  { id: 'active', label: 'Actifs' },
                  { id: 'suspended', label: 'Suspendus' },
                ]}
              />
              <Pagination page={page} totalPages={6} onPageChange={setPage} />
            </div>
          </Section>

          <Section id="badges" title="Badges & statuts">
            <div className="flex flex-wrap gap-3">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Succès</Badge>
              <Badge variant="warning">Avertissement</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="neutral">Neutre</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(Object.keys(RIDE_STATUS_CONFIG) as RideStatus[]).map((status) => (
                <StatusBadge key={status} status={status} config={RIDE_STATUS_CONFIG} />
              ))}
            </div>
          </Section>

          <Section id="cards" title="Cartes & données">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((cat) => {
                const config = RIDE_CATEGORIES_CONFIG[cat];
                const isMoto = cat === 'MOTO_SINGLE';
                return (
                  <Card key={cat} interactive selected={category === cat} onClick={() => setCategory(cat)} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary-800">
                        {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                      </div>
                      {category === cat && <CheckCircle2 className="h-5 w-5 text-accent-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{config.label}</p>
                      <p className="text-caption text-muted-foreground">{config.capacity}</p>
                    </div>
                    <p className="font-display text-h3 text-foreground">{formatFare(fares[cat])}</p>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Courses aujourd'hui" value="248" trend={{ value: '+12% vs hier' }} icon={<Car className="h-5 w-5" />} />
              <StatCard label="Chauffeurs actifs" value="63" trend={{ value: '+4 nouveaux' }} icon={<Users className="h-5 w-5" />} />
              <StatCard label="Revenu du jour" value={formatFare(1850000)} icon={<Wallet className="h-5 w-5" />} />
              <StatCard label="Note moyenne" value="4.8/5" icon={<Star className="h-5 w-5" />} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="flex items-center gap-4">
                <Avatar name="Mamadou Bah" size="lg" status="online" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Mamadou Bah</p>
                  <p className="text-body-sm text-muted-foreground">Toyota Corolla · RC-1234-A</p>
                  <Rating value={4.9} showValue size={14} className="mt-1" />
                </div>
              </Card>
              <Card>
                <p className="mb-2 text-body-sm font-medium text-foreground">Noter le chauffeur</p>
                <Rating value={ratingDemo} interactive onChange={setRatingDemo} size={26} />
              </Card>
            </div>

            <div className="mt-8">
              <p className="mb-2 text-body-sm font-semibold text-muted-foreground">Table + Pagination (aperçu admin)</p>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Nom</TableHeaderCell>
                    <TableHeaderCell>Rôle</TableHeaderCell>
                    <TableHeaderCell>Courses</TableHeaderCell>
                    <TableHeaderCell>Statut</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {MOCK_TABLE_ROWS.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>{row.trips}</TableCell>
                      <TableCell>
                        <Badge variant={row.status.variant}>{row.status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section id="states" title="États d'interface" description="Loading, empty, error — jamais d'écran blanc sans fallback.">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card noPadding className="p-5">
                <p className="mb-3 text-body-sm font-semibold text-muted-foreground">Loading</p>
                <SkeletonGroup>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <SkeletonText lines={2} className="flex-1" />
                  </div>
                  <SkeletonCard className="mt-4" />
                </SkeletonGroup>
              </Card>
              <Card noPadding>
                <EmptyState
                  icon={<Clock className="h-7 w-7" />}
                  title="Aucune course récente"
                  description="Vos trajets apparaîtront ici."
                  actionLabel="Réserver une course"
                  onAction={() => toast('Action de démonstration')}
                />
              </Card>
              <Card noPadding>
                <ErrorState onRetry={() => toast.success('Nouvelle tentative lancée')} />
              </Card>
            </div>
          </Section>

          <Section id="overlays" title="Overlays" description="Modal (focus trap complet) et Bottom Sheet — animations Framer Motion.">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Ouvrir une modale
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(true)}>
                Ouvrir un bottom sheet
              </Button>
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                Ouvrir une confirmation destructive
              </Button>
              <Button variant="ghost" onClick={() => toast('Toast de démonstration')}>
                Déclencher un toast
              </Button>
            </div>
          </Section>

          <Section id="business" title="Composants métier" description="Construits sur les modèles TypeScript réels (Ride, Driver, Vehicle, SavedPaymentMethod).">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">RideCard</p>
                <RideCard ride={MOCK_RIDE} statusConfig={RIDE_STATUS_CONFIG} />
              </div>
              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">DriverCard</p>
                <Card>
                  <DriverCard driver={MOCK_DRIVER} eta="4 min" />
                </Card>
              </div>

              <div className="lg:col-span-2">
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">RideOptionCard (role=radio dans un radiogroup)</p>
                <div role="radiogroup" aria-label="Catégorie de course" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((cat) => {
                    const config = RIDE_CATEGORIES_CONFIG[cat];
                    const isMoto = cat === 'MOTO_SINGLE';
                    return (
                      <RideOptionCard
                        key={cat}
                        icon={isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                        name={config.label}
                        description={config.capacity}
                        eta="3-6 min"
                        price={fares[cat]}
                        selected={category === cat}
                        onSelect={() => setCategory(cat)}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">VehicleCard</p>
                <VehicleCard vehicle={MOCK_DRIVER.vehicle} />
              </div>
              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">RideSummary</p>
                <Card>
                  <RideSummary pickup={MOCK_RIDE.pickup} destination={MOCK_RIDE.destination} />
                </Card>
              </div>

              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">PriceBreakdown</p>
                <Card>
                  <PriceBreakdown
                    items={[
                      { label: 'Course de base', amount: 38000 },
                      { label: 'Frais de service', amount: 4000 },
                      { label: 'Assurance trajet', amount: 3000 },
                    ]}
                    total={45000}
                  />
                </Card>
              </div>
              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">PaymentMethodRow (sélection)</p>
                <div role="radiogroup" aria-label="Moyen de paiement" className="space-y-2.5">
                  {MOCK_PAYMENT_METHODS.map((m) => (
                    <PaymentMethodRow
                      key={m.id}
                      method={m}
                      icon={PAYMENT_ICONS[m.method]}
                      selected={paymentId === m.id}
                      onSelect={() => setPaymentId(m.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">PaymentMethodRow (gestion)</p>
                <PaymentMethodRow
                  method={MOCK_PAYMENT_METHODS[1]}
                  icon={PAYMENT_ICONS.VISA}
                  onSetDefault={() => toast('Définie par défaut')}
                  onRemove={() => toast.error('Suppression (démonstration)')}
                />
              </div>
              <div>
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">MapMarkerIcon</p>
                <Card className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <MapMarkerIcon color={MAP_MARKER_COLORS.pickup} size={20} />
                    <span className="text-caption text-muted-foreground">Départ</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <MapMarkerIcon color={MAP_MARKER_COLORS.destination} size={20} />
                    <span className="text-caption text-muted-foreground">Arrivée</span>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <p className="mb-2 text-body-sm font-semibold text-muted-foreground">
                  SafetyPanel — SOS accessible mais non dominant (brief § 17)
                </p>
                <Card>
                  <SafetyPanel
                    onShareTrip={() => toast('Trajet partagé (démonstration)')}
                    onCallDriver={() => toast('Appel du chauffeur (démonstration)')}
                    onContactSupport={() => toast('Support contacté (démonstration)')}
                    onReportIssue={() => toast('Signalement envoyé (démonstration)')}
                    onSOS={() => toast.error('SOS déclenché (démonstration)')}
                  />
                </Card>
              </div>
            </div>
          </Section>

          <Section id="icons" title="Iconographie & logo" description="Une seule famille d'icônes (lucide-react) — style minimal, arrondi, cohérent.">
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
              {[Car, Bike, MapPin, Bell, Search, Wallet, ShieldCheck, Star, Users, Clock, Home, Briefcase, CheckCircle2, Smartphone, CreditCard, TrendingUp].map(
                (Icon, i) => (
                  <div
                    key={i}
                    className="flex h-14 items-center justify-center rounded-lg border border-border bg-surface text-primary-800"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Logo size="lg" />
                <span className="text-caption text-muted-foreground">Default</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg bg-primary-800 p-4">
                <Logo size="lg" variant="inverse" />
                <span className="text-caption text-white/70">Inverse</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Logo size="md" showWordmark={false} />
                <span className="text-caption text-muted-foreground">Mark seul</span>
              </div>
            </div>
          </Section>

          <footer className="border-t border-border pt-6 text-center text-caption text-muted-foreground">
            <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-accent-600" />
            Confort+ · Design System — Phases 1 et 2 validées. Phase 3 (ce style guide) en attente de votre revue.
          </footer>
        </main>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Annuler la course ?">
        <p className="text-body text-muted-foreground">
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

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.error('Compte suspendu (démonstration)');
        }}
        title="Suspendre ce compte ?"
        description="Le chauffeur ne pourra plus accepter de courses jusqu'à réactivation."
        confirmLabel="Suspendre"
      />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <p className="mb-1 text-body-sm font-medium text-muted-foreground">Chauffeur trouvé</p>
        <DriverCard driver={MOCK_DRIVER} eta="3 min" />
        <Button variant="primary" size="lg" className="mt-5 w-full" onClick={() => setSheetOpen(false)}>
          Contacter le chauffeur
        </Button>
      </BottomSheet>
    </div>
  );
}
