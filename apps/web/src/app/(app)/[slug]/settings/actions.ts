'use server'

import { updateClub, shutdownClub } from '@/http/update-club'
import { transferClubOwnership } from '@/http/transfer-club'
import { activateClubBilling } from '@/http/activate-billing'
import { revalidatePath } from 'next/cache'

export async function activateBillingAction(slug: string) {
  try {
    await activateClubBilling(slug)
    revalidatePath('/', 'layout')
    return { success: true, message: 'Plano Pro ativado com sucesso! Bem-vindo de volta.' }
  } catch (err) {
    return { success: false, message: 'Erro ao ativar o plano. Tente novamente.' }
  }
}

export async function updateClubAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const domain = formData.get('domain') as string
  const cnpj = formData.get('cnpj') as string
  const description = formData.get('description') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const avatarUrl = formData.get('avatarUrl') as string
  const bannerUrl = formData.get('bannerUrl') as string
  const shouldAttachUsersByDomain = formData.get('shouldAttachUsersByDomain') === 'on'

  try {
    await updateClub({
      slug,
      name,
      domain: domain || null,
      cnpj: cnpj || null,
      description: description || null,
      city: city || null,
      state: state || null,
      avatarUrl: avatarUrl || null,
      bannerUrl: bannerUrl || null,
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
  leaveAfterTransfer,
}: {
  slug: string
  transferToUserId: string
  leaveAfterTransfer: boolean
}) {
  try {
    await transferClubOwnership({ slug, transferToUserId, leaveAfterTransfer })
    revalidatePath('/', 'layout')
    return { success: true, message: 'Propriedade transferida com sucesso!' }
  } catch (err) {
    if (err instanceof Error) {
      try {
        const errorData = await (err as any).response?.json()
        return { success: false, message: errorData?.message || 'Erro ao transferir propriedade.' }
      } catch (e) {
        return { success: false, message: err.message || 'Erro ao transferir propriedade.' }
      }
    }

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
