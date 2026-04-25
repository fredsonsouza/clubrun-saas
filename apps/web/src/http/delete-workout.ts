import { api } from './api-client'

export async function deleteWorkout({
  slug,
  workoutId,
}: {
  slug: string
  workoutId: string
}) {
  await api.delete(`clubs/${slug}/workouts/${workoutId}`)
}
