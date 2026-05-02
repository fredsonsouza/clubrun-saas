'use server'

import { updateMember, removeMember } from '@/http/update-member'
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
    return { success: false, message: 'Erro ao atualizar cargo do membro.' }
  }
}

export async function removeMemberAction({
  slug,
  memberId,
}: {
  slug: string
  memberId: string
}) {
  try {
    await removeMember({
      slug,
      memberId,
    })
    revalidatePath(`/${slug}/members`)
    return { success: true, message: 'Membro removido do clube com sucesso!' }
  } catch (err) {
    return { success: false, message: 'Erro ao remover membro.' }
  }
}
