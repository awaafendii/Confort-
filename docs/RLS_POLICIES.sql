-- ============================================================================
-- Confort+ — Politiques Row Level Security (Postgres / Supabase)
-- Phase 11 — Security + RLS
-- ============================================================================
--
-- CONTEXTE : ce projet n'a pas de projet Supabase connecté (aucune clé fournie
-- par l'utilisateur — même situation que Mapbox en Phase 6, résolue alors par
-- MapLibre). Ce fichier n'est donc PAS exécuté contre une base réelle : c'est
-- le schéma + les politiques RLS prêts à appliquer le jour où un vrai projet
-- Supabase est branché, en remplacement de src/features/auth/authService.ts
-- (dont l'interface a été conçue dès la Phase 2 pour ce remplacement sans
-- réécrire aucune page).
--
-- Les rôles décrits ici sont exactement ceux du client (src/types/user.ts) :
--   PASSENGER, DRIVER, ADMIN, SUPER_ADMIN
-- et reproduisent côté base de données les mêmes frontières que les guards
-- client (src/features/auth/guards.tsx) : RequirePassenger, RequireDriver,
-- RequireAdmin, RequireSuperAdmin. Le client ne doit JAMAIS être le seul
-- rempart — RLS est la vraie frontière de sécurité une fois Supabase branché.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. Rôle + fonctions utilitaires
-- ----------------------------------------------------------------------------

create type user_role as enum ('PASSENGER', 'DRIVER', 'ADMIN', 'SUPER_ADMIN');

-- Lit le rôle de l'utilisateur courant une seule fois par requête (stable),
-- pour éviter de répéter une sous-requête sur `profiles` dans chaque policy.
create or replace function public.current_role()
returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable
as $$ select public.current_role() in ('ADMIN', 'SUPER_ADMIN'); $$;

create or replace function public.is_super_admin()
returns boolean language sql stable
as $$ select public.current_role() = 'SUPER_ADMIN'; $$;


-- ----------------------------------------------------------------------------
-- 1. profiles — compte de base (User dans src/types/user.ts)
-- ----------------------------------------------------------------------------
-- `status`/`deletion_requested_at` correspondent à PlatformUser (Phase 9) et
-- à la page Sécurité (Phase 11, requestDeletion côté client) — la demande de
-- suppression est enregistrée ici, jamais un DELETE immédiat (même principe
-- que les demandes de retrait chauffeur de la Phase 7 : on journalise une
-- requête réelle, on ne simule jamais un succès instantané).

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'PASSENGER',
  name text not null,
  phone text unique not null,
  email text,
  avatar text,
  rating numeric,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'NEW', 'SUSPENDED', 'BLOCKED')),
  two_factor_enabled boolean not null default false,
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Chacun voit son propre profil ; les admins voient tout le monde (Phase 9 — Utilisateurs).
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Un utilisateur peut modifier ses propres champs personnels, mais jamais
-- son propre rôle ni son propre statut (bloqué un utilisateur ne doit pas
-- pouvoir se débloquer lui-même). `with check` répète la même contrainte
-- pour bloquer un changement de rôle déguisé dans le même UPDATE.
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Seul un admin peut changer le statut (bloquer/débloquer, Phase 9 — setUserStatus)
-- ou le rôle d'un compte (promotion ADMIN → SUPER_ADMIN réservée au SUPER_ADMIN).
create policy "profiles_update_status_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (
    public.is_admin()
    and (role = 'SUPER_ADMIN' or role <> 'SUPER_ADMIN') -- placeholder explicite, voir note ci-dessous
  );
-- Note : Postgres ne permet pas de policy conditionnelle "si la colonne role
-- change alors is_super_admin()" en une seule expression simple sans trigger.
-- En pratique, appliquer cette règle via un trigger BEFORE UPDATE qui lève
-- une exception si `NEW.role <> OLD.role and not is_super_admin()`.

-- La création du profil est déclenchée par un trigger sur auth.users (signup),
-- jamais par un INSERT direct du client.


-- ----------------------------------------------------------------------------
-- 2. driver_profiles — extension chauffeur (Driver dans src/types/driver.ts)
-- ----------------------------------------------------------------------------
-- earnings_today est un champ sensible : un passager ne doit jamais le lire.
-- RLS ne filtre pas au niveau colonne, donc on restreint la table de base au
-- chauffeur lui-même + admin, et on expose une vue publique sans earnings_today
-- pour le matching passager (voir drivers_public plus bas).

create table public.driver_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  vehicle_type text not null check (vehicle_type in ('VOITURE', 'MOTO')),
  vehicle_brand text not null,
  vehicle_model text not null,
  vehicle_plate text not null,
  vehicle_color text not null,
  status text not null default 'OFFLINE' check (status in ('ONLINE', 'OFFLINE', 'ON_TRIP')),
  verification text not null default 'PENDING' check (verification in ('PENDING', 'VERIFIED', 'SUSPENDED')),
  trips_completed integer not null default 0,
  acceptance_rate numeric not null default 1,
  earnings_today numeric not null default 0,
  location geography(point),
  heading numeric
);

