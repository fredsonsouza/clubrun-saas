import { auth } from '@/auth/auth'
import { getUserProfile } from '@/http/get-user-profile'
import { redirect } from 'next/navigation'
import React from 'react'
import { ProfileClient } from '../profile-client'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { id } = await params
  const { user: currentUser } = await auth()

  if (!currentUser) {
    redirect('/auth/sign-in')
  }

  // Fetch real profile data
  const { user, athleteProfile, stats, workouts, plannedWorkouts } =
    await getUserProfile(id)

  const isOwnProfile = currentUser.id === id

  // Helper to format workouts
  const formatWorkout = (w: any) => ({
    ...w,
    durationInSeconds: w.duration || 0,
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
      isOwnProfile={isOwnProfile}
    />
  )
}
