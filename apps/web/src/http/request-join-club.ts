import { api } from './api-client'

export async function requestJoinClub(slug: string) {
  await api.post(`clubs/${slug}/join-request`)
}
