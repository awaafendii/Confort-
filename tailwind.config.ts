import type { Config } from 'tailwindcss';

/**
 * Confort+ Design System — Tailwind tokens.
 * Palette de marque : bleu nuit (primary), vert profond (secondary), blanc (background).
 * Toutes les couleurs sont exposées en HSL via CSS variables (src/styles/globals.css)
 * afin de permettre un theming runtime cohérent avec shadcn/ui.
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 12px)',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 21 28 / 0.04), 0 1px 6px -1px rgb(16 21 28 / 0.06)',
        elevated: '0 4px 12px -2px rgb(16 21 28 / 0.08), 0 2px 4px -2px rgb(16 21 28 / 0.06)',
        sheet: '0 -4px 24px -4px rgb(16 21 28 / 0.12)',
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        h1: ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        h3: ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
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
