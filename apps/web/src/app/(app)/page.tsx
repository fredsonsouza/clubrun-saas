import { auth } from '@/auth/auth'
import { Header } from '@/components/header'

export default async function Home() {
  const { user } = await auth()
  return (
    <div className="py-4">
      <Header user={user} />
      <main></main>
    </div>
  )
}
