import { api } from './api-client'

interface GetUserProfileResponse {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    isSystemAdmin: boolean
  }
  athleteProfile: {
    bio: string | null
    city: string | null
    paceAvg: number | null
    weight: number | null
    height: number | null
    gender: string | null
    birthDate: string
    instagramUrl: string | null
    stravaUrl: string | null
    coverUrl: string | null
    shoes: string | null
    shoesMaxDistance: number | null
    shoesRemainingDistance: number | null
    watch: string | null
    hasMedicalConditions: boolean
    medicalConditions: string | null
    isPremium?: boolean
    isStravaConnected?: boolean
  } | null
  stats: {
    avgPace: number
    totalDistance: number
    totalWorkouts: number
  }
  workouts: {
    id: string
    title: string | null
    distance: number
    duration: number | null
    type: string
    date: string
    visibility: string
    status: 'PLANNED' | 'COMPLETED'
    assignmentMode: 'GOAL' | 'FREE' | null
    targetDistance: number | null
    targetDuration: number | null
    syncSource: string | null
    stravaActivityId: string | null
    club: {
      name: string
      slug: string
    }
  }[]
  plannedWorkouts: {
    id: string
    title: string | null
    distance: number
    duration: number | null
    type: string
    date: string
    visibility: string
    status: 'PLANNED' | 'COMPLETED'
    assignmentMode: 'GOAL' | 'FREE' | null
    targetDistance: number | null
    targetDuration: number | null
    syncSource: string | null
    stravaActivityId: string | null
    club: {
      name: string
      slug: string
    }
  }[]
}

export async function getUserProfile(userId: string) {
  const result = await api
    .get(`users/${userId}/profile`)
    .json<GetUserProfileResponse>()

  return result
}
