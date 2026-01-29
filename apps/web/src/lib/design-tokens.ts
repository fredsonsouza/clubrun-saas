/**
 * ClubRun Design System
 * Tokens de Design - Cores, Tipografia e Espaçamento
 * Inspirado no Strava com paleta Zinc do shadcn/ui
 */

export const designTokens = {
  /**
   * CORES - Base Laranja + Zinc
   */
  colors: {
    // Laranja (Primário) - Cor principal do app
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Principal - Base
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },

    // Zinc (Neutros) - Do shadcn/ui
    zinc: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },

    // Cores Semânticas
    semantic: {
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Cores de Status para Treinos (Strava-like)
    workout: {
      run: '#fc5200', // Laranja vibrante
      longRun: '#0077b6', // Azul
      interval: '#ef4444', // Vermelho
      recovery: '#22c55e', // Verde
      tempo: '#f59e0b', // Âmbar
      race: '#a855f7', // Roxo
    },
  },

  /**
   * TIPOGRAFIA
   */
  typography: {
    fonts: {
      // Inter - Corpo do texto
      body: 'var(--font-inter)',

      // Manrope - Headings e títulos
      heading: 'var(--font-manrope)',

      // Catamaran - UI elements e números
      display: 'var(--font-cataraman)',
    },

    // Tamanhos
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },

    // Pesos
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    // Altura de linha
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  /**
   * ESPAÇAMENTO
   */
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  /**
   * BORDAS
   */
  radius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px', // Círculo completo
  },

  /**
   * SOMBRAS
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  /**
   * BREAKPOINTS
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

export type DesignTokens = typeof designTokens
