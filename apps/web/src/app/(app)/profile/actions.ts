'use server'

import { updateAthleteProfile } from '@/http/update-athlete-profile'
import { revalidatePath } from 'next/cache'

interface UpdateProfileActionRequest {
  bio?: string
  city?: string
  weight?: number
  height?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  instagramUrl?: string | null
  stravaUrl?: string | null
  isPublic?: boolean
}

export async function updateProfileAction(data: UpdateProfileActionRequest) {
  try {
    await updateAthleteProfile(data)
    
    // Revalida a página de perfil para mostrar os dados atualizados
    revalidatePath('/profile/[id]', 'page')
    
    return { success: true, message: 'Perfil atualizado com sucesso!' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Falha ao atualizar perfil. Tente novamente.' }
  }
}
