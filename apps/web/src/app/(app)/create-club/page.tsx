import { auth } from '@/auth/auth'
import { CreateClubForm } from './create-club-form'

export default async function CreateClubPage() {
  const { user } = await auth()

  return <CreateClubForm user={user} />
}
