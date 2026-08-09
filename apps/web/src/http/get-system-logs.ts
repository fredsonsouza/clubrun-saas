import { api } from './api-client'

interface GetSystemLogsRequest {
  page?: number
  limit?: number
  action?: string
  entity?: string
  search?: string
  startDate?: string
  endDate?: string
  signal?: AbortSignal
}

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
  totalPages: number
}

export async function getSystemLogs({
  page = 1,
  limit = 50,
  action,
  entity,
  search,
  startDate,
  endDate,
  signal,
}: GetSystemLogsRequest = {}) {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(page))
  searchParams.set('limit', String(limit))
  if (action) searchParams.set('action', action)
  if (entity) searchParams.set('entity', entity)
  if (search) searchParams.set('search', search)
  if (startDate) searchParams.set('startDate', startDate)
  if (endDate) searchParams.set('endDate', endDate)

  const result = await api
    .get('system/logs', { searchParams, signal })
    .json<GetSystemLogsResponse>()

  return result
}
