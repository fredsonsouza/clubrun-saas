import { api } from './api-client'
type Role =
  | 'OWNER'
  | 'MANAGER'
  | 'ADMIN'
  | 'ATHLETE'
  | 'COACH'
  | 'BILLING'
  | 'VISITOR'

interface GetInviteResponse {
  invite: {
    id: string
    role: Role
    email: string
    createdAt: string
    club: {
      name: string
    }
    author: {
      id: string
      name: string | null
      avatarUrl: string | null
    } | null
  }
}

export async function getInvite(inviteId: string) {
  const result = await api.get(`invites/${inviteId}`).json<GetInviteResponse>()

  return result
}
