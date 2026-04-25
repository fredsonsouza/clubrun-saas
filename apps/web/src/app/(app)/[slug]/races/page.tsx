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

/**
 * Gera provas mockadas dinâmicas baseadas no slug.
 */
function generateDynamicRaces(slug: string) {
  const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const upcoming = [
    {
      id: `rc-1-${slug}`,
      name: seed % 2 === 0 ? 'Meia Maratona do Rio 2026' : 'Circuito das Estações',
      date: '15 Ago 2026',
      location: seed % 2 === 0 ? 'Rio de Janeiro, RJ' : 'Boa Vista, RR',
      distances: ['5k', '10k', '21k'],
      registeredCount: 10 + (seed % 20),
      status: 'UPCOMING' as const,
    },
    {
      id: `rc-2-${slug}`,
      name: seed % 2 === 0 ? 'Desafio das Serras' : 'Maratona de Manaus',
      date: '12 Set 2026',
      location: seed % 2 === 0 ? 'Petrópolis, RJ' : 'Manaus, AM',
      distances: ['10k', '21k', '42k'],
      registeredCount: 5 + (seed % 10),
      status: 'UPCOMING' as const,
    },
  ]

  const past = [
    {
      id: `rc-3-${slug}`,
      name: 'Maratona Internacional de São Paulo',
      date: '05 Abr 2026',
      location: 'São Paulo, SP',
      distances: ['21k', '42k'],
      registeredCount: 8 + (seed % 5),
      status: 'COMPLETED' as const,
    },
  ]

  return { upcoming, past }
}

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

  const { upcoming, past } = generateDynamicRaces(slug)

  return (
    <RacesClient
      user={user}
      club={clubInfo}
      userRole={currentClub.role as any}
      upcomingRaces={upcoming}
      pastRaces={past}
    />
  )
}
