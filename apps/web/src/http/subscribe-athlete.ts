import { mutationApi } from './api-client'

export async function subscribeAthlete() {
  const result = await mutationApi
    .post('profile/athlete/subscribe')
    .json<{ success: boolean; message: string; isPremium: boolean }>()

  return result
}
