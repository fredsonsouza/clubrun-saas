import React from 'react'
import { auth } from '@/auth/auth'
import { ProfileClient } from './profile-client'
import { getUserProfile } from '@/http/get-user-profile'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const { user: currentUser } = await auth()

  if (!currentUser) {
    return redirect('/auth/sign-in')
  }

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
      currentUser={{
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
      }}
      user={user}
      athleteProfile={athleteProfile ? { ...athleteProfile, isPublic: true } : null}
      workouts={formattedWorkouts}
      plannedWorkouts={formattedPlannedWorkouts}
      isOwnProfile={true}
    />
  )
}
