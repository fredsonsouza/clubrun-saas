import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { RankingClient } from './ranking-client'

interface ClubRankingPageProps {
  params: Promise<{
    slug: string
  }>
}

// --- MOCK DATA ---
const MOCK_RANKING = [
  {
    id: 'usr-12',
    name: 'Marcos Mendes',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    distance: 142.5,
    pace: '4:45',
    workoutsCount: 14,
  },
  {
    id: 'usr-68',
    name: 'Elena Costa',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    distance: 130.2,
    pace: '5:10',
    workoutsCount: 12,
  },
  {
    id: 'usr-47',
    name: 'Ana Paula',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    distance: 118.0,
    pace: '5:05',
    workoutsCount: 15,
  },
  {
    id: 'usr-33',
    name: 'Carlos Silva',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    distance: 95.4,
    pace: '4:50',
    workoutsCount: 10,
  },
  {
    id: 'usr-1',
    name: 'Fredson Souza',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    distance: 85.0,
    pace: '5:12',
    workoutsCount: 8,
  },
  {
    id: 'usr-24',
    name: 'Julia Martins',
    avatarUrl: 'https://i.pravatar.cc/150?img=24',
    distance: 70.2,
    pace: '6:00',
    workoutsCount: 7,
  },
  {
    id: 'usr-99',
    name: 'Roberto Alves',
    avatarUrl: 'https://i.pravatar.cc/150?img=55',
    distance: 42.1,
    pace: '5:45',
    workoutsCount: 4,
  },
]

export default async function ClubRankingPage({ params }: ClubRankingPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
  }

  return (
    <RankingClient
      user={user}
      club={clubInfo}
      ranking={MOCK_RANKING}
    />
  )
}
