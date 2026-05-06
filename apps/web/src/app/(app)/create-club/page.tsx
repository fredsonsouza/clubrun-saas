import { auth } from '@/auth/auth'
import { CreateClubForm } from './create-club-form'
import { redirect } from 'next/navigation'

export default async function CreateClubPage({
  searchParams,
}: {
  searchParams: Promise<{ checkoutComplete?: string }>
}) {
  const { user } = await auth()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  const resolvedSearchParams = await searchParams

  const isSuperAdmin = user.isSystemAdmin || user.email === 'admin@clubrun.com'

  // Se não for super admin e não veio do checkout recém-finalizado, manda pro checkout
  if (!isSuperAdmin && resolvedSearchParams.checkoutComplete !== 'true') {
    redirect('/checkout?plan=pro')
  }

  return (
    <CreateClubForm 
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }} 
    />
  )
}
