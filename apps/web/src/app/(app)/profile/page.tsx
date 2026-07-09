import { auth } from '@/auth/auth'
import { getUserProfile } from '@/http/get-user-profile'
import { redirect } from 'next/navigation'
import React from 'react'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  const { user: currentUser } = await auth()

  if (!currentUser) {
    return redirect('/auth/sign-in')
  }

  // Fetch real profile data for the current user
  const { user, athleteProfile, stats, workouts, plannedWorkouts } =
    await getUserProfile(currentUser.id)

  const formatWorkout = (w: any) => ({
    ...w,
    durationInSeconds: w.duration || 0,
    durationInMinutes: w.duration ? Math.floor(w.duration / 60) : 0,
    createdAt: w.date
      ? new Date(w.date).toISOString()
      : new Date().toISOString(),
    author: {
      id: user.id,
      name: user.name || 'Atleta',
      avatarUrl: user.avatarUrl,
    },
    type: w.type as any,
    visibility: w.visibility as any,
    status: w.status,
    assignmentMode: w.assignmentMode,
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
      athleteProfile={athleteProfile}
      stats={stats}
      workouts={formattedWorkouts}
      plannedWorkouts={formattedPlannedWorkouts}
      isOwnProfile={true}
    />
  )
}
