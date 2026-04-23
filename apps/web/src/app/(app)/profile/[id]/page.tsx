import React from 'react'
import { auth } from '@/auth/auth'
import { ProfileClient } from '../profile-client'
import { Workout } from '@/components/workout-card'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

// --- MOCKS PARA OUTROS USUÁRIOS ---
const MOCK_OTHER_USER = {
  id: 'usr-2',
  name: 'Carlos Silva',
  email: 'carlos@exemplo.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=33',
}

const MOCK_OTHER_ATHLETE_PROFILE = {
  bio: 'Corredor de montanha em busca de novos desafios. Focado em ultras.',
  city: 'Belo Horizonte, MG',
  weight: 68,
  height: 175,
  gender: 'MALE',
  instagramUrl: 'https://instagram.com/carlos.ultra',
  stravaUrl: 'https://strava.com/athletes/carlos',
  isPublic: true,
}

const MOCK_OTHER_WORKOUTS: Workout[] = [
  {
    id: 'wk-101',
    title: 'Subida da Serra',
    description: 'Treino técnico de altimetria.',
    distance: 12.0,
    durationInMinutes: 90,
    type: 'LONG',
    visibility: 'PUBLIC',
    createdAt: new Date().toISOString(),
    author: {
      id: 'usr-2',
      name: 'Carlos Silva',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
    },
  },
]

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params
  const { user: currentUser } = await auth()

  // No futuro, aqui faríamos um fetch por ID: getProfileById(id)
  // Por enquanto, usamos mocks
  const isOwnProfile = currentUser.id === id

  return (
    <ProfileClient
      user={isOwnProfile ? currentUser : MOCK_OTHER_USER}
      athleteProfile={MOCK_OTHER_ATHLETE_PROFILE}
      workouts={MOCK_OTHER_WORKOUTS}
      isOwnProfile={isOwnProfile}
    />
  )
}
