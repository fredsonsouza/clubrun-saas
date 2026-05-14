import { api } from './api-client'

interface UpdateAthleteProfileRequest {
  name?: string
  avatarUrl?: string | null
  weight?: number
  height?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  bio?: string
  city?: string
  instagramUrl?: string | null
  stravaUrl?: string | null
  coverUrl?: string | null
  isPublic?: boolean
}

export async function updateAthleteProfile(data: UpdateAthleteProfileRequest) {
  const result = await api
    .put('profile/athlete', {
      json: data,
    })
    .json()

  return result
}
