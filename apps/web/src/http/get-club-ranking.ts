import { api } from './api-client'

interface GetClubRankingRequest {
  slug: string
  type?: 'weekly' | 'monthly' | 'yearly'
  year?: number
  month?: number
  week?: number
}

interface GetClubRankingResponse {
  rankings: Array<{
    id: string
    points: number
    distance: number
    workoutsCount: number
    athlete: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
  }>
}

export async function getClubRanking({
  slug,
  type = 'monthly',
  year,
  month,
  week,
}: GetClubRankingRequest) {
  const result = await api
    .get(`clubs/${slug}/rankings`, {
      searchParams: {
        type,
        ...(year && { year }),
        ...(month && { month }),
        ...(week && { week }),
      },
    })
    .json<GetClubRankingResponse>()

  return result
}
