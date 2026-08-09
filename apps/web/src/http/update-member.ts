import { mutationApi } from './api-client'

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
  await mutationApi.put(`clubs/${slug}/members/${memberId}`, {
    json: {
      role,
      status,
    },
  })
}

export async function removeMember({
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
  await mutationApi.delete(`clubs/${slug}/members/${memberId}`, {
    json: {
      reasons,
      description,
    },
  })
}
