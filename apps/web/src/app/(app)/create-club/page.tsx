import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'
import { CreateClubForm } from './create-club-form'

export default async function CreateClubPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in?redirectTo=/create-club')
  }

  const simulationEnabled = ['development', 'test'].includes(
    process.env.NODE_ENV ?? ''
  )

  if (!simulationEnabled && !user.isSystemAdmin) {
    redirect('/checkout?plan=starter')
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
