import { getProfile } from '@/http/get-profile'
import { ProfileSettingsClient } from './settings-client'
import { redirect } from 'next/navigation'

export default async function ProfileSettingsPage() {
  const { user } = await getProfile()

  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="space-y-4">
      <ProfileSettingsClient user={user} />
    </div>
  )
}
