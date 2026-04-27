import { api } from './api-client'

interface GetRaceResponse {
  race: {
    id: string
    name: string
    distance: number
    city: string
    date: string
    imageUrl: string | null
  }
}

export async function getRace(slug: string, raceId: string) {
  const result = await api
    .get(`clubs/${slug}/races/${raceId}`)
    .json<GetRaceResponse>()

  return result
}
