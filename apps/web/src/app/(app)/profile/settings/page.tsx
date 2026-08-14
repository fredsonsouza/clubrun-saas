import { getProfile } from '@/http/get-profile'
import { redirect } from 'next/navigation'
import { ProfileSettingsClient } from './settings-client'

export default async function ProfileSettingsPage() {
  const { user } = await getProfile()

  if (!user?.id) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="space-y-4">
      <ProfileSettingsClient
        user={{
          ...user,
          id: user.id,
        }}
      />
    </div>
  )
}
