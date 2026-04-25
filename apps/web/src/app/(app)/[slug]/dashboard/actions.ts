'use server'

import { deleteWorkout } from '@/http/delete-workout'
import { revalidateTag } from 'next/cache'

export async function deleteWorkoutAction({
  slug,
  workoutId,
}: {
  slug: string
  workoutId: string
}) {
  try {
    await deleteWorkout({ slug, workoutId })
    revalidateTag('workouts')
    return { success: true, message: 'Treino removido com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao remover o treino.' }
  }
}
