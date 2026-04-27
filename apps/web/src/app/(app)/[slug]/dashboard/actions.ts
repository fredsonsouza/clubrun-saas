'use server'

import { deleteWorkout } from '@/http/delete-workout'
import { createWorkout } from '@/http/create-workout'
import { revalidateTag } from 'next/cache'

export async function createWorkoutAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const distance = Number(formData.get('distance'))
  const duration = Number(formData.get('duration'))
  const type = formData.get('type') as any
  const dateStr = formData.get('date') as string
  const notes = formData.get('notes') as string

  // Cálculo simples de pace para a API (min/km)
  const pace = distance > 0 ? duration / distance : 0

  try {
    await createWorkout({
      slug,
      title,
      distance,
      duration,
      pace,
      type,
      date: new Date(dateStr),
      notes,
    })

    revalidateTag('workouts')
    revalidateTag('ranking')

    return { success: true, message: 'Treino registrado com sucesso! Motivando o pelotão...' }
  } catch (err) {
    return { success: false, message: 'Erro ao registrar treino. Verifique os dados.' }
  }
}

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
