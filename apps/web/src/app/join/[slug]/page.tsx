import { Header } from '@/components/header'
import { auth, isAuthenticated } from '@/auth/auth'
import { getClubPublicInfo } from '@/http/get-club-public-info'
import { redirect } from 'next/navigation'
import { JoinClubForm } from './join-club-form'

interface JoinPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    token?: string
  }>
}

export default async function JoinPage({
  params,
  searchParams,
}: JoinPageProps) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) {
    redirect('/explore')
  }

  const isAuth = await isAuthenticated()

  if (!isAuth) {
    const params = new URLSearchParams()
    params.set('redirectTo', `/join/${slug}`)
    params.set('token', token)
    redirect(`/auth/sign-in?${params.toString()}`)
  }

  const { user } = await auth()

  try {
    const { club } = await getClubPublicInfo(slug)

    return (
      <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
        <Header user={user} />

        <main className="animate-in fade-in mx-auto flex max-w-7xl flex-col items-center px-4 pt-20 duration-700 sm:px-6 lg:px-8">
          <JoinClubForm club={club} token={token} user={user} />
        </main>
      </div>
    )
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
