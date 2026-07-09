import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getRace } from '@/http/get-race'
import { getRaceParticipants } from '@/http/get-race-participants'
import { getRaceResults } from '@/http/get-race-results'
import { redirect } from 'next/navigation'
import React from 'react'
import { RaceDetailsClient } from './race-details-client'

interface RaceDetailsPageProps {
  params: Promise<{
    slug: string
    raceId: string
  }>
}

export default async function RaceDetailsPage({
  params,
}: RaceDetailsPageProps) {
  const { slug, raceId } = await params
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  const { race } = await getRace(slug, raceId)
  const isFuture = new Date(race.date) > new Date()

  let results: any[] = []
  let participants: any[] = []

  if (isFuture) {
    const res = await getRaceParticipants(slug, raceId)
    participants = res.participants
  } else {
    const res = await getRaceResults(slug, raceId)
    results = res.results
  }

  return (
    <RaceDetailsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      club={{ name: currentClub.name, slug: currentClub.slug }}
      userRole={currentClub.role as any}
      race={race}
      results={results}
      participants={participants}
    />
  )
}
