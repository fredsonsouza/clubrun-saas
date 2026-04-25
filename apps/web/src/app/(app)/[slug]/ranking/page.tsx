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

/**
 * Gera ranking mockado dinâmico baseado no slug.
 */
function generateDynamicRanking(slug: string, userName: string) {
  const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  return [
    {
      id: 'usr-12',
      name: 'Marcos Mendes',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      distance: 140.5 + (seed % 60),
      pace: '4:45',
      workoutsCount: 14 + (seed % 5),
    },
    {
      id: 'usr-68',
      name: 'Elena Costa',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
      distance: 120.2 + (seed % 40),
      pace: '5:10',
      workoutsCount: 12 + (seed % 3),
    },
    {
      id: 'usr-47',
      name: 'Ana Paula',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      distance: 110.0 + (seed % 30),
      pace: '5:05',
      workoutsCount: 15 + (seed % 2),
    },
    {
      id: 'usr-1',
      name: userName,
      avatarUrl: 'https://github.com/fredsonsouza.png',
      distance: 85.0 + (seed % 70),
      pace: '5:12',
      workoutsCount: 8 + (seed % 10),
    },
    {
      id: 'usr-33',
      name: 'Carlos Silva',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
      distance: 70.4 + (seed % 20),
      pace: '4:50',
      workoutsCount: 10,
    },
  ].sort((a, b) => b.distance - a.distance)
}

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

  const ranking = generateDynamicRanking(slug, user?.name || 'Atleta')

  return (
    <RankingClient
      user={user}
      club={clubInfo}
      ranking={ranking}
    />
  )
}
