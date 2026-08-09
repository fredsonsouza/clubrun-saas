import { mutationApi } from './api-client'

interface SignInWithGoogleRequest {
  code: string
}

interface SignInWithGoogleResponse {
  token: string
}

export async function signInWithGoogle({ code }: SignInWithGoogleRequest) {
  const result = await mutationApi
    .post('sessions/google', {
      json: {
        code,
      },
    })
    .json<SignInWithGoogleResponse>()
  return result
}
