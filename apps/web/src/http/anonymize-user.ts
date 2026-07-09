import { api } from './api-client'

export async function anonymizeUser(password: string) {
  await api.post('users/me/anonymize', {
    json: {
      password,
    },
  })
}
