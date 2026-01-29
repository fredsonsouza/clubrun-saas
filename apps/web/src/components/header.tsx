import { auth } from '@/auth/auth'
import { HeaderClient } from './header-client'

export default async function Header() {
  const { user } = await auth()

  return <HeaderClient user={user} />
}
