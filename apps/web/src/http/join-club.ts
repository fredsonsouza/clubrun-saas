import { api } from './api-client'

export async function joinClub(slug: string, token: string): Promise<void> {
  await api
    .post(`clubs/${slug}/join`, {
      json: { token },
    })
    .json()
}
