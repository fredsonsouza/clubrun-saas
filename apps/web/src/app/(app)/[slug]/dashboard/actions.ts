'use server'

import { deleteWorkout } from '@/http/delete-workout'
import { createWorkout } from '@/http/create-workout'
import { toggleWorkoutReaction } from '@/http/toggle-workout-reaction'
import { revalidatePath } from 'next/cache'

export async function createWorkoutAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const distance = Number(formData.get('distance'))
  const durationRaw = formData.get('duration')
  const duration = durationRaw ? Number(durationRaw) : null
  const type = formData.get('type') as any
  const dateStr = formData.get('date') as string
  const notes = formData.get('notes') as string
  const athleteId = formData.get('athleteId') as string
  const status = formData.get('status') as any
  const assignmentMode = formData.get('assignmentMode') as any

  // Cálculo simples de pace para a API (min/km)
  const pace = (distance > 0 && duration) ? duration / distance : 0

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
      athleteId,
      status,
      assignmentMode,
    })

    revalidatePath(`/${slug}/dashboard`)
    revalidatePath(`/${slug}/ranking`)

    return { success: true, message: 'Treino registrado com sucesso! Motivando o pelotão...' }
  } catch (err) {
    console.error('[createWorkoutAction ERROR]', err)
    if (err && typeof err === 'object' && 'response' in err) {
      try {
        const body = await (err.response as any).json()
        console.error('[createWorkoutAction API ERROR BODY]', body)
        return { success: false, message: `Erro da API: ${body.message || JSON.stringify(body)}` }
      } catch (_) {}
    }
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
    revalidatePath(`/${slug}/dashboard`)
    revalidatePath(`/${slug}/ranking`)
    return { success: true, message: 'Treino removido com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao remover o treino.' }
  }
}

export async function toggleWorkoutReactionAction({
  slug,
  workoutId,
  type,
}: {
  slug: string
  workoutId: string
  type: 'LIKE' | 'FIRE' | 'CLAP' | 'TROPHY'
}) {
  try {
    const res = await toggleWorkoutReaction({ slug, workoutId, type })
    revalidatePath(`/${slug}/dashboard`)
    revalidatePath(`/profile`)
    return { success: true, ...res }
  } catch (err) {
    return { success: false, message: 'Erro ao reagir ao treino.' }
  }
}
