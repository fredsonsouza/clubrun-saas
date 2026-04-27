import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getRace } from '@/http/get-race'
import { getRaceResults } from '@/http/get-race-results'
import { redirect } from 'next/navigation'
import { RaceDetailsClient } from './race-details-client'

interface RaceDetailsPageProps {
  params: Promise<{
    slug: string
    raceId: string
  }>
}

export default async function RaceDetailsPage({ params }: RaceDetailsPageProps) {
  const { slug, raceId } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  const [{ race }, { results }] = await Promise.all([
    getRace(slug, raceId),
    getRaceResults(slug, raceId)
  ])

  return (
    <RaceDetailsClient
      user={user}
      club={{ name: currentClub.name, slug: currentClub.slug }}
      race={race}
      results={results}
    />
  )
}
