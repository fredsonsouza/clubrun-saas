import { api } from './api-client'

interface CreateWorkoutRequest {
  slug: string
  title: string
  distance: number
  duration: number
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
}: CreateWorkoutRequest) {
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
      },
    })
    .json<{ workoutId: string }>()

  return result
}
