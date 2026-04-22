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

// --- MOCKS DO BACK-END ---
const MOCK_FEED: Workout[] = [
  {
    id: 'wk-1',
    title: 'Tiroteio na Pista',
    description: 'Pernas pesadas, mas o pace encaixou.',
    distance: 8.5,
    durationInMinutes: 40,
    type: 'INTERVAL',
    visibility: 'PUBLIC',
    createdAt: new Date().toISOString(),
    author: {
      id: 'usr-2',
      name: 'Carlos Silva',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
    },
  },
  {
    id: 'wk-2',
    title: 'Rodagem regenerativa',
    distance: 5.0,
    durationInMinutes: 32,
    type: 'RECOVERY',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: {
      id: 'usr-3',
      name: 'Ana Paula',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
    },
  },
  {
    id: 'wk-3',
    title: 'Longão de Domingo',
    description: 'Sol forte, mas a hidratação salvou.',
    distance: 18.0,
    durationInMinutes: 95,
    type: 'LONG',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: {
      id: 'usr-4',
      name: 'Marcos Mendes',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
    },
  },
  {
    id: 'wk-4',
    title: 'Tempo Run Progressivo',
    distance: 10.0,
    durationInMinutes: 48,
    type: 'TEMPO',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    author: {
      id: 'usr-5',
      name: 'Elena Costa',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
    },
  },
  {
    id: 'wk-5',
    title: 'Tiros de 400m',
    distance: 6.4,
    durationInMinutes: 35,
    type: 'INTERVAL',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    author: {
      id: 'usr-1',
      name: 'Fredson Souza',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
  },
]

const MOCK_RANKING = [
  {
    id: 'usr-4',
    name: 'Marcos Mendes',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    distance: 142.5,
  },
  {
    id: 'usr-5',
    name: 'Elena Costa',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    distance: 130.2,
  },
  {
    id: 'usr-1',
    name: 'Fredson Souza',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    distance: 85.0,
    isMe: true,
  },
]

const MOCK_MEMBERS = [
  { id: 'usr-1', name: 'Fredson Souza', avatarUrl: 'https://i.pravatar.cc/150?img=11', role: 'OWNER' },
  { id: 'usr-2', name: 'Carlos Silva', avatarUrl: 'https://i.pravatar.cc/150?img=33', role: 'MEMBER' },
  { id: 'usr-3', name: 'Ana Paula', avatarUrl: 'https://i.pravatar.cc/150?img=47', role: 'MEMBER' },
  { id: 'usr-4', name: 'Marcos Mendes', avatarUrl: 'https://i.pravatar.cc/150?img=12', role: 'MANAGER' },
  { id: 'usr-5', name: 'Elena Costa', avatarUrl: 'https://i.pravatar.cc/150?img=68', role: 'MEMBER' },
]

const MOCK_TYPE_STATS = [
  { type: 'RECOVERY', count: 20 },
  { type: 'INTERVAL', count: 15 },
  { type: 'EASY', count: 12 },
  { type: 'LONG', count: 8 },
  { type: 'TEMPO', count: 5 },
]

export default async function ClubDashboardPage({
  params,
}: ClubDashboardPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  // Procura se o usuário já é membro do clube
  const userClub = clubs.find((c) => c.slug === slug)

  // Para fins de demonstração/MVP, permitiremos visualizar o dashboard 
  // mesmo que o usuário não seja membro ainda (ex: clicou em "Acessar Painel" no explorar)
  const clubInfo = {
    id: userClub?.id || 'clb-mock',
    name: userClub?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    slug: slug,
    description:
      'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
    membersCount: 84,
    location: 'Boa Vista, RR',
    monthlyDistance: 1240.5,
  }

  const userRole = userClub?.role || 'MEMBER'
  const isMember = !!userClub

  return (
    <DashboardClient
      user={user}
      club={clubInfo}
      userRole={userRole}
      isMember={isMember}
      initialFeed={MOCK_FEED}
      ranking={MOCK_RANKING}
      members={MOCK_MEMBERS}
      typeStats={MOCK_TYPE_STATS}
    />
  )
}