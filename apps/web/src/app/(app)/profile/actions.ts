'use server'

import { api } from '@/http/api-client'
import { updateAthleteProfile } from '@/http/update-athlete-profile'
import { anonymizeUser } from '@/http/anonymize-user'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { HTTPError } from 'ky'
import { deleteCookie } from 'cookies-next'

import { updatePassword } from '@/http/update-password'

export async function updatePasswordAction(currentPassword: string, newPassword: string) {
  try {
    await updatePassword(currentPassword, newPassword)
    return { success: true, message: 'Senha alterada com sucesso!' }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json() as { message: string }
      return { success: false, message }
    }
    return { success: false, message: 'Erro ao alterar senha. Tente novamente.' }
  }
}

export async function anonymizeAccountAction(password: string) {
  try {
    await anonymizeUser(password)
    
    // Invalidate session
    // Since this is a Server Action, we can use cookies().delete() but let's just redirect
    // Actually, redirecting to a logout-like route or just / is enough if the token is invalid now
    // But let's try to clear cookies
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json() as { message: string }
      return { success: false, message }
    }
    return { success: false, message: 'Erro ao processar exclusão. Tente novamente.' }
  }

  // Clear cookie and redirect
  // We can't easily clear cookies-next from server action without 'cookies' from next/headers
  // I'll do it in the client-side after the action returns success if needed, or just redirect
}

export async function updateProfileAction(data: {
  name?: string
  avatarUrl?: string | null
  weight?: number
  height?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  bio?: string
  city?: string
  instagramUrl?: string | null
  stravaUrl?: string | null
  isPublic?: boolean
}) {
  try {
    await updateAthleteProfile(data)

    revalidatePath('/profile')

    return { success: true, message: 'Perfil atualizado com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao atualizar perfil. Tente novamente.' }
  }
}

export async function completeWorkoutAction(formData: FormData) {
  const workoutId = formData.get('workoutId') as string
  const distance = Number(formData.get('distance'))
  const duration = Number(formData.get('duration'))
  const pace = Number(formData.get('pace'))

  try {
    await api.patch(`workouts/${workoutId}/complete`, {
      json: {
        distance,
        duration,
        pace,
      }
    })

    revalidatePath('/', 'layout')

    return { success: true, message: 'Treino finalizado com sucesso! Ótimo trabalho.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Erro ao finalizar o treino. Tente novamente.' }
  }
}
