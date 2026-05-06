import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getRaces } from '@/http/get-races'
import { redirect } from 'next/navigation'
import { RacesClient } from './races-client'
import { isAfter, isBefore, startOfDay } from 'date-fns'

interface ClubRacesPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ClubRacesPage({ params }: ClubRacesPageProps) {
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

  const { races } = await getRaces(slug)

  const today = startOfDay(new Date())

  const upcoming = races
    .filter((race) => isAfter(new Date(race.date), today) || new Date(race.date).toDateString() === today.toDateString())
    .map((race) => ({
      ...race,
      status: 'UPCOMING' as const,
      registeredCount: race._count.results,
      location: race.city,
      date: new Date(race.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      distances: [`${race.distance}k`]
    }))

  const past = races
    .filter((race) => isBefore(new Date(race.date), today))
    .map((race) => ({
      ...race,
      status: 'COMPLETED' as const,
      registeredCount: race._count.results,
      location: race.city,
      date: new Date(race.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      distances: [`${race.distance}k`]
    }))

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
  }

  return (
    <RacesClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      club={clubInfo}
      userRole={currentClub.role as any}
      upcomingRaces={upcoming}
      pastRaces={past}
    />
  )
}
