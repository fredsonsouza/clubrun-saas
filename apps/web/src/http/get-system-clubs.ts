import { api } from './api-client'

interface GetSystemClubsResponse {
  clubs: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    createdAt: string
    owner: {
      name: string | null
      email: string
    }
    _count: {
      members: number
    }
  }[]
}

export async function getSystemClubs() {
  const result = await api
    .get('system/clubs')
    .json<GetSystemClubsResponse>()

  return result
}
