import { api } from './api-client'

interface GetRacesResponse {
  races: {
    id: string
    name: string
    distance: number
    city: string
    date: string
    imageUrl: string | null
    isRegistered: boolean
    participants: {
      athlete: {
        id: string
        avatarUrl: string | null
      }
    }[]
    _count: {
      results: number
      participants: number
    }
  }[]
}

export async function getRaces(slug: string) {
  const result = await api
    .get(`clubs/${slug}/races`, {
      next: {
        tags: ['races'],
      },
    })
    .json<GetRacesResponse>()

  return result
}
