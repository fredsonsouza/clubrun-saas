import { isAuthenticated } from '@/auth/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!(await isAuthenticated())) {
    redirect('/')
  }

  return <>{children}</>
}
