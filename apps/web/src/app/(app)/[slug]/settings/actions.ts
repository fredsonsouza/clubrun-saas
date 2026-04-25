'use server'

import { updateClub, shutdownClub } from '@/http/update-club'
import { revalidateTag } from 'next/cache'

export async function updateClubAction(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string

  try {
    await updateClub({
      slug,
      name,
      // description não é suportada pela API atual (prisma.club.update), 
      // mas mantemos para compatibilidade futura ou ajuste se necessário
    })
    
    // Revalidar os dados para que o header e outras partes reflitam o novo nome
    revalidateTag('clubs')
    
    return { success: true, message: 'Definições do clube atualizadas com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao atualizar definições do clube.' }
  }
}

export async function shutdownClubAction(slug: string) {
  try {
    await shutdownClub(slug)
    revalidateTag('clubs')
    return { success: true, message: 'O clube foi encerrado permanentemente.' }
  } catch (err) {
    return { success: false, message: 'Erro ao encerrar o clube.' }
  }
}
