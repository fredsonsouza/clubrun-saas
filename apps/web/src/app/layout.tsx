import type { Metadata } from 'next'
import { inter, manrope, catamaran } from './fonts'
import './globals.css'
import { ThemeProvider } from '@/components/theme/theme-provider'

export const metadata: Metadata = {
  title: 'ClubRun',
  description: 'Sistema de gerenciamento para clubes de corrida',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${catamaran.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
