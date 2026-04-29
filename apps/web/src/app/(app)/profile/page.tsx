import React from 'react'
import { auth } from '@/auth/auth'
import { ProfileClient } from './profile-client'
import { getUserProfile } from '@/http/get-user-profile'

export default async function ProfilePage() {
  const { user: currentUser } = await auth()

  // Fetch real profile data for the current user
  const { user, athleteProfile, workouts, plannedWorkouts } = await getUserProfile(currentUser.id)

  const formatWorkout = (w: any) => ({
    ...w,
    durationInMinutes: w.duration ? Math.floor(w.duration / 60) : 0,
    author: {
      id: user.id,
      name: user.name || 'Atleta',
      avatarUrl: user.avatarUrl,
    },
    type: w.type as any,
    visibility: w.visibility as any,
  })

  const formattedWorkouts = (workouts || []).map(formatWorkout)
  const formattedPlannedWorkouts = (plannedWorkouts || []).map(formatWorkout)

  return (
    <ProfileClient
      currentUser={currentUser}
      user={user}
      athleteProfile={athleteProfile}
      workouts={formattedWorkouts}
      plannedWorkouts={formattedPlannedWorkouts}
      isOwnProfile={true}
    />
  )
}
