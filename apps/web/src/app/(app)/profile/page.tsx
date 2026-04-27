import React from 'react'
import { auth } from '@/auth/auth'
import { ProfileClient } from './profile-client'
import { getUserProfile } from '@/http/get-user-profile'

export default async function ProfilePage() {
  const { user: currentUser } = await auth()

  // Fetch real profile data for the current user
  const { user, athleteProfile, workouts } = await getUserProfile(currentUser.id)

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
      isOwnProfile={true}
    />
  )
}
