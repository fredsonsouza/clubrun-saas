import { mutationApi } from './api-client'

interface DisconnectStravaResponse {
  isStravaConnected: boolean
}

export async function disconnectStrava() {
  const result = await mutationApi
    .post('users/strava/disconnect')
    .json<DisconnectStravaResponse>()

  return result
}
