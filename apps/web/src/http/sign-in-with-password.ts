import { api } from './api-client'

interface SignInWithPasswordRequest {
  login: string
  password: string
}

interface SignInWithPasswordResponse {
  token: string
}

export async function signInWithPassword({
  login,
  password,
}: SignInWithPasswordRequest) {
  const result = await api
    .post('sessions/password', {
      json: {
        login,
        password,
      },
    })
    .json<SignInWithPasswordResponse>()
  return result
}
