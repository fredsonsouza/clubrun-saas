'use client'

import { useState } from 'react'
import { ClubSwitcher } from '@/components/clubs-switcher'
import { StatCard } from '@/components/stat-card'
import { WorkoutCard } from '@/components/workout-card'
import { AthleteRanking } from '@/components/athlete-ranking'
import { EmptyState } from '@/components/empty-state'
import { Activity, Users, TrendingUp, Calendar } from 'lucide-react'
import { getClubs } from '@/http/get-clubs'

// ========================================
// MOCK DATA - Substituir por API real
// ========================================

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
  {
    id: '3',
    name: 'Runners do Norte',
    memberCount: 12,
    role: 'COACH' as const,
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
      {
        id: '5',
        type: 'run' as const,
        distance: 12,
        pace: '5:30',
        duration: '1:06:00',
        date: 'há 3 horas',
        athleteName: 'Ana Costa',
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
  '3': {
    stats: {
      totalWorkouts: 123,
      activeMembers: 10,
      totalDistance: 789,
      averagePace: '6:00',
    },
    recentWorkouts: [
      {
        id: '6',
        type: 'run' as const,
        distance: 10,
        pace: '6:00',
        duration: '1:00:00',
        date: 'há 4 horas',
        athleteName: 'Beatriz Oliveira',
      },
    ],
    topAthletes: [
      {
        name: 'Beatriz Oliveira',
        initials: 'BO',
        totalDistance: 178,
        totalWorkouts: 32,
      },
      {
        name: 'Juliana Souza',
        initials: 'JS',
        totalDistance: 156,
        totalWorkouts: 28,
      },
      {
        name: 'Fernando Costa',
        initials: 'FC',
        totalDistance: 134,
        totalWorkouts: 24,
      },
    ],
  },
}

// ========================================
// COMPONENT
// ========================================

export async function ClubDashboardPage() {
  const { clubs } = await getClubs()
  const [selectedClubId, setSelectedClubId] = useState('1')

  // Dados do clube selecionado
  const clubData = MOCK_CLUB_DATA[selectedClubId as keyof typeof MOCK_CLUB_DATA]
  const selectedClub = MOCK_CLUBS.find((c) => c.id === selectedClubId)

  if (!clubData || !selectedClub) return null

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Club Switcher */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-bold text-white">
                Dashboard do Clube
              </h1>
              <p className="mt-2 text-zinc-400">
                Visão geral das atividades e atletas
              </p>
            </div>
          </div>

          {/* Club Switcher */}
          <div className="mt-6">
            <ClubSwitcher
              clubs={MOCK_CLUBS}
              currentClubId={selectedClubId}
              onClubChange={setSelectedClubId}
            />
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
          {/* Recent Workouts - 2 columns */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold text-white">
                  Treinos Recentes
                </h2>
                <span className="text-sm text-zinc-500">
                  {clubData.recentWorkouts.length} treinos
                </span>
              </div>

              {clubData.recentWorkouts.length > 0 ? (
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
              ) : (
                <EmptyState
                  icon={Activity}
                  title="Nenhum treino recente"
                  description="Os treinos do clube aparecerão aqui"
                />
              )}
            </div>
          </div>

          {/* Top Athletes - 1 column */}
          <div className="lg:col-span-1">
            <AthleteRanking athletes={clubData.topAthletes} />
          </div>
        </div>
      </div>
    </div>
  )
}
