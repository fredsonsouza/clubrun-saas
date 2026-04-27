import { api } from './api-client'

interface GetMembersRequest {
  slug: string
}

interface GetMembersResponse {
  members: Array<{
    id: string
    userId: string
    role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
    name: string | null
    email: string
    avatarUrl: string | null
    overdue: boolean
  }>
}

export async function getMembers({ slug }: GetMembersRequest) {
  const result = await api
    .get(`clubs/${slug}/members`)
    .json<GetMembersResponse>()

  return result
}
