import { api } from './api-client'

interface CreateRaceRequest {
  slug: string
  name: string
  distance: number
  city: string
  date: Date
  imageUrl?: string | null
  routeData?: any | null
}

export async function createRace({
  slug,
  name,
  distance,
  city,
  date,
  imageUrl,
  routeData,
}: CreateRaceRequest) {
  const result = await api
    .post(`clubs/${slug}/races`, {
      json: {
        name,
        distance,
        city,
        date,
        imageUrl,
        routeData,
      },
    })
    .json<{ raceId: string }>()

  return result
}
