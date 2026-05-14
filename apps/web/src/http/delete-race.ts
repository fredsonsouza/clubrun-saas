import { api } from './api-client'

export async function deleteRace(slug: string, raceId: string) {
  await api.delete(`clubs/${slug}/races/${raceId}`)
}
