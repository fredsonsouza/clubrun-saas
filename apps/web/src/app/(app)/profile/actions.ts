'use server'

import { anonymizeUser } from '@/http/anonymize-user'
import { mutationApi } from '@/http/api-client'
import { updateAthleteProfile } from '@/http/update-athlete-profile'
import { deleteCookie } from 'cookies-next'
import { HTTPError } from 'ky'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { connectStrava } from '@/http/connect-strava'
import { disconnectStrava } from '@/http/disconnect-strava'
import { updatePassword } from '@/http/update-password'

export async function connectStravaAction(code?: string) {
  try {
    const res = await connectStrava(code)
    revalidatePath('/profile')
    return { success: true, isStravaConnected: res.isStravaConnected }
  } catch (err) {
    return { success: false, message: 'Erro ao conectar com o Strava.' }
  }
}

export async function disconnectStravaAction() {
  try {
    const res = await disconnectStrava()
    revalidatePath('/profile')
    return { success: true, isStravaConnected: res.isStravaConnected }
  } catch (err) {
    return { success: false, message: 'Erro ao desconectar do Strava.' }
  }
}

export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  try {
    await updatePassword(currentPassword, newPassword)
    return { success: true, message: 'Senha alterada com sucesso!' }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = (await err.response.json()) as { message: string }
      return { success: false, message }
    }
    return {
      success: false,
      message: 'Erro ao alterar senha. Tente novamente.',
    }
  }
}

export async function anonymizeAccountAction(password: string) {
  try {
    await anonymizeUser(password)

    // Invalidate session
    const cookieStore = await cookies()
    cookieStore.delete('token')

    return {
      success: true,
      message: 'Sua conta foi excluída e todos os dados foram anonimizados.',
    }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = (await err.response.json()) as { message: string }
      return { success: false, message }
    }
    return {
      success: false,
      message: 'Erro ao processar exclusão. Tente novamente.',
    }
  }
}

export async function updateProfileAction(data: {
  name?: string
  avatarUrl?: string | null
  weight?: number
  height?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  birthDate?: Date
  bio?: string
  city?: string
  instagramUrl?: string | null
  stravaUrl?: string | null
  coverUrl?: string | null
  isPublic?: boolean
  shoes?: string | null
  shoesMaxDistance?: number | null
  watch?: string | null
  hasMedicalConditions?: boolean
  medicalConditions?: string | null
}) {
  try {
    await updateAthleteProfile(data)

    revalidatePath('/profile')

    return { success: true, message: 'Perfil atualizado com sucesso!' }
  } catch (err) {
    return {
      success: false,
      message: 'Erro ao atualizar perfil. Tente novamente.',
    }
  }
}

export async function completeWorkoutAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const workoutId = formData.get('workoutId') as string
  const distance = Number(formData.get('distance'))
  const duration = Number(formData.get('duration'))
  const pace = Number(formData.get('pace'))
  const stravaActivityId = formData.get('stravaActivityId') as string | null
  const syncSource = formData.get('syncSource') as string | null

  try {
    await mutationApi.patch(`clubs/${slug}/workouts/${workoutId}/complete`, {
      json: {
        distance,
        duration,
        ...(stravaActivityId ? { stravaActivityId } : {}),
        ...(syncSource ? { syncSource } : {}),
      },
    })

    revalidatePath('/', 'layout')

    return {
      success: true,
      message: 'Treino finalizado com sucesso! Ótimo trabalho.',
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: 'Erro ao finalizar o treino. Tente novamente.',
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
    await mutationApi.delete(`clubs/${slug}/workouts/${workoutId}`)
    revalidatePath('/', 'layout')
    return { success: true, message: 'Treino removido com sucesso.' }
  } catch (err) {
    return { success: false, message: 'Erro ao remover treino.' }
  }
}

export async function updateWorkoutAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const workoutId = formData.get('workoutId') as string
  const title = formData.get('title') as string
  const distance = Number(formData.get('distance'))
  const duration = formData.get('duration')
    ? Number(formData.get('duration'))
    : null
  const pace = formData.get('pace') ? Number(formData.get('pace')) : null
  const type = formData.get('type') as string
  const date = formData.get('date') as string

  try {
    await mutationApi.put(`clubs/${slug}/workouts/${workoutId}`, {
      json: {
        title,
        distance,
        duration,
        pace,
        type,
        date,
      },
    })

    revalidatePath('/', 'layout')

    return { success: true, message: 'Treino atualizado com sucesso!' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Erro ao atualizar o treino.' }
  }
}
