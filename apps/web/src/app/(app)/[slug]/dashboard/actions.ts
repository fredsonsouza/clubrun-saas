'use server'

import { createWorkout } from '@/http/create-workout'
import { deleteWorkout } from '@/http/delete-workout'
import { setWorkoutReaction } from '@/http/workout-reactions'
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
  const routeDataRaw = formData.get('routeData') as string | null
  const routeData = routeDataRaw ? JSON.parse(routeDataRaw) : null
  const visibility = formData.get('visibility') as
    | 'PUBLIC'
    | 'COACH_ONLY'
    | 'PRIVATE'

  console.log('[DEBUG] createWorkoutAction formData:', {
    title,
    distance,
    routeData: routeDataRaw ? 'PRESENTE' : 'AUSENTE',
  })

  // Cálculo simples de pace para a API (min/km)
  const pace = distance > 0 && duration ? duration / 60 / distance : 0

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
      routeData,
      visibility,
    })

    revalidatePath(`/${slug}/dashboard`)
    revalidatePath(`/${slug}/ranking`)

    return {
      success: true,
      message: 'Treino registrado com sucesso! Motivando o pelotão...',
    }
  } catch (err) {
    console.error('[createWorkoutAction ERROR]', err)
    if (err && typeof err === 'object' && 'response' in err) {
      try {
        const body = await (err.response as any).json()
        console.error('[createWorkoutAction API ERROR BODY]', body)
        return {
          success: false,
          message: `Erro da API: ${body.message || JSON.stringify(body)}`,
        }
      } catch (_) {}
    }
    return {
      success: false,
      message: 'Erro ao registrar treino. Verifique os dados.',
    }
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
  } catch (_err) {
    return { success: false, message: 'Erro ao remover o treino.' }
  }
}

export async function setWorkoutReactionAction({
  slug,
  workoutId,
  type,
}: {
  slug: string
  workoutId: string
  type: 'LIKE' | 'FIRE' | 'CLAP' | 'TROPHY' | null
}) {
  try {
    await setWorkoutReaction({ slug, workoutId, type })
    revalidatePath(`/${slug}/dashboard`)
    revalidatePath('/profile')
    return { success: true }
  } catch (_err) {
    return { success: false, message: 'Erro ao reagir ao treino.' }
  }
}

export async function logToServerAction(message: string) {
  console.log('[BROWSER LOG]', message)
}
