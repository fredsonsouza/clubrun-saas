'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AthleteProfileHeader } from '@/components/athlete-profile-header'
import { AthleteGoals } from '@/components/athlete-goals'
import { AthleteRecentWorkouts } from '@/components/athlete-recent-workouts'
import { AthleteStatsCards } from './athlete-stats-cards'

// ========================================
// MOCK DATA - Substituir por API real
// ========================================

const MOCK_PROFILE = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(95) 99999-9999',
  avatarUrl: null,
  role: 'MEMBER' as const,
  status: 'active' as const,
  joinedAt: new Date(2025, 0, 15), // 15 Jan 2025

  stats: {
    totalWorkouts: 145,
    monthWorkouts: 12,
    totalDistance: 1234,
    monthDistance: 156,
    averagePace: '5:30',
    monthPace: '5:25',
    currentStreak: 7,
    longestStreak: 21,
  },

  goals: [
    {
      id: '1',
      title: '200 km este mês',
      target: 200,
      current: 156,
      unit: 'km' as const,
    },
    {
      id: '2',
      title: '20 treinos no mês',
      target: 20,
      current: 15,
      unit: 'workouts' as const,
    },
    {
      id: '3',
      title: 'Pace abaixo de 5:30',
      target: 330, // 5:30 em segundos
      current: 325, // 5:25 em segundos
      unit: 'pace' as const,
    },
  ],

  recentWorkouts: [
    {
      id: '1',
      type: 'interval' as const,
      distance: 10,
      pace: '5:20',
      duration: '53:20',
      date: 'há 1 dia',
    },
    {
      id: '2',
      type: 'long-run' as const,
      distance: 21,
      pace: '5:45',
      duration: '2:00:45',
      date: 'há 2 dias',
    },
    {
      id: '3',
      type: 'recovery' as const,
      distance: 8,
      pace: '6:10',
      duration: '49:20',
      date: 'há 3 dias',
    },
    {
      id: '4',
      type: 'run' as const,
      distance: 12,
      pace: '5:30',
      duration: '1:06:00',
      date: 'há 4 dias',
    },
    {
      id: '5',
      type: 'tempo' as const,
      distance: 15,
      pace: '5:15',
      duration: '1:18:45',
      date: 'há 5 dias',
    },
  ],
}

// ========================================
// COMPONENT
// ========================================

export default function AthleteProfilePage() {
  const router = useRouter()

  // Configurações (depois virá de auth/context e params)
  const currentUserId = '1' // MOCK: trocar por auth real
  const athleteId = '1' // MOCK: vem de params
  const userRole = 'owner' // MOCK: trocar por auth real

  const isOwnProfile = currentUserId === athleteId
  const isManager = userRole === 'owner' || userRole === 'coach'
  const canEdit = isOwnProfile || isManager

  const handleBack = () => {
    router.push('/athletes')
  }

  const handleEdit = () => {
    console.log('Edit profile')
    // TODO: Abrir modal ou navegar para página de edição
  }

  const handleAddGoal = () => {
    console.log('Add goal')
    // TODO: Abrir modal de adicionar meta
  }

  const handleViewAllWorkouts = () => {
    router.push(`/athletes/${athleteId}/workouts`)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <AthleteProfileHeader
            name={MOCK_PROFILE.name}
            email={MOCK_PROFILE.email}
            phone={MOCK_PROFILE.phone}
            avatarUrl={MOCK_PROFILE.avatarUrl}
            role={MOCK_PROFILE.role}
            status={MOCK_PROFILE.status}
            joinedAt={MOCK_PROFILE.joinedAt}
            canEdit={canEdit}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <AthleteStatsCards
            totalWorkouts={MOCK_PROFILE.stats.totalWorkouts}
            monthWorkouts={MOCK_PROFILE.stats.monthWorkouts}
            totalDistance={MOCK_PROFILE.stats.totalDistance}
            monthDistance={MOCK_PROFILE.stats.monthDistance}
            averagePace={MOCK_PROFILE.stats.averagePace}
            monthPace={MOCK_PROFILE.stats.monthPace}
            currentStreak={MOCK_PROFILE.stats.currentStreak}
            longestStreak={MOCK_PROFILE.stats.longestStreak}
          />
        </div>

        {/* Content Grid: Goals + Recent Workouts */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Goals - 2 columns */}
          <div className="lg:col-span-2">
            <AthleteGoals
              goals={MOCK_PROFILE.goals}
              canEdit={canEdit}
              onAddGoal={handleAddGoal}
            />
          </div>

          {/* Recent Workouts - 3 columns */}
          <div className="lg:col-span-3">
            <AthleteRecentWorkouts
              workouts={MOCK_PROFILE.recentWorkouts}
              onViewAll={handleViewAllWorkouts}
            />
          </div>
        </div>

        {/* TODO: Adicionar gráfico de evolução aqui depois */}
        {/* <div className="mt-8">
          <AthleteEvolutionChart data={MOCK_PROFILE.evolution} />
        </div> */}
      </div>
    </div>
  )
}
