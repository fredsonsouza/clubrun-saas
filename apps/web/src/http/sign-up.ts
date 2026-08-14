import { mutationApi } from './api-client'

interface SignUpRequest {
  name: string
  username: string
  email: string
  password: string
}

type SignUpResponse = undefined

export async function signUp({
  name,
  username,
  email,
  password,
}: SignUpRequest): Promise<SignUpResponse> {
  await mutationApi
    .post('users', {
      json: {
        name,
        username,
        email,
        password,
      },
    })
    .json<SignUpResponse>()
}
