'use server'

import { updateClub, shutdownClub } from '@/http/update-club'
import { transferClubOwnership } from '@/http/transfer-club'
import { revalidatePath } from 'next/cache'

export async function updateClubAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const domain = formData.get('domain') as string
  const shouldAttachUsersByDomain = formData.get('shouldAttachUsersByDomain') === 'on'

  try {
    await updateClub({
      slug,
      name,
      domain: domain || null,
      shouldAttachUsersByDomain,
    })

    revalidatePath('/', 'layout')

    return { success: true, message: 'Definições do clube atualizadas!' }
  } catch (err) {
    return { success: false, message: 'Erro ao atualizar as definições.' }
  }
}

export async function transferOwnershipAction({
  slug,
  transferToUserId,
}: {
  slug: string
  transferToUserId: string
}) {
  try {
    await transferClubOwnership({ slug, transferToUserId })
    revalidatePath('/', 'layout')
    return { success: true, message: 'Propriedade transferida com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao transferir propriedade.' }
  }
}

export async function shutdownClubAction(slug: string) {
  try {
    await shutdownClub(slug)
    revalidatePath('/', 'layout')
    return { success: true, message: 'Clube encerrado com sucesso.' }
  } catch (err) {
    return { success: false, message: 'Erro ao encerrar o clube.' }
  }
}
