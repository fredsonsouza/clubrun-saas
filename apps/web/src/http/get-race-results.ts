import { api } from './api-client'

interface GetRaceResultsResponse {
  results: {
    id: string
    time: number
    position: number | null
    pace: number | null
    athlete: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
  }[]
}

export async function getRaceResults(slug: string, raceId: string) {
  const result = await api
    .get(`clubs/${slug}/races/${raceId}/results`, {
      next: {
        tags: [`race-results:${raceId}`],
      },
    })
    .json<GetRaceResultsResponse>()

  return result
}
