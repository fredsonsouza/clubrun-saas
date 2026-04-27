import React from 'react'
import { auth } from '@/auth/auth'
import { ProfileClient } from '../profile-client'
import { getUserProfile } from '@/http/get-user-profile'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params
  const { user: currentUser } = await auth()

  // Fetch real profile data
  const { user, athleteProfile, workouts } = await getUserProfile(id)
  
  const isOwnProfile = currentUser.id === id

  // Map workouts to match expected format in ProfileClient
  const formattedWorkouts = workouts.map(w => ({
    ...w,
    durationInMinutes: w.duration ? Math.floor(w.duration / 60) : 0,
    author: {
      id: user.id,
      name: user.name || 'Atleta',
      avatarUrl: user.avatarUrl,
    },
    type: w.type as any,
    visibility: w.visibility as any,
  }))

  return (
    <ProfileClient
      currentUser={currentUser}
      user={user}
      athleteProfile={athleteProfile}
      workouts={formattedWorkouts}
      isOwnProfile={isOwnProfile}
    />
  )
}
