import { api } from './api-client'

interface CreateInviteRequest {
  slug: string
  email: string
  role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
}

export async function createInvite({ slug, email, role }: CreateInviteRequest) {
  const result = await api
    .post(`clubs/${slug}/invites`, {
      json: {
        email,
        role,
      },
    })
    .json<{ inviteId: string }>()

  return result
}
