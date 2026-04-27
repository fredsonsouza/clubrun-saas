import { api } from './api-client'

interface GetSystemLogsResponse {
  logs: {
    id: string
    action: string
    entity: string
    entityId: string
    payload: any | null
    createdAt: string
    user: {
      name: string | null
      email: string
    } | null
  }[]
}

export async function getSystemLogs() {
  const result = await api
    .get('system/logs')
    .json<GetSystemLogsResponse>()

  return result
}
