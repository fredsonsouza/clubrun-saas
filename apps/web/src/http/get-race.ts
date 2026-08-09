import { api } from './api-client'

interface GetRaceResponse {
  race: {
    id: string
    name: string
    distance: number
    city: string
    date: string
    imageUrl: string | null
    routeData: any | null
  }
}

export async function getRace(
  slug: string,
  raceId: string,
  signal?: AbortSignal
) {
  const result = await api
    .get(`clubs/${slug}/races/${raceId}`, { signal })
    .json<GetRaceResponse>()

  return result
}
