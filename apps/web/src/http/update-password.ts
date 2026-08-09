import { mutationApi } from './api-client'

export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  await mutationApi.put('users/me/password', {
    json: {
      currentPassword,
      newPassword,
    },
  })
}
