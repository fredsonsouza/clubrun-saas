import { Header } from '@/components/header'
import { auth, isAuthenticated } from '@/auth/auth'
import { getClubPublicInfo } from '@/http/get-club-public-info'
import { getInvite } from '@/http/get-invite'
import { redirect } from 'next/navigation'
import { JoinClubForm } from './join-club-form'
import { AcceptInviteForm } from './accept-invite-form'

interface JoinPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    token?: string
    inviteId?: string
  }>
}

export default async function JoinPage({
  params,
  searchParams,
}: JoinPageProps) {
  const { slug } = await params
  const { token, inviteId } = await searchParams

  if (!token && !inviteId) {
    redirect('/explore')
  }

  const isAuth = await isAuthenticated()

  if (!isAuth) {
    const searchParams = new URLSearchParams()
    searchParams.set('redirectTo', `/join/${slug}`)
    if (token) searchParams.set('token', token)
    if (inviteId) searchParams.set('inviteId', inviteId)
    redirect(`/auth/sign-in?${searchParams.toString()}`)
  }

  const { user } = await auth()

  // Verifica se o usuário já é membro do clube
  const { getClubs } = await import('@/http/get-clubs')
  const { clubs: userClubs } = await getClubs()
  const isAlreadyMember = userClubs.some(c => c.slug === slug)

  if (isAlreadyMember) {
    redirect(`/${slug}/dashboard`)
  }

  try {
    // Caso seja um convite privado via e-mail
    if (inviteId) {
      const { invite } = await getInvite(inviteId)
      
      return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
          <Header user={user} />
          <main className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-20 sm:px-6 lg:px-8">
            <AcceptInviteForm invite={invite} user={user} />
          </main>
        </div>
      )
    }

    // Caso seja um link público com token
    if (token) {
      const { club } = await getClubPublicInfo(slug)
      
      return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
          <Header user={user} />
          <main className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-20 sm:px-6 lg:px-8">
            <JoinClubForm club={club} token={token} user={user} />
          </main>
        </div>
      )
    }

    return redirect('/explore')
  } catch (error) {
    console.error('Erro ao carregar página de convite:', error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Ops! Algo deu errado.</h1>
          <p className="text-gray-600 mb-4">Não conseguimos carregar as informações do convite. Verifique se o link está correto.</p>
          <pre className="text-[10px] bg-gray-100 p-2 rounded text-left overflow-auto max-h-40">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}
