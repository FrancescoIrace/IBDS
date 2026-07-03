import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Palette minimale: verde-petrolio come colore brand, grigi neutri per il resto.
// Scelta pensata per leggibilità e semplicità su schermi piccoli / utenti poco
// esperti: pochi colori, alto contrasto, niente sfumature decorative.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#eefbf9' },
          100: { value: '#d3f3ee' },
          200: { value: '#a6e6dd' },
          300: { value: '#72d3c5' },
          400: { value: '#42b8a9' },
          500: { value: '#279d8f' },
          600: { value: '#1c7d73' },
          700: { value: '#1a635e' },
          800: { value: '#194f4c' },
          900: { value: '#193f3e' },
          950: { value: '#092524' },
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
