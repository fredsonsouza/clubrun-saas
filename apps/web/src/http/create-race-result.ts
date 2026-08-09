import { mutationApi } from './api-client'

interface CreateRaceResultRequest {
  slug: string
  raceId: string
  time: number
  position?: number | null
}

export async function createRaceResult({
  slug,
  raceId,
  time,
  position,
}: CreateRaceResultRequest) {
  const result = await mutationApi
    .post(`clubs/${slug}/races/${raceId}/results`, {
      json: {
        time,
        position,
      },
    })
    .json<{ resultId: string }>()

  return result
}
