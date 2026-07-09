import { api } from './api-client'

interface SignInWithGoogleRequest {
  code: string
}

interface SignInWithGoogleResponse {
  token: string
}

export async function signInWithGoogle({ code }: SignInWithGoogleRequest) {
  const result = await api
    .post('sessions/google', {
      json: {
        code,
      },
    })
    .json<SignInWithGoogleResponse>()
  return result
}
