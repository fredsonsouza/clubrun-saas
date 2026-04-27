import { api } from './api-client'

interface GetSystemStatsResponse {
  stats: {
    totalClubs: number
    totalUsers: number
    totalWorkouts: number
    totalRevenue: number
  }
}

export async function getSystemStats() {
  const result = await api
    .get('system/stats')
    .json<GetSystemStatsResponse>()

  return result
}
