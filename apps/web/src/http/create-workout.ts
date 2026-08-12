import { mutationApi } from './api-client'

interface CreateWorkoutRequest {
  slug: string
  title: string
  distance: number
  duration: number | null
  pace: number
  type:
    | 'EASY'
    | 'INTERVAL'
    | 'TEMPO'
    | 'LONG'
    | 'RECOVERY'
    | 'RACE'
    | 'STRENGTH'
    | 'WALK'
  date: Date
  notes?: string | null
  athleteId?: string | null
  status?: 'PLANNED' | 'COMPLETED'
  assignmentMode?: 'GOAL' | 'FREE' | null
  routeData?: any | null
  visibility?: 'PUBLIC' | 'COACH_ONLY' | 'PRIVATE'
}

export async function createWorkout({
  slug,
  title,
  distance,
  duration,
  pace,
  type,
  date,
  notes,
  athleteId,
  status,
  assignmentMode,
  routeData,
  visibility,
}: CreateWorkoutRequest) {
  console.log(
    '[DEBUG] createWorkout HTTP Client payload routeData:',
    routeData ? 'PRESENTE' : 'AUSENTE'
  )

  const result = await mutationApi
    .post(`clubs/${slug}/workouts`, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      json: {
        title,
        distance,
        duration,
        pace,
        type,
        date,
        notes,
        athleteId,
        status,
        assignmentMode,
        routeData,
        visibility,
      },
    })
    .json<{ workoutId: string }>()

  return result
}
