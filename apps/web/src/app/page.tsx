import { auth } from '@/auth/auth'
import { LandingPage } from '@/components/landing-page'
import { getClubs } from '@/http/get-clubs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function IndexPage() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return <LandingPage />
  }

  const { user } = await auth()

  /* Temporariamente desativado para facilitar o desenvolvimento
  if (!user.emailVerifiedAt) {
    redirect('/auth/verify-email')
  }
  */

  // Usuário autenticado e verificado: buscar clubes
  let clubs = []

  try {
    const data = await getClubs()
    clubs = data.clubs
  } catch (error) {
    redirect('/explore')
  }

  if (clubs.length > 0) {
    redirect(`/${clubs[0].slug}/dashboard`)
  }

  // Se não tem clubes, vai para o explorar
  redirect('/explore')
}
