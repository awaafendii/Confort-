# Confort+ — Mobilité premium à Conakry

Plateforme de mise en relation VTC & moto-taxi pour Conakry (Guinée), avec espaces
passager, chauffeur et administrateur. Voir **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**
pour l'architecture complète, la roadmap en 13 phases et le détail de chaque phase livrée.

## Démarrer

```bash
npm install
npm run dev
```

L'app tourne sur **http://localhost:5180** (port fixé dans `vite.config.ts`, voir
`docs/ARCHITECTURE.md` si ce port est déjà pris ailleurs sur votre machine).

- `/` aiguille automatiquement vers l'onboarding, l'accueil (si déjà connecté) ou l'écran de bienvenue.
- Sur `/login`, la section **Accès rapide démo** permet de se connecter instantanément comme Passager, Pilote, Admin ou Super Admin, sans backend réel.
- `/design-system` reste accessible pour consulter la vitrine du design system (Phase 1).

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement (Vite) |
| `npm run build` | Vérification des types + build de production |
| `npm run preview` | Sert le build de production localement |
| `npm run typecheck` | Vérification des types seule (`tsc -b`) |
| `npm run test` | Lance la suite de tests (Vitest) une fois |
| `npm run test:watch` | Suite de tests en mode watch |

## Stack

React 19 + TypeScript + Vite, Tailwind CSS, Zustand, React Router, MapLibre GL,
Recharts, Vitest + React Testing Library. Détail complet dans
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Origine du projet

Ce dépôt remplace progressivement le prototype **WONKHAI** (`App.tsx` à la racine,
conservé comme référence métier, non importé par l'app). La grille tarifaire WONKHAI
reste la source de vérité, portée à l'identique dans `src/data/pricing.ts`.
