import { api } from './api-client'

export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  await api.put('users/me/password', {
    json: {
      currentPassword,
      newPassword,
    },
  })
}
