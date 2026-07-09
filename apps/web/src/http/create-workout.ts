import { api } from './api-client'

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
}: CreateWorkoutRequest) {
  console.log(
    '[DEBUG] createWorkout HTTP Client payload routeData:',
    routeData ? 'PRESENTE' : 'AUSENTE'
  )

  const result = await api
    .post(`clubs/${slug}/workouts`, {
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
      },
    })
    .json<{ workoutId: string }>()

  return result
}
