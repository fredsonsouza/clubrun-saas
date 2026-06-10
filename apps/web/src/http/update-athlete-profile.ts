import { api } from './api-client'

interface UpdateAthleteProfileRequest {
  name?: string
  avatarUrl?: string | null
  weight?: number
  height?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  birthDate?: Date
  bio?: string
  city?: string
  instagramUrl?: string | null
  stravaUrl?: string | null
  coverUrl?: string | null
  isPublic?: boolean
  shoes?: string | null
  shoesMaxDistance?: number | null
  watch?: string | null
  hasMedicalConditions?: boolean
  medicalConditions?: string | null
}

export async function updateAthleteProfile(data: UpdateAthleteProfileRequest) {
  const result = await api
    .put('profile/athlete', {
      json: data,
    })
    .json()

  return result
}
