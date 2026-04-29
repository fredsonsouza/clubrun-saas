import { api } from './api-client'

interface GetClubResponse {
  club: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    description: string | null
    ownerId: string
  }
}

export async function getClub(slug: string) {
  const result = await api.get(`clubs/${slug}`).json<GetClubResponse>()

  return result
}
