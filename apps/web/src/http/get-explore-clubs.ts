import { api } from './api-client'

interface GetExploreClubsResponse {
  clubs: {
    id: string
    name: string
    slug: string
    description: string | null
    avatarUrl: string | null
    membersCount: number
    location: string | null
    membershipStatus: 'MEMBER' | 'NONE' | 'PENDING'
  }[]
}

export async function getExploreClubs() {
  const result = await api.get('explore/clubs').json<GetExploreClubsResponse>()

  return result
}
