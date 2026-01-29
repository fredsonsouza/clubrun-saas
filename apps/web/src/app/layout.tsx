import type { Metadata } from 'next'
import { inter, manrope, catamaran } from './fonts'
import './globals.css'

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
    // <html lang="pt-BR" className="dark">
    //   <body
    //     className={`${inter.variable} ${manrope.variable} ${catamaran.variable} font-sans antialiased`}
    //   >
    //     {children}
    //   </body>
    // </html>

    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${manrope.variable} ${catamaran.variable} font-sans antialiased`}
      >
        {/* Background Grid Pattern */}
        <div className="fixed inset-0 -z-50">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(39, 39, 42, 1) 1px, transparent 1px), linear-gradient(to bottom, rgba(39, 39, 42, 1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          {/* Orange Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '600px',
              height: '600px',
              background:
                'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)',
              filter: 'blur(150px)',
            }}
          />
        </div>

        {children}
      </body>
    </html>
  )
}
