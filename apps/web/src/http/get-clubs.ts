import { api } from './api-client'

interface GetClubsResponse {
  clubs: {
    name: string
    id: string
    slug: string
    avatarUrl: string | null
  }[]
}

export async function getClubs() {
  const result = await api.get('clubs').json<GetClubsResponse>()

  return result
}
