import { api } from './api-client'

interface GetWorkoutsRequest {
  slug: string
  page?: number
  limit?: number
  status?: 'PLANNED' | 'COMPLETED'
}

interface GetWorkoutsResponse {
  workouts: Array<{
    id: string
    title: string | null
    slug: string | null
    distance: number
    duration: number | null
    pace: number | null
    type: string
    status: 'PLANNED' | 'COMPLETED'
    assignmentMode: 'GOAL' | 'FREE' | null
    date: string
    notes: string | null
    imageUrl: string | null
    createdAt: string
    clubId: string
    athlete: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
  }>
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getWorkouts({ slug, page = 1, limit = 20, status = 'COMPLETED' }: GetWorkoutsRequest) {
  const result = await api
    .get(`clubs/${slug}/workouts`, {
      searchParams: {
        page,
        limit,
        status,
      },
    })
    .json<GetWorkoutsResponse>()

  return result
}
