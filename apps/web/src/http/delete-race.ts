import { mutationApi } from './api-client'

export async function deleteRace(slug: string, raceId: string) {
  await mutationApi.delete(`clubs/${slug}/races/${raceId}`)
}
