import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { DashboardClient } from './dashboard-client'
import { Workout } from '@/components/workout-card'

interface ClubDashboardPageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Gera dados mockados dinâmicos baseados no slug para simular clubes diferentes.
 */
function generateDynamicMocks(slug: string, userName: string) {
  const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const MOCK_FEED: Workout[] = [
    {
      id: `wk-1-${slug}`,
      title: seed % 2 === 0 ? 'Tiroteio na Pista' : 'Rodagem no Lavrado',
      description: seed % 2 === 0 ? 'Pernas pesadas, mas o pace encaixou.' : 'Treino leve aproveitando o vento.',
      distance: (seed % 15) + 5,
      durationInMinutes: 40 + (seed % 20),
      type: seed % 3 === 0 ? 'INTERVAL' : 'EASY',
      visibility: 'PUBLIC',
      createdAt: new Date().toISOString(),
      author: {
        id: 'usr-2',
        name: 'Carlos Silva',
        avatarUrl: 'https://i.pravatar.cc/150?img=33',
      },
    },
    {
      id: `wk-2-${slug}`,
      title: 'Longão de Domingo',
      distance: (seed % 10) + 15,
      durationInMinutes: 90 + (seed % 30),
      type: 'LONG',
      visibility: 'PUBLIC',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      author: {
        id: 'usr-1',
        name: userName,
        avatarUrl: 'https://github.com/fredsonsouza.png',
      },
    },
  ]

  const MOCK_RANKING = [
    {
      id: 'usr-1',
      name: userName,
      avatarUrl: 'https://github.com/fredsonsouza.png',
      distance: 85.0 + (seed % 50),
      isMe: true,
    },
    {
      id: 'usr-4',
      name: 'Marcos Mendes',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      distance: 70.5 + (seed % 60),
    },
    {
      id: 'usr-5',
      name: 'Elena Costa',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
      distance: 60.2 + (seed % 40),
    },
  ].sort((a, b) => b.distance - a.distance)

  const MOCK_MEMBERS = [
    { id: 'usr-1', name: userName, avatarUrl: 'https://github.com/fredsonsouza.png', role: 'ADMIN' },
    { id: 'usr-2', name: 'Carlos Silva', avatarUrl: 'https://i.pravatar.cc/150?img=33', role: 'MEMBER' },
    { id: 'usr-3', name: 'Ana Paula', avatarUrl: 'https://i.pravatar.cc/150?img=47', role: 'MEMBER' },
  ]

  const MOCK_TYPE_STATS = [
    { type: 'RECOVERY', count: (seed % 10) + 5 },
    { type: 'INTERVAL', count: (seed % 8) + 2 },
    { type: 'EASY', count: (seed % 15) + 10 },
    { type: 'LONG', count: (seed % 5) + 1 },
    { type: 'TEMPO', count: (seed % 6) + 3 },
  ]

  return { MOCK_FEED, MOCK_RANKING, MOCK_MEMBERS, MOCK_TYPE_STATS }
}

export default async function ClubDashboardPage({
  params,
}: ClubDashboardPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  // Procura se o usuário já é membro do clube
  const userClub = clubs.find((c) => c.slug === slug)

  const clubInfo = {
    id: userClub?.id || 'clb-mock',
    name: userClub?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    slug: slug,
    description: userClub?.id 
      ? `Bem-vindo ao ${userClub.name}! Treinos e performance em um só lugar.`
      : 'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
    membersCount: 10,
    location: 'Boa Vista, RR',
    monthlyDistance: 1240.5 + (slug.length * 10),
  }

  const userRole = userClub?.role || 'MEMBER'
  const isMember = !!userClub

  const { MOCK_FEED, MOCK_RANKING, MOCK_MEMBERS, MOCK_TYPE_STATS } = generateDynamicMocks(slug, user?.name || 'Atleta')

  return (
    <DashboardClient
      user={user}
      club={clubInfo}
      userRole={userRole as any}
      isMember={isMember}
      initialFeed={MOCK_FEED}
      ranking={MOCK_RANKING}
      members={MOCK_MEMBERS}
      typeStats={MOCK_TYPE_STATS}
    />
  )
}