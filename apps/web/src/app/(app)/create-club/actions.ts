'use server'

import { createClub } from '@/http/create-club'
import { revalidatePath } from 'next/cache'

export async function createClubAction(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  // const description = formData.get('description') as string // Não suportado na criação inicial pela API atual

  try {
    const { clubId } = await createClub({
      name,
      // slug: slug // A API cria o slug baseado no nome internamente
    })
    
    revalidatePath('/')
    revalidatePath('/explore')
    
    return { success: true, clubId, message: 'Seu clube foi criado com sucesso!' }
  } catch (err) {
    if (err instanceof Error) {
      try {
        // @ts-ignore
        const { message } = await err.response.json()
        return { success: false, message }
      } catch {
        return { success: false, message: 'Erro ao criar o clube. Tente novamente mais tarde.' }
      }
    }

    return { success: false, message: 'Erro ao criar o clube.' }
  }
}
