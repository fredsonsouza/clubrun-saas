import { api } from './api-client'

interface DisconnectStravaResponse {
  isStravaConnected: boolean
}

export async function disconnectStrava() {
  const result = await api
    .post('users/strava/disconnect')
    .json<DisconnectStravaResponse>()

  return result
}