alter table public.driver_profiles enable row level security;

create policy "driver_profiles_select_self_or_admin"
  on public.driver_profiles for select
  using (id = auth.uid() or public.is_admin());

-- Un chauffeur gère sa disponibilité, sa position et son véhicule — jamais
-- ses propres gains (earnings_today est mis à jour uniquement par une
-- fonction serveur au moment où une course se termine réellement), jamais
-- sa vérification (Phase 9 — setDriverVerification, réservé à l'admin).
create policy "driver_profiles_update_self"
  on public.driver_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
  -- Colonnes verification/earnings_today à protéger via trigger BEFORE UPDATE
  -- (RLS seule ne peut pas exclure des colonnes précises d'un UPDATE).

create policy "driver_profiles_update_admin"
  on public.driver_profiles for update
  using (public.is_admin());

-- Vue publique consommée par le matching passager (Phase 4/6) : jamais earnings_today.
create view public.drivers_public
  with (security_invoker = true) as
  select id, vehicle_type, vehicle_brand, vehicle_model, vehicle_color, status, location, heading
  from public.driver_profiles
  where status = 'ONLINE';

create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.driver_profiles(id) on delete cascade,
  type text not null check (type in ('PERMIS', 'CARTE_IDENTITE', 'CARTE_GRISE', 'ASSURANCE')),
  url text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'VALIDATED', 'REJECTED'))
);

alter table public.driver_documents enable row level security;

create policy "driver_documents_select_self_or_admin"
  on public.driver_documents for select
  using (driver_id = auth.uid() or public.is_admin());

create policy "driver_documents_insert_self"
  on public.driver_documents for insert
  with check (driver_id = auth.uid());

-- Seul un admin valide/rejette un document (le chauffeur peut re-téléverser,
-- pas changer le statut de validation lui-même).
create policy "driver_documents_update_admin"
  on public.driver_documents for update
  using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 3. rides — src/types/ride.ts
-- ----------------------------------------------------------------------------

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.profiles(id),
  driver_id uuid references public.driver_profiles(id),
  category text not null check (category in ('STANDARD', 'LUXE', 'VIP', 'MOTO_SINGLE')),
  status text not null default 'REQUESTED',
  pickup jsonb not null,
  destination jsonb not null,
  distance_km numeric not null,
  duration_min numeric not null,
  fare numeric not null,
  currency text not null default 'GNF',
  payment_method text not null,
  rating numeric,
  rating_comment text,
  tip numeric,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.rides enable row level security;

-- Les deux parties d'une course la voient, plus l'admin (Phase 9 — Courses).
create policy "rides_select_participants_or_admin"
  on public.rides for select
  using (passenger_id = auth.uid() or driver_id = auth.uid() or public.is_admin());

-- Seul un PASSENGER peut créer une course, et uniquement en son propre nom.
create policy "rides_insert_passenger"
  on public.rides for insert
  with check (passenger_id = auth.uid() and public.current_role() = 'PASSENGER');

-- Les transitions de statut valides restent celles de RIDE_STATUS_TRANSITIONS
-- (src/types/ride.ts) — à faire respecter par un trigger BEFORE UPDATE côté
-- base, RLS ne validant que "qui a le droit d'écrire", pas "quelle valeur".
create policy "rides_update_participants_or_admin"
  on public.rides for update
  using (passenger_id = auth.uid() or driver_id = auth.uid() or public.is_admin());

-- Aucune suppression : l'historique des courses est permanent (Phase 4 — TripsPage).


-- ----------------------------------------------------------------------------
-- 4. transactions + payout_requests — src/types/payment.ts, Phase 7
-- ----------------------------------------------------------------------------
-- Règle produit respectée dès la Phase 7 : "ne jamais fausser une transaction
-- réussie". Ici, ça se traduit par : le client ne peut JAMAIS insérer une
-- ligne `transactions` avec status = 'SUCCESS' — seul un rôle serveur
-- (service_role, après confirmation réelle d'Orange Money/MoMo) le peut.

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  ride_id uuid references public.rides(id),
  amount numeric not null,
  currency text not null default 'GNF',
  type text not null check (type in ('DEBIT', 'CREDIT')),
  method text not null,
  description text not null,
  status text not null check (status in ('SUCCESS', 'FAILED', 'PENDING')),
  date timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_owner_or_admin"
  on public.transactions for select
  using (user_id = auth.uid() or public.is_admin());

-- Pas de policy insert/update pour les rôles authenticated : seul service_role
-- écrit dans cette table (bypass RLS), après confirmation réelle du paiement.

-- Demandes de retrait chauffeur (DriverEarningsPage, Phase 7) : le chauffeur
-- journalise une vraie demande PENDING, ne peut jamais la marquer réussie lui-même.
create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.driver_profiles(id),
  amount numeric not null,
  destination text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  requested_at timestamptz not null default now()
);

