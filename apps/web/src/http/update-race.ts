import { mutationApi } from './api-client'

interface UpdateRaceRequest {
  name?: string
  distance?: number
  city?: string
  date?: string
  imageUrl?: string | null
  routeData?: any | null
}

export async function updateRace(
  slug: string,
  raceId: string,
  data: UpdateRaceRequest
) {
  await mutationApi.put(`clubs/${slug}/races/${raceId}`, {
    json: data,
  })
}
