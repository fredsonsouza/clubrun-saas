import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#fb923c',
          500: '#f97316', // Laranja ClubRun principal
          600: '#ea580c',
        },
        surface: {
          bg: '#f9fafb', // Fundo principal (gray-50)
          card: '#ffffff', // Cartões (white)
          hover: '#f3f4f6', // Hover states (gray-100)
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'], // Textos, feeds, labels
        display: ['var(--font-display)', 'system-ui', 'sans-serif'], // Títulos, H1, H2
        mono: ['var(--font-mono)', 'monospace'], // Dados de pace, km e cronômetros
      },
      boxShadow: {
        'soft-card':
          '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'primary-glow': '0 4px 20px rgba(249, 115, 22, 0.25)',
      },
      borderRadius: {
        card: '1.5rem', // 24px para visual de aplicativo
        input: '0.75rem', // 12px para inputs
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
