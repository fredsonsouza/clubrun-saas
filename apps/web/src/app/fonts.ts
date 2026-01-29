import { Inter, Manrope, Catamaran } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const catamaran = Catamaran({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-catamaran',
  display: 'swap',
})
