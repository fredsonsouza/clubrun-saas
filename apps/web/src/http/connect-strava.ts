import { api } from './api-client'

interface ConnectStravaResponse {
  isStravaConnected: boolean
}

export async function connectStrava(code?: string) {
  const result = await api
    .post('users/strava/connect', {
      json: { code },
    })
    .json<ConnectStravaResponse>()

  return result
}
