import { api } from './api-client'

export async function subscribeAthlete() {
  const result = await api
    .post('profile/athlete/subscribe')
    .json<{ success: boolean; message: string; isPremium: boolean }>()

  return result
}
