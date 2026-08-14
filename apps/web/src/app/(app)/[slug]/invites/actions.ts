'use server'

import { createInvite } from '@/http/create-invite'
import { revokeInvite } from '@/http/revoke-invite'
import { revalidatePath } from 'next/cache'

export async function createInviteAction(formData: FormData) {
  const slug = formData.get('slug') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as any

  try {
    await createInvite({
      slug,
      email,
      role,
    })

    revalidatePath(`/${slug}/invites`)

    return { success: true, message: 'Convite enviado com sucesso!' }
  } catch (err: any) {
    // Tenta capturar a mensagem de erro da API
    let message = 'Erro ao enviar convite.'
    try {
      const errorData = await err.response.json()
      message = errorData.message || message
    } catch (_e) {}

    return { success: false, message }
  }
}

import { updateMemberStatus } from '@/http/update-member-status'

export async function revokeInviteAction({
  slug,
  inviteId,
}: {
  slug: string
  inviteId: string
}) {
  try {
    await revokeInvite({ slug, inviteId })
    revalidatePath(`/${slug}/invites`)
    return { success: true, message: 'Convite cancelado com sucesso!' }
  } catch (_err) {
    return { success: false, message: 'Erro ao cancelar convite.' }
  }
}

export async function updateMemberStatusAction({
  slug,
  memberId,
  status,
}: {
  slug: string
  memberId: string
  status: 'ACTIVE' | 'INACTIVE'
}) {
  try {
    await updateMemberStatus(slug, memberId, status)
    revalidatePath(`/${slug}/invites`)
    revalidatePath(`/${slug}/members`)

    const message =
      status === 'ACTIVE'
        ? 'Membro aprovado com sucesso!'
        : 'Solicitação recusada.'

    return { success: true, message }
  } catch (err: any) {
    console.error('Erro detalhado na Action de atualizar membro:', err)

    let message = 'Erro ao atualizar status do membro.'
    try {
      if (err.response) {
        const errorData = await err.response.json()
        message = errorData.message || message
      }
    } catch (_e) {}

    return { success: false, message }
  }
}
