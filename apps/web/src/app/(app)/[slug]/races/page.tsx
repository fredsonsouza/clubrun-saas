import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { RacesClient } from './races-client'

interface ClubRacesPageProps {
  params: Promise<{
    slug: string
  }>
}

// --- MOCK DATA ---
const UPCOMING_RACES = [
  {
    id: 'rc-1',
    name: 'Meia Maratona do Rio 2026',
    date: '15 Ago 2026',
    location: 'Rio de Janeiro, RJ',
    distances: ['5k', '10k', '21k'],
    registeredCount: 14,
    status: 'UPCOMING' as const,
  },
  {
    id: 'rc-2',
    name: 'Desafio das Serras',
    date: '12 Set 2026',
    location: 'Petrópolis, RJ',
    distances: ['10k', '21k', '42k'],
    registeredCount: 5,
    status: 'UPCOMING' as const,
  },
]

const PAST_RACES = [
  {
    id: 'rc-3',
    name: 'Maratona Internacional de São Paulo',
    date: '05 Abr 2026',
    location: 'São Paulo, SP',
    distances: ['21k', '42k'],
    registeredCount: 8,
    status: 'COMPLETED' as const,
  },
  {
    id: 'rc-4',
    name: 'Corrida de Reis',
    date: '06 Jan 2026',
    location: 'Brasília, DF',
    distances: ['10k'],
    registeredCount: 22,
    status: 'COMPLETED' as const,
  },
]

export default async function ClubRacesPage({ params }: ClubRacesPageProps) {
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
    <RacesClient
      user={user}
      club={clubInfo}
      userRole={currentClub.role as any}
      upcomingRaces={UPCOMING_RACES}
      pastRaces={PAST_RACES}
    />
  )
}
