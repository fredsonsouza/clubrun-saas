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
  const { user: currentUser, token } = await auth()

  // Fetch real profile data
  const { user, athleteProfile, workouts, plannedWorkouts } = await getUserProfile(id)
  
  const isOwnProfile = currentUser.id === id

  // Helper to format workouts
  const formatWorkout = (w: any) => ({
    ...w,
    durationInSeconds: w.duration || 0,
    createdAt: w.date ? new Date(w.date).toISOString() : new Date().toISOString(),
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
      currentUser={currentUser}
      user={user}
      athleteProfile={athleteProfile ? { ...athleteProfile, isPublic: true } : null}
      workouts={formattedWorkouts}
      plannedWorkouts={formattedPlannedWorkouts}
      isOwnProfile={isOwnProfile}
      token={token}
    />
  )
}
