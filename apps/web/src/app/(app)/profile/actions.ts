'use server'

import { api } from '@/http/api-client'
import { updateAthleteProfile } from '@/http/update-athlete-profile'
import { revalidateTag } from 'next/cache'

export async function updateProfileAction(data: {
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

    revalidateTag('profile')

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

    revalidateTag('workouts')
    revalidateTag('ranking')
    revalidateTag('profile')

    return { success: true, message: 'Treino finalizado com sucesso! Ótimo trabalho.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Erro ao finalizar o treino. Tente novamente.' }
  }
}
