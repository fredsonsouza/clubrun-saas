import { mutationApi } from './api-client'

interface ConnectStravaResponse {
  isStravaConnected: boolean
}

export async function connectStrava(code?: string) {
  const result = await mutationApi
    .post('users/strava/connect', {
      json: { code },
    })
    .json<ConnectStravaResponse>()

  return result
}
