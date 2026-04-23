import React from 'react'
import { auth } from '@/auth/auth'
import { ProfileClient } from './profile-client'
import { Workout } from '@/components/workout-card'

// --- MOCKS ---
const MOCK_ATHLETE_PROFILE = {
  bio: 'Amante do asfalto e das longas distâncias. A treinar para a Meia Maratona do Rio.',
  city: 'Boa Vista, RR',
  weight: 74,
  height: 182,
  gender: 'MALE',
  instagramUrl: 'https://instagram.com/fredson.runs',
  stravaUrl: 'https://strava.com/athletes/fredson',
  isPublic: true,
}

const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'wk-1',
    title: 'Longo de Domingo',
    description: 'Pernas pesadas no final, mas o ritmo manteve-se.',
    distance: 15.0,
    durationInMinutes: 75,
    type: 'LONG',
    visibility: 'PUBLIC',
    createdAt: new Date().toISOString(),
    author: {
      id: 'usr-1',
      name: 'Fredson Souza',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
  },
  {
    id: 'wk-2',
    title: 'Tiroteio na Pista',
    distance: 6.0,
    durationInMinutes: 28,
    type: 'INTERVAL',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: {
      id: 'usr-1',
      name: 'Fredson Souza',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
  },
]

export default async function ProfilePage() {
  const { user } = await auth()

  return (
    <ProfileClient
      user={user}
      athleteProfile={MOCK_ATHLETE_PROFILE}
      workouts={MOCK_WORKOUTS}
      isOwnProfile={true}
    />
  )
}
