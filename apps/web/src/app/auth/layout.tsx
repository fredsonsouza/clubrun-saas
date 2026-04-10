import { isAuthenticated } from '@/auth/auth'
import { redirect } from 'next/navigation'
import clubrunIcon from '@/app/assets/brand/clubrun-icon.png'
import Image from 'next/image'

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (await isAuthenticated()) {
    redirect('/')
  }
  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(39, 39, 42, 1) 1px, transparent 1px), linear-gradient(to bottom, rgba(39, 39, 42, 1) 1px, transparent 1px)',

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
            filter: 'blur(170px)',
          }}
        />
      </div>

      {/* Content Layer */}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}

          <div className="mb-8 flex justify-center gap-1 text-4xl font-bold tracking-tight">
            <Image src={clubrunIcon} alt="ClubRun" className="h-10 w-auto" />
            ClubRun
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
        </div>
      </div>
    </div>
  )
}
