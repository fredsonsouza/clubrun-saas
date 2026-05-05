import { api } from './api-client'

interface getProfileResponse {
  user: {
    id: string | null
    name: string | null
    email: string
    avatarUrl: string | null
    isSystemAdmin: boolean
    emailVerifiedAt: string | null
    role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  }
}

export async function getProfile() {
  const result = await api
    .get('profile', {
      next: {
        revalidate: 0,
      },
      cache: 'no-store',
    })
    .json<getProfileResponse>()
  return result
}
