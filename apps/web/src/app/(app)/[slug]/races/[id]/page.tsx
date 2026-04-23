import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { RaceDetailClient } from './race-detail-client'

interface RaceDetailPageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

// --- MOCK DATA ---
const MOCK_RACE = {
  id: 'rc-3',
  name: 'Meia Maratona Internacional do Rio',
  description:
    'O percurso mais bonito do Brasil. A prova passa pelas orlas do Leblon, Ipanema, Copacabana e Botafogo. Um evento imperdível para quem busca recordes pessoais em um cenário deslumbrante.',
  date: '15 Ago 2026',
  location: 'Rio de Janeiro, RJ',
  distances: ['5k', '10k', '21k'],
  status: 'COMPLETED' as const,
  hasSubmittedResult: false,
}

const MOCK_RESULTS = [
  {
    id: 'res-1',
    athlete: {
      id: 'usr-33',
      name: 'Carlos Silva',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
    },
    time: '01:25:40',
    pace: '4:04',
    distance: '21k',
  },
  {
    id: 'res-2',
    athlete: {
      id: 'usr-68',
      name: 'Elena Costa',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
    },
    time: '01:38:15',
    pace: '4:39',
    distance: '21k',
  },
  {
    id: 'res-3',
    athlete: {
      id: 'usr-47',
      name: 'Ana Paula',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
    },
    time: '01:45:00',
    pace: '4:58',
    distance: '21k',
  },
  {
    id: 'res-4',
    athlete: {
      id: 'usr-1',
      name: 'Fredson Souza',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
    time: '00:42:15',
    pace: '4:13',
    distance: '10k',
  },
]

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const { slug, id } = await params
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

  // No futuro, buscar dados da prova via API: getRaceById(id)
  const raceData = { ...MOCK_RACE, id }

  return (
    <RaceDetailClient
      user={user}
      club={clubInfo}
      race={raceData}
      results={MOCK_RESULTS}
    />
  )
}
