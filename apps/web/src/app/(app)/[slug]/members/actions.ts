'use server'

import { removeMember, updateMember } from '@/http/update-member'
import { HTTPError } from 'ky'
import { revalidatePath } from 'next/cache'

export async function updateMemberAction({
  slug,
  memberId,
  role,
}: {
  slug: string
  memberId: string
  role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
}) {
  try {
    await updateMember({
      slug,
      memberId,
      role,
    })
    revalidatePath(`/${slug}/members`)
    return { success: true, message: 'Cargo do membro atualizado com sucesso!' }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = (await err.response.json()) as { message: string }
      return { success: false, message }
    }
    return { success: false, message: 'Erro ao atualizar cargo do membro.' }
  }
}

export async function removeMemberAction({
  slug,
  memberId,
  reasons,
  description,
}: {
  slug: string
  memberId: string
  reasons: string[]
  description?: string
}) {
  try {
    await removeMember({
      slug,
      memberId,
      reasons,
      description,
    })
    revalidatePath(`/${slug}/members`)
    return { success: true, message: 'Membro removido do clube com sucesso!' }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = (await err.response.json()) as { message: string }
      return { success: false, message }
    }
    return { success: false, message: 'Erro ao remover membro.' }
  }
}
