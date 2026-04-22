import { api } from './api-client'

interface GetClubsResponse {
  clubs: {
    name: string
    id: string
    slug: string
    avatarUrl: string | null
    role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
  }[]
}

export async function getClubs() {
  const result = await api.get('clubs').json<GetClubsResponse>()

  return result
}