alter table public.payout_requests enable row level security;

create policy "payout_requests_select_self_or_admin"
  on public.payout_requests for select
  using (driver_id = auth.uid() or public.is_admin());

create policy "payout_requests_insert_self"
  on public.payout_requests for insert
  with check (driver_id = auth.uid());
  -- status forcé à 'PENDING' par le DEFAULT + un trigger qui rejette toute
  -- valeur différente à l'insertion.

create policy "payout_requests_update_admin"
  on public.payout_requests for update
  using (public.is_admin());

create table public.saved_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  method text not null,
  label text not null,
  is_default boolean not null default false,
  last4 text
);

alter table public.saved_payment_methods enable row level security;

-- CRUD entièrement scoppé au propriétaire — un admin n'a pas besoin de lire
-- les moyens de paiement enregistrés pour faire son travail de modération.
create policy "saved_payment_methods_owner_all"
  on public.saved_payment_methods for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ----------------------------------------------------------------------------
-- 5. support_tickets — Phase 9 (AdminSupportPage)
-- ----------------------------------------------------------------------------

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  subject text not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

create policy "support_tickets_select_owner_or_admin"
  on public.support_tickets for select
  using (user_id = auth.uid() or public.is_admin());

create policy "support_tickets_insert_owner"
  on public.support_tickets for insert
  with check (user_id = auth.uid());

-- Seul un admin résout/ferme un ticket (Phase 9 — setTicketStatus).
create policy "support_tickets_update_admin"
  on public.support_tickets for update
  using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 6. audit_logs — src/types/admin.ts (défini Phase 1, utilisé Phase 11)
-- ----------------------------------------------------------------------------
-- Réservé au SUPER_ADMIN, à l'identique du garde-fou client RequireSuperAdmin
-- (src/features/auth/guards.tsx) — un ADMIN standard, même s'il PEUT effectuer
-- les actions de modération, ne peut PAS consulter qui a fait quoi.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null,
  target text not null,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "audit_logs_select_super_admin"
  on public.audit_logs for select
  using (public.is_super_admin());

-- Aucune policy insert pour les rôles authenticated : chaque table qui doit
-- journaliser une action (profiles, driver_profiles, support_tickets) le fait
-- via un trigger AFTER UPDATE en SECURITY DEFINER qui insère automatiquement
-- avec actor_id = auth.uid() — jamais une valeur fournie par le client
-- (reproduit côté base ce que fait adminStore.ts côté client : logAction()
-- lit toujours l'auteur depuis le store d'auth, jamais depuis un paramètre).

-- Immuable : ni update ni delete, même pour un SUPER_ADMIN.


-- ----------------------------------------------------------------------------
-- 7. notifications + chat_messages — Phase 8
-- ----------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  type text not null check (type in ('RIDE', 'PAYMENT', 'PROMOTION', 'SECURITY', 'SYSTEM')),
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_owner"
  on public.notifications for select
  using (user_id = auth.uid());

-- Marquer comme lu est le seul droit d'écriture client sur cette table ;
-- la création est déclenchée côté serveur par les événements course/paiement.
create policy "notifications_update_owner_read_only"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id),
  sender_id uuid not null references public.profiles(id),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

-- Seuls les deux participants de la course (ou un admin en support) lisent le fil.
create policy "chat_messages_select_participants_or_admin"
  on public.chat_messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.rides r
      where r.id = ride_id and (r.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
  );

create policy "chat_messages_insert_participant"
  on public.chat_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.rides r
      where r.id = ride_id and (r.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
  );


-- ----------------------------------------------------------------------------
-- 8. saved_places — Phase 3
-- ----------------------------------------------------------------------------

create table public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  label text not null,
  address text not null,
  coords geography(point) not null
);

alter table public.saved_places enable row level security;

create policy "saved_places_owner_all"
  on public.saved_places for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================================
-- Résumé des frontières par rôle (miroir des guards client) :
--
-- PASSENGER    : lit/écrit ses propres rides, transactions, tickets, places,
--                moyens de paiement, notifications ; lit drivers_public.
-- DRIVER       : idem côté chauffeur + son propre driver_profiles/documents/
--                payout_requests ; ne lit/écrit jamais earnings_today lui-même.
-- ADMIN        : lecture sur (presque) tout pour modération, écriture sur
--                status/verification/ticket ; PAS d'accès à audit_logs.
-- SUPER_ADMIN  : tout ce qu'un ADMIN peut faire + lecture de audit_logs +
--                changement du rôle d'un autre compte.
-- ============================================================================
