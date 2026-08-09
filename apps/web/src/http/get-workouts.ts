import { api } from './api-client'

interface GetWorkoutsRequest {
  slug: string
  page?: number
  limit?: number
  status?: 'PLANNED' | 'COMPLETED'
  athleteId?: string
  signal?: AbortSignal
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
    targetDistance: number | null
    targetDuration: number | null
    syncSource: string | null
    stravaActivityId: string | null
    routeData?: any | null
    createdAt: string
    clubId: string
    athlete: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
    reactions?: Array<{
      type: string
      count: number
    }>
    currentUserReaction?: string | null
    visibility: 'PUBLIC' | 'COACH_ONLY' | 'PRIVATE'
  }>
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getWorkouts({
  slug,
  page = 1,
  limit = 20,
  status = 'COMPLETED',
  athleteId,
  signal,
}: GetWorkoutsRequest) {
  const result = await api
    .get(`clubs/${slug}/workouts`, {
      signal,
      searchParams: {
        page,
        limit,
        status,
        ...(athleteId ? { athleteId } : {}),
      },
    })
    .json<GetWorkoutsResponse>()

  return result
}
