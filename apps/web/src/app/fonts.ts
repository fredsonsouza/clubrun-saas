import { Inter, Public_Sans, Space_Grotesk } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-display', // Para títulos fortes
  display: 'swap',
})

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-mono', // Para métricas (KM, Pace, Tempo)
  display: 'swap',
})
