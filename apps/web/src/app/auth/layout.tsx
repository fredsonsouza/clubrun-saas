import { isAuthenticated } from '@/auth/auth'
import { Logo } from '@/components/brand/logo'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (await isAuthenticated()) {
    redirect('/')
  }
  return (
    // <div className="bg-muted absolute inset-0 flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[4rem_4rem] px-4">
    //   <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-sm">
    //     {children}
    //   </div>
    // </div>

    <div className="relative min-h-screen bg-black">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(39, 39, 42, 1) 1px, transparent 1px), linear-gradient(to bottom, rgba(39, 39, 42, 1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            opacity: 0.4,
          }}
        />

        {/* Orange Glow - Multiple layers for visibility */}
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

      {/* Content Layer */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo size={100} showText={true} />
          </div>

          {/* Form Card with Blur */}
          <div
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center gap-6 text-sm text-zinc-500">
            <a href="/terms" className="transition-colors hover:text-zinc-400">
              Termos
            </a>
            <a
              href="/privacy"
              className="transition-colors hover:text-zinc-400"
            >
              Privacidade
            </a>
            <a href="/help" className="transition-colors hover:text-zinc-400">
              Ajuda
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
