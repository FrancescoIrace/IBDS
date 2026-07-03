import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Palette "Boss": rosso e oro presi dai colori reali dello stand (insegne,
// dolci, carta forno), riportati su toni neutri caldi. Il rosso "Elimina"
// resta quello standard di Chakra (leggermente diverso) così le azioni
// distruttive restano riconoscibili dal rosso del brand.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#fbefec' },
          100: { value: '#f6deda' },
          200: { value: '#edbcb4' },
          300: { value: '#e0968a' },
          400: { value: '#d0705e' },
          500: { value: '#c93d2e' },
          600: { value: '#b3261c' },
          700: { value: '#7a1912' },
          800: { value: '#5c130e' },
          900: { value: '#3d0d09' },
          950: { value: '#240705' },
        },
        gold: {
          50: { value: '#fbf3e4' },
          100: { value: '#f3e2c2' },
          200: { value: '#e8ca94' },
          300: { value: '#dcae62' },
          400: { value: '#d89b3c' },
          500: { value: '#c1852c' },
          600: { value: '#a06e23' },
          700: { value: '#7a541c' },
          800: { value: '#5a3e16' },
          900: { value: '#3d2a0f' },
          950: { value: '#241809' },
        },
        // Grigi con leggera dominante calda (crema/inchiostro) al posto dei
        // grigi freddi di default: coprono testo, bordi e sfondi in tutta
        // l'app tramite gli stessi token gray.* già usati ovunque.
        gray: {
          50: { value: '#fbf7f1' },
          100: { value: '#f3ece1' },
          200: { value: '#e9dfd3' },
          300: { value: '#d8c9b8' },
          400: { value: '#ad9686' },
          500: { value: '#7c6a5e' },
          600: { value: '#5f5049' },
          700: { value: '#453a34' },
          800: { value: '#2a1f1a' },
          900: { value: '#1d1512' },
          950: { value: '#120d0b' },
        },
      },
      fonts: {
        heading: { value: "'Segoe UI', system-ui, sans-serif" },
        body: { value: "'Segoe UI', system-ui, sans-serif" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.600}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.50}' },
          emphasized: { value: '{colors.brand.200}' },
          focusRing: { value: '{colors.brand.600}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
