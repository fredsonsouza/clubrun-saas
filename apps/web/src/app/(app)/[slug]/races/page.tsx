import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getRaces } from '@/http/get-races'
import { isAfter, isBefore, startOfDay } from 'date-fns'
import { redirect } from 'next/navigation'
import React from 'react'
import { RacesClient } from './races-client'

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
  const now = new Date()

  const upcoming = races
    .filter((race) => isAfter(new Date(race.date), now))
    .map((race) => ({
      ...race,
      status: 'UPCOMING' as const,
      registeredCount: race._count.participants,
      location: race.city,
      date: new Date(race.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date(race.date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      rawDate: race.date,
      participants: race.participants.map((p) => ({
        id: p.athlete.id,
        avatarUrl: p.athlete.avatarUrl,
      })),
      distances: [`${race.distance}km`],
      isRegistered: race.isRegistered,
    }))

  const past = races
    .filter((race) => isBefore(new Date(race.date), now))
    .map((race) => ({
      ...race,
      status: 'COMPLETED' as const,
      registeredCount: race._count.participants,
      location: race.city,
      date: new Date(race.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date(race.date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      rawDate: race.date,
      participants: race.participants.map((p) => ({
        id: p.athlete.id,
        avatarUrl: p.athlete.avatarUrl,
      })),
      distances: [`${race.distance}km`],
      isRegistered: race.isRegistered,
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
