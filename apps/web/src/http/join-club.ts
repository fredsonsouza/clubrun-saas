import { mutationApi } from './api-client'

export async function joinClub(slug: string, token: string): Promise<void> {
  await mutationApi
    .post(`clubs/${slug}/join`, {
      json: { token },
    })
    .json()
}
