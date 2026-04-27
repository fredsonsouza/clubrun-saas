'use server'

import { createInvite } from '@/http/create-invite'
import { revokeInvite } from '@/http/revoke-invite'
import { revalidateTag } from 'next/cache'

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

    revalidateTag('invites')

    return { success: true, message: 'Convite enviado com sucesso!' }
  } catch (err: any) {
    // Tenta capturar a mensagem de erro da API
    let message = 'Erro ao enviar convite.'
    try {
      const errorData = await err.response.json()
      message = errorData.message || message
    } catch (e) {}

    return { success: false, message }
  }
}

export async function revokeInviteAction({
  slug,
  inviteId,
}: {
  slug: string
  inviteId: string
}) {
  try {
    await revokeInvite({ slug, inviteId })
    revalidateTag('invites')
    return { success: true, message: 'Convite cancelado com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao cancelar convite.' }
  }
}
