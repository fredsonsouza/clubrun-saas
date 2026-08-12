import { mutationApi } from './api-client'

interface CreateOAuthAttemptRequest {
  state: string
  pkceChallenge: string
}

export async function createOAuthAttempt({
  state,
  pkceChallenge,
}: CreateOAuthAttemptRequest) {
  await mutationApi.post('oauth/attempts', {
    json: { state, pkceChallenge },
  })
}
