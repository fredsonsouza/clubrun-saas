import { mutationApi } from './api-client'

export async function deleteWorkout({
  slug,
  workoutId,
}: {
  slug: string
  workoutId: string
}) {
  await mutationApi.delete(`clubs/${slug}/workouts/${workoutId}`)
}
