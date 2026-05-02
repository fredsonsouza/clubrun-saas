import { api } from './api-client'

interface SignUpRequest {
  name: string
  username: string
  email: string
  password: string
}

type SignUpResponse = void

export async function signUp({
  name,
  username,
  email,
  password,
}: SignUpRequest): Promise<SignUpResponse> {
  await api
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
