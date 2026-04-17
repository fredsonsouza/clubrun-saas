import '@/app/globals.css'
import type { Metadata } from 'next'
import { inter, spaceGrotesk, publicSans } from './fonts'
import { ThemeProvider } from '@/components/theme/theme-provider'

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
        </ThemeProvider>
      </body>
    </html>
  )
}
