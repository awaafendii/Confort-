/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5180,
    strictPort: true,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Confort+ — Mobilité premium à Conakry',
        short_name: 'Confort+',
        description: 'Application de mobilité Confort+',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#102A43',
        lang: 'fr',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Élargi au-delà du défaut (js,css,html) pour que les photos véhicules/services
        // déjà en public/assets/ soient réellement mises en cache par le service worker.
        // Volontairement PAS de runtimeCaching pour tiles.openfreemap.org : les tuiles de
        // carte restent non mises en cache, pas de fausse promesse de carte hors-ligne.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
