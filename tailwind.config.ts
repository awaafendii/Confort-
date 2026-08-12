import type { Config } from 'tailwindcss';

/**
 * Confort+ Design System v2 — Tailwind tokens (refonte UI/UX, Phase 1).
 * Identité : bleu nuit profond (primary), vert émeraude (accent), fond gris-bleu clair.
 * Toutes les couleurs sont exposées en HSL via CSS variables (src/styles/globals.css).
 * Voir docs/DESIGN_SYSTEM.md pour la documentation complète des tokens et leur justification.
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Breakpoints documentés explicitement (Phase 1) — valeurs identiques aux
    // défauts Tailwind, désormais épinglées plutôt qu'implicites : aucun
    // changement de comportement, seulement une décision produit rendue visible.
    screens: {
      sm: '640px',  // mobile large
      md: '768px',  // tablette
      lg: '1024px', // desktop
      xl: '1280px', // large desktop
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Inter comme police unique (Phase 1) — la clé `display` est conservée
        // pour la compatibilité des classNames `font-display` déjà utilisés
        // dans ~15 fichiers ; elle pointe désormais vers Inter, plus Manrope.
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          hover: 'hsl(var(--surface-hover))',
        },
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
          DEFAULT: 'hsl(var(--primary-800))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Nom canonique de la nouvelle identité — à privilégier pour tout
        // nouveau code à partir de la Phase 2. Mêmes valeurs que `secondary`
        // ci-dessous (alias de compatibilité) tant que les écrans existants
        // n'ont pas été migrés.
        accent: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          200: 'hsl(var(--accent-200))',
          300: 'hsl(var(--accent-300))',
          400: 'hsl(var(--accent-400))',
          500: 'hsl(var(--accent-500))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          800: 'hsl(var(--accent-800))',
          900: 'hsl(var(--accent-900))',
          950: 'hsl(var(--accent-950))',
          DEFAULT: 'hsl(var(--accent-600))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Alias de compatibilité Phase 1 (voir globals.css) — à retirer une fois
        // les ~41 écrans migrés vers `accent-*` (Phase 2+).
        secondary: {
          50: 'hsl(var(--secondary-50))',
          100: 'hsl(var(--secondary-100))',
          200: 'hsl(var(--secondary-200))',
          300: 'hsl(var(--secondary-300))',
          400: 'hsl(var(--secondary-400))',
          500: 'hsl(var(--secondary-500))',
          600: 'hsl(var(--secondary-600))',
          700: 'hsl(var(--secondary-700))',
          800: 'hsl(var(--secondary-800))',
          900: 'hsl(var(--secondary-900))',
          950: 'hsl(var(--secondary-950))',
          DEFAULT: 'hsl(var(--secondary-800))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          strong: 'hsl(var(--warning-strong))',
        },
        danger: 'hsl(var(--danger))',
        info: 'hsl(var(--info))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',   // 8px
        md: 'var(--radius-md)',   // 12px — boutons, champs
        lg: 'var(--radius-lg)',   // 16px — cartes
        xl: 'var(--radius-xl)',   // 24px — bottom sheets, modales
        // '2xl' alias temporairement sur xl (24px) le temps que les usages
        // existants de `rounded-2xl` (Card/Modal/BottomSheet — actuellement
        // tous à 24px, cible réelle : Card=16px/lg) soient migrés au cas par
        // cas en Phase 2. Voir docs/DESIGN_SYSTEM.md, section "Dette technique".
        '2xl': 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 21 28 / 0.04), 0 1px 6px -1px rgb(16 21 28 / 0.06)',
        elevated: '0 4px 12px -2px rgb(16 21 28 / 0.08), 0 2px 4px -2px rgb(16 21 28 / 0.06)',
        sheet: '0 -4px 24px -4px rgb(16 21 28 / 0.12)',
        // Nouveau 4e niveau (Phase 1) — plus marqué que `elevated`, pour que
        // les modales se détachent réellement de l'interface plutôt que de
        // réutiliser l'ombre d'une simple carte survolée (constat de l'audit).
        modal: '0 8px 24px -4px rgb(16 21 28 / 0.16), 0 4px 8px -2px rgb(16 21 28 / 0.08)',
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }], // 48px
        h1: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }], // 32px
        h2: ['1.5rem', { lineHeight: '1.25', fontWeight: '700' }], // 24px
        h3: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 20px
        'body-lg': ['1.0625rem', { lineHeight: '1.5', fontWeight: '500' }], // 17px
        body: ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }], // 15px
        'body-sm': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }], // 13px
        caption: ['0.75rem', { lineHeight: '1.3', fontWeight: '500' }], // 12px
        button: ['0.9375rem', { lineHeight: '1', fontWeight: '600' }], // 15px
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
} satisfies Config;
