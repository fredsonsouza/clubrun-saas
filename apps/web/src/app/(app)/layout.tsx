import { isAuthenticated } from '@/auth/auth'
import { Header } from '@/components/header'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!isAuthenticated()) {
    redirect('/')
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
