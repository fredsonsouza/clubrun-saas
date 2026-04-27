import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getClubRanking } from '@/http/get-club-ranking'
import { redirect } from 'next/navigation'
import { RankingClient } from './ranking-client'

interface RankingPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function RankingPage({ params }: RankingPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // BUSCA RANKING REAL DA API
  const { rankings } = await getClubRanking({ slug, type: 'monthly' })

  const formattedRankings = rankings.map((r, index) => {
    // Pace calculation: dummy pace if we don't have total time in ranking yet, 
    // but usually pace = totalTime / distance. 
    // Since get-club-ranking doesn't return time yet, I'll use a placeholder or calculate if available.
    // Let's assume pace is "0:00" for now or calculated from points if points were based on pace.
    return {
      id: r.athlete.id,
      name: r.athlete.name || 'Atleta',
      avatarUrl: r.athlete.avatarUrl,
      distance: r.distance || 0,
      workoutsCount: r.workoutsCount || 0,
      points: r.points,
      pace: '4:30', // Placeholder for now, or could be passed from API if updated
      isMe: r.athlete.id === user.id,
      position: index + 1
    }
  })

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
  }

  return (
    <RankingClient
      user={user}
      club={clubInfo}
      initialRankings={formattedRankings}
    />
  )
}
