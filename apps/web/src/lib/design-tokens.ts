/**
 * ClubRun Design System - "Social Fitness"
 * Focado em clareza, ar livre, legibilidade de dados e interações suaves.
 */

export const designTokens = {
  colors: {
    primary: {
      light: '#fb923c',
      base: '#f97316', // Laranja da Velocidade (Brand)
      dark: '#ea580c',
    },
    surface: {
      background: '#f9fafb', // Tailwind gray-50
      card: '#ffffff', // Branco puro
      hover: '#f3f4f6', // Tailwind gray-100
      border: '#f3f4f6', // Bordas super sutis
    },
    text: {
      heading: '#111827', // Tailwind gray-900
      body: '#4b5563', // Tailwind gray-600
      muted: '#6b7280', // Tailwind gray-500
    },
  },

  typography: {
    fonts: {
      sans: 'var(--font-inter)', // UI e Corpo
      display: 'var(--font-display)', // Public Sans para Impacto
      mono: 'var(--font-mono)', // Space Grotesk para Métricas (KM, Pace)
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    section: '6rem', // Espaçamento entre seções da Landing Page
  },

  radius: {
    input: '0.75rem', // 12px
    button: '1rem', // 16px
    card: '1.5rem', // 24px - Visual amigável de app nativo
    full: '9999px',
  },
} as const

export type DesignTokens = typeof designTokens
