import { api } from './api-client'

interface GetPendingMembersResponse {
  members: Array<{
    id: string
    role: string
    status: string
    createdAt: string
    user: {
      id: string
      name: string | null
      email: string
      avatarUrl: string | null
    }
  }>
}

export async function getPendingMembers(slug: string): Promise<GetPendingMembersResponse> {
  return await api.get(`clubs/${slug}/members/pending`).json<GetPendingMembersResponse>()
}
