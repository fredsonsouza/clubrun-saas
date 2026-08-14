import { auth, isAuthenticated } from '@/auth/auth'
import { getInviteContinuation } from '@/auth/cookies'
import { Header } from '@/components/header'
import { getClubPublicInfo } from '@/http/get-club-public-info'
import { getClubs } from '@/http/get-clubs'
import { getInvite } from '@/http/get-invite'
import { redirect } from 'next/navigation'
import { AcceptInviteForm } from './accept-invite-form'
import { JoinClubForm } from './join-club-form'

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
  const query = await searchParams

  if (query.token || query.inviteId) {
    const captureParams = new URLSearchParams({ continueTo: `/join/${slug}` })
    if (query.token) captureParams.set('token', query.token)
    if (query.inviteId) captureParams.set('inviteId', query.inviteId)
    redirect(`/api/auth/invite-continuation?${captureParams.toString()}`)
  }

  const continuation = await getInviteContinuation()
  if (!continuation) {
    redirect('/explore')
  }

  if (!(await isAuthenticated())) {
    redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(`/join/${slug}`)}`)
  }

  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  }

  const { clubs: userClubs } = await getClubs()
  const isAlreadyMember = userClubs.some((club) => club.slug === slug)

  if (isAlreadyMember) {
    redirect(`/${slug}/dashboard`)
  }

  try {
    if (continuation.inviteId) {
      const { invite } = await getInvite(continuation.inviteId)

      return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
          <Header user={sanitizedUser} />
          <main className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-20 sm:px-6 lg:px-8">
            <AcceptInviteForm invite={invite} user={sanitizedUser} />
          </main>
        </div>
      )
    }

    if (continuation.token) {
      const { club } = await getClubPublicInfo(slug)

      return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
          <Header user={sanitizedUser} />
          <main className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-20 sm:px-6 lg:px-8">
            <JoinClubForm club={club} user={sanitizedUser} />
          </main>
        </div>
      )
    }

    redirect('/explore')
  } catch (error) {
    console.error('Erro ao carregar página de convite:', error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="mb-2 font-bold text-red-600 text-xl">
            Ops! Algo deu errado.
          </h1>
          <p className="mb-4 text-gray-600">
            Não conseguimos carregar as informações do convite. Verifique se o
            link está correto.
          </p>
        </div>
      </div>
    )
  }
}
