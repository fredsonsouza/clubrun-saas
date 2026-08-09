import { mutationApi } from './api-client'

type WorkoutReaction = 'LIKE' | 'FIRE' | 'CLAP' | 'TROPHY'

export async function setWorkoutReaction({
  slug,
  workoutId,
  type,
}: {
  slug: string
  workoutId: string
  type: WorkoutReaction | null
}) {
  const endpoint = `clubs/${slug}/workouts/${workoutId}/reactions/me`

  if (type) {
    await mutationApi.put(endpoint, { json: { type } })
  } else {
    await mutationApi.delete(endpoint)
  }
}
