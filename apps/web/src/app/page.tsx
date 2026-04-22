import { isAuthenticated } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

export default async function RootPage() {
  const isAuth = await isAuthenticated()

  if (!isAuth) {
    return <LandingPage />
  }

  // Usuário está logado, vamos decidir para onde mandá-lo
  let clubsData = null

  try {
    clubsData = await getClubs()
  } catch (error) {
    // Se falhar ao buscar clubes (token inválido/expirado), mandamos para o logout
    // para limpar a sessão e evitar loops de redirecionamento.
    redirect('/api/auth/sign-out')
  }

  if (clubsData && clubsData.clubs.length === 0) {
    redirect('/explore')
  }

  if (clubsData && clubsData.clubs.length > 0) {
    redirect(`/${clubsData.clubs[0].slug}/dashboard`)
  }

  return <LandingPage />
}
