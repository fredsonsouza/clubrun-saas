import { isAuthenticated } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

/**
 * Esta página atua como o roteador principal da aplicação.
 * Se o usuário não estiver autenticado, mostramos a Landing Page.
 * Se estiver autenticado, redirecionamos para o dashboard do seu primeiro clube
 * ou para a página de exploração caso não tenha clubes.
 */
export default async function IndexPage() {
  const isAuth = await isAuthenticated()

  if (!isAuth) {
    return <LandingPage />
  }

  // Usuário autenticado: buscar clubes
  let clubs = []
  
  try {
    const data = await getClubs()
    clubs = data.clubs
  } catch (error) {
    // Falha na autenticação ou erro de rede -> Logout
    redirect('/api/auth/sign-out')
  }

  if (clubs.length > 0) {
    redirect(`/${clubs[0].slug}/dashboard`)
  }

  // Se não tem clubes, vai para o explorar
  redirect('/explore')
}
