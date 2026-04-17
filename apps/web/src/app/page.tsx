import { isAuthenticated } from '@/auth/auth'
import { redirect } from 'next/navigation'
import HomePage from './(app)/dashboard/page'

export default async function Home() {
  if (await isAuthenticated()) {
    redirect('/dashboard')
  }

  return <HomePage />
}
