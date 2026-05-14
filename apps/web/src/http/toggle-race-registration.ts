import { api } from './api-client'

interface ToggleRaceRegistrationResponse {
  isRegistered: boolean
  message: string
}

export async function toggleRaceRegistration(slug: string, raceId: string) {
  const result = await api
    .post(`clubs/${slug}/races/${raceId}/toggle-registration`)
    .json<ToggleRaceRegistrationResponse>()

  return result
}
