import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-source.svg', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'IBDS - Gestionale eventi e stand',
        short_name: 'IBDS',
        description: 'Gestionale per eventi, stand, crepes, magazzino e turni di lavoro.',
        theme_color: '#b3261c',
        background_color: '#fbf7f1',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'it',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
