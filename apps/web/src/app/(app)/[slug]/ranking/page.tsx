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

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // BUSCA RANKING REAL DA API
  const { rankings } = await getClubRanking({ slug, type: 'monthly' })

  const formattedRankings = rankings.map((r, index) => {
    const paceAvg = (r as any).paceAvg || 0
    const mins = Math.floor(paceAvg)
    const secs = Math.round((paceAvg - mins) * 60)
    const formattedPace = paceAvg > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : '--:--'

    return {
      id: r.athlete.id,
      name: r.athlete.name || 'Atleta',
      avatarUrl: r.athlete.avatarUrl,
      distance: r.distance || 0,
      workoutsCount: r.workoutsCount || 0,
      points: r.points,
      pace: formattedPace,
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
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      club={clubInfo}
      initialRankings={formattedRankings}
    />
  )
}
