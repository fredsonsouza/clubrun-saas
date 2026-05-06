import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getClubDashboard } from '@/http/get-club-dashboard'
import { getWorkouts } from '@/http/get-workouts'
import { getClubRanking } from '@/http/get-club-ranking'
import { getMembers } from '@/http/get-members'
import { getClub } from '@/http/get-club'
import { DashboardClient } from './dashboard-client'
import { redirect } from 'next/navigation'

interface ClubDashboardPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ClubDashboardPage({
  params,
}: ClubDashboardPageProps) {
  const { slug } = await params
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { clubs } = await getClubs()

  // Procura se o usuário já é membro do clube
  const userClub = clubs.find((c) => c.slug === slug)

  if (!userClub) {
    redirect('/')
  }

  // BUSCA DADOS REAIS DA API
  const [
    { metrics }, 
    { workouts }, 
    { rankings }, 
    { members },
    { club }
  ] = await Promise.all([
    getClubDashboard({ slug }),
    getWorkouts({ slug, limit: 10 }),
    getClubRanking({ slug, type: 'monthly' }),
    getMembers({ slug }),
    getClub(slug)
  ])

  const clubInfo = {
    id: userClub.id,
    name: club.name,
    slug: slug,
    avatarUrl: club.avatarUrl,
    bannerUrl: club.bannerUrl,
    description: club.description || `Bem-vindo ao ${club.name}! Treinos e performance em um só lugar.`,
    membersCount: metrics.activeMembers + metrics.inactiveMembers,
    location: club.city && club.state ? `${club.city}, ${club.state}` : club.city || club.state || 'Localização não definida',
    monthlyDistance: metrics.totalDistanceMonth,
  }

  // Formata o Feed para o formato esperado pelo DashboardClient
  const initialFeed = workouts.map(w => ({
    id: w.id,
    title: w.title || (w.type === 'EASY' ? 'Rodagem Leve' : 'Treino de Corrida'),
    description: w.notes || '',
    distance: w.distance,
    durationInSeconds: w.duration || 0,
    type: w.type as any,
    visibility: 'PUBLIC' as const,
    status: w.status as any,
    assignmentMode: w.assignmentMode as any,
    createdAt: typeof w.date === 'string' ? w.date : new Date(w.date).toISOString(),
    author: {
      id: w.athlete.id,
      name: w.athlete.name || 'Atleta',
      avatarUrl: w.athlete.avatarUrl,
    }
  }))

  // Formata o Ranking
  const formattedRanking = rankings.map(r => ({
    id: r.athlete.id,
    name: r.athlete.name || 'Atleta',
    avatarUrl: r.athlete.avatarUrl,
    distance: r.distance,
    isMe: r.athlete.id === user.id
  }))

  // Formata a lista de membros
  const formattedMembers = members.map(m => ({
    id: m.id,
    userId: m.userId,
    name: m.name || 'Atleta',
    avatarUrl: m.avatarUrl,
    role: m.role
  }))

  // Agrega estatísticas por tipo
  const typeStats = metrics.workoutsByType || []

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      club={clubInfo}
      userRole={userClub.role as any}
      isMember={true}
      initialFeed={initialFeed}
      ranking={formattedRanking}
      members={formattedMembers}
      typeStats={typeStats}
    />
  )
}