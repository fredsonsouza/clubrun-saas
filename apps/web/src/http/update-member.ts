import { api } from './api-client'

interface UpdateMemberRequest {
  slug: string
  memberId: string
  role?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  status?: 'ACTIVE' | 'INACTIVE'
}

export async function updateMember({
  slug,
  memberId,
  role,
  status,
}: UpdateMemberRequest) {
  await api.put(`clubs/${slug}/members/${memberId}`, {
    json: {
      role,
      status,
    },
  })
}

export async function removeMember({
  slug,
  memberId,
}: {
  slug: string
  memberId: string
}) {
  await api.delete(`clubs/${slug}/members/${memberId}`)
}
