import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getMembers } from '@/http/get-members'
import { redirect } from 'next/navigation'
import { MembersClient } from './members-client'

interface MembersPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // BUSCA MEMBROS REAIS DA API
  const { members } = await getMembers({ slug })

  const formattedMembers = members.map((m) => ({
    id: m.userId,
    name: m.name || 'Atleta',
    email: m.email,
    avatarUrl: m.avatarUrl,
    role: m.role,
    joinedAt: 'Membro Ativo', // Poderia vir do created_at no futuro
    subscriptionStatus: 'ACTIVE' as const, // Poderia vir de billing no futuro
  }))

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
  }

  return (
    <MembersClient
      user={user}
      club={clubInfo}
      initialMembers={formattedMembers}
      currentUserRole={currentClub.role}
    />
  )
}
