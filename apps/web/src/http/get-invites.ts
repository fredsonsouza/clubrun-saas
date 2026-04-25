import { api } from './api-client'

interface GetInvitesRequest {
  slug: string
}

interface GetInvitesResponse {
  invites: Array<{
    id: string
    role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
    email: string
    createdAt: string
    author: {
      id: string
      name: string | null
    } | null
  }>
}

export async function getInvites({ slug }: GetInvitesRequest) {
  const result = await api
    .get(`clubs/${slug}/invites`)
    .json<GetInvitesResponse>()

  return result
}
