import { api } from './api-client'

interface GetMembersRequest {
  slug: string
}

interface GetMembersResponse {
  members: Array<{
    id: string
    userId: string
    role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
    name: string | null
    email: string
    avatarUrl: string | null
    overdue: boolean
    paceAvg: number | null
    birthDate: string | null
    shoes: string | null
    watch: string | null
    hasMedicalConditions: boolean
    medicalConditions: string | null
    joinedAt: string
  }>
}

export async function getMembers({ slug }: GetMembersRequest) {
  const result = await api
    .get(`clubs/${slug}/members?t=${new Date().getTime()}`, {
      next: {
        revalidate: 0,
      },
    })
    .json<GetMembersResponse>()

  return result
}
