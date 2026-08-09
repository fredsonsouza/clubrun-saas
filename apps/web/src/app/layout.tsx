import '@/app/globals.css'

import { ThemeProvider } from '@/components/theme/theme-provider'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { inter, publicSans, spaceGrotesk } from './fonts'

export const metadata: Metadata = {
  title: 'ClubRun | ClubRun',
  description:
    'Sistema de gerenciamento para clubes de corrida de alta performance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${publicSans.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
