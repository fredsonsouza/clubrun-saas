import { api } from './api-client'

interface GetClubDashboardRequest {
  slug: string
}

interface GetClubDashboardResponse {
  metrics: {
    activeMembers: number
    inactiveMembers: number
    pendingInvites: number
    totalDistanceMonth: number
    totalWorkoutsMonth: number
  }
}

export async function getClubDashboard({ slug }: GetClubDashboardRequest) {
  const result = await api
    .get(`clubs/${slug}/dashboard`)
    .json<GetClubDashboardResponse>()

  return result
}
