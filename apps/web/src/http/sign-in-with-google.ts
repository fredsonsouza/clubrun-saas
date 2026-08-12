import { mutationApi } from './api-client'

interface SignInWithGoogleRequest {
  code: string
  state: string
  codeVerifier: string
}

interface SignInWithGoogleResponse {
  token: string
}

export async function signInWithGoogle({
  code,
  state,
  codeVerifier,
}: SignInWithGoogleRequest) {
  const result = await mutationApi
    .post('sessions/google', {
      json: {
        code,
        state,
        codeVerifier,
      },
    })
    .json<SignInWithGoogleResponse>()
  return result
}
