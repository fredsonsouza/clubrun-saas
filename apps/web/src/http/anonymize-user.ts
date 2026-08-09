import { mutationApi } from './api-client'

export async function anonymizeUser(password: string) {
  await mutationApi.post('users/me/anonymize', {
    json: {
      password,
    },
  })
}
