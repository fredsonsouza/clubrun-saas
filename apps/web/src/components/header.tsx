import { auth } from '@/auth/auth'
import { HeaderClient } from './header-client'
import { ClubSwitcher } from './club-switcher'

export default async function Header() {
  const { user } = await auth()

  return <HeaderClient user={user} clubSwitcher={<ClubSwitcher />} />
}
