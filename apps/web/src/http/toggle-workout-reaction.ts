import { api } from './api-client'

interface ToggleWorkoutReactionRequest {
  slug: string
  workoutId: string
  type: 'LIKE' | 'FIRE' | 'CLAP' | 'TROPHY'
}

interface ToggleWorkoutReactionResponse {
  currentUserReaction: string | null
  reactions: Array<{
    type: string
    count: number
  }>
}

export async function toggleWorkoutReaction({
  slug,
  workoutId,
  type,
}: ToggleWorkoutReactionRequest) {
  const result = await api
    .post(`clubs/${slug}/workouts/${workoutId}/reactions`, {
      json: { type },
    })
    .json<ToggleWorkoutReactionResponse>()

  return result
}
