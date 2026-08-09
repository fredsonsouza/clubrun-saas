import { mutationApi } from './api-client'

export async function requestJoinClub(slug: string) {
  await mutationApi.post(`clubs/${slug}/join-request`)
}
