import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { MembersClient } from './members-client'

interface MembersPageProps {
  params: Promise<{
    slug: string
  }>
}

// --- MOCK DATA ---
const MOCK_MEMBERS = [
  {
    id: 'usr-1',
    name: 'Admin Clubrun',
    email: 'admin@clubrun.com',
    avatarUrl: 'https://github.com/fredsonsouza.png',
    role: 'ADMIN' as const,
    joinedAt: '01 Jan 2026',
    subscriptionStatus: 'ACTIVE' as const,
  },
  {
    id: 'usr-33',
    name: 'Carlos Silva',
    email: 'carlos@exemplo.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    role: 'MANAGER' as const,
    joinedAt: '15 Fev 2026',
    subscriptionStatus: 'ACTIVE' as const,
  },
  {
    id: 'usr-47',
    name: 'Ana Paula',
    email: 'ana@exemplo.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    role: 'MEMBER' as const,
    joinedAt: '10 Mar 2026',
    subscriptionStatus: 'ACTIVE' as const,
  },
  {
    id: 'usr-68',
    name: 'Elena Costa',
    email: 'elena@exemplo.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    role: 'MEMBER' as const,
    joinedAt: '22 Mar 2026',
    subscriptionStatus: 'INACTIVE' as const,
  },
]

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // Apenas cargos de gestão podem acessar a lista de membros completa? 
  // Geralmente sim, ou então atletas veem uma versão simplificada.
  // Aqui permitiremos para todos os membros do clube, mas as ações de edição serão filtradas no Client.
  
  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
  }

  return (
    <MembersClient
      user={user}
      club={clubInfo}
      initialMembers={MOCK_MEMBERS}
      currentUserRole={currentClub.role}
    />
  )
}
