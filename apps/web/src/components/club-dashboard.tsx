'use client'

import { useState } from 'react'
import { Container } from '@/components/container'
import { StatCard } from '@/components/stat-card'
import { WorkoutCard } from '@/components/workout-card'
import { AthleteRanking } from '@/components/athlete-ranking'
import { Activity, Users, TrendingUp, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// MOCK DATA
const MOCK_CLUBS = [
  {
    id: '1',
    name: 'ClubRun Boa Vista',
    memberCount: 23,
    role: 'OWNER' as const,
  },
  {
    id: '2',
    name: 'Corredores de Roraima',
    memberCount: 45,
    role: 'MEMBER' as const,
  },
]

const MOCK_CLUB_DATA = {
  '1': {
    stats: {
      totalWorkouts: 245,
      activeMembers: 20,
      totalDistance: 1234,
      averagePace: '5:30',
    },
    recentWorkouts: [
      {
        id: '1',
        type: 'interval' as const,
        distance: 10,
        pace: '5:20',
        duration: '53:20',
        date: 'há 2 horas',
        athleteName: 'João Silva',
      },
      {
        id: '2',
        type: 'long-run' as const,
        distance: 21,
        pace: '5:45',
        duration: '2:00:45',
        date: 'há 5 horas',
        athleteName: 'Maria Santos',
      },
      {
        id: '3',
        type: 'recovery' as const,
        distance: 8,
        pace: '6:10',
        duration: '49:20',
        date: 'ontem',
        athleteName: 'Pedro Alves',
      },
    ],
    topAthletes: [
      {
        name: 'João Silva',
        initials: 'JS',
        totalDistance: 245,
        totalWorkouts: 45,
      },
      {
        name: 'Maria Santos',
        initials: 'MS',
        totalDistance: 198,
        totalWorkouts: 38,
      },
      {
        name: 'Pedro Alves',
        initials: 'PA',
        totalDistance: 187,
        totalWorkouts: 35,
      },
    ],
  },
  '2': {
    stats: {
      totalWorkouts: 567,
      activeMembers: 42,
      totalDistance: 3456,
      averagePace: '5:45',
    },
    recentWorkouts: [
      {
        id: '4',
        type: 'tempo' as const,
        distance: 15,
        pace: '5:15',
        duration: '1:18:45',
        date: 'há 1 hora',
        athleteName: 'Carlos Lima',
      },
    ],
    topAthletes: [
      {
        name: 'Carlos Lima',
        initials: 'CL',
        totalDistance: 312,
        totalWorkouts: 56,
      },
      {
        name: 'Ana Costa',
        initials: 'AC',
        totalDistance: 289,
        totalWorkouts: 52,
      },
      {
        name: 'Rafael Mendes',
        initials: 'RM',
        totalDistance: 267,
        totalWorkouts: 48,
      },
    ],
  },
}

export default function ClubsDashboardPage() {
  const [selectedClubId, setSelectedClubId] = useState('1')
  const clubData = MOCK_CLUB_DATA[selectedClubId as keyof typeof MOCK_CLUB_DATA]
  const selectedClub = MOCK_CLUBS.find((c) => c.id === selectedClubId)

  if (!clubData || !selectedClub) return null

  return (
    <Container>
      {/* Page Header with Club Switcher */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-400">
            Visão geral das atividades do clube
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* <ClubSwitcher
            clubs={MOCK_CLUBS}
            currentClubId={selectedClubId}
            onClubChange={setSelectedClubId}
          /> */}
          <Link href="/workouts/new">
            <Button className="w-full bg-orange-500 font-semibold text-white hover:bg-orange-600 sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Treino
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Treinos do Mês"
          value={clubData.stats.totalWorkouts}
          trend={{ value: '+12%', direction: 'up' }}
          variant="primary"
        />
        <StatCard
          icon={Users}
          label="Atletas Ativos"
          value={clubData.stats.activeMembers}
          subtitle={`de ${selectedClub.memberCount} total`}
          variant="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Distância Total"
          value={`${clubData.stats.totalDistance} km`}
          trend={{ value: '+8%', direction: 'up' }}
          variant="warning"
        />
        <StatCard
          icon={Calendar}
          label="Pace Médio"
          value={clubData.stats.averagePace}
          subtitle="min/km"
          variant="default"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Workouts */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Treinos Recentes
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Últimas atividades do clube
                </p>
              </div>
              <Link
                href="/workouts"
                className="text-sm font-medium text-orange-500 hover:text-orange-400"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-4">
              {clubData.recentWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  type={workout.type}
                  distance={workout.distance}
                  pace={workout.pace}
                  duration={workout.duration}
                  date={workout.date}
                  athleteName={workout.athleteName}
                  showAthlete={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top Athletes */}
        <div className="lg:col-span-1">
          <AthleteRanking athletes={clubData.topAthletes} />
        </div>
      </div>
    </Container>
  )
}
