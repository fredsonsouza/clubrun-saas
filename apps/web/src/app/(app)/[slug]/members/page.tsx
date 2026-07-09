import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getMembers } from '@/http/get-members'
import { redirect } from 'next/navigation'
import React from 'react'
import { MembersClient } from './members-client'

interface MembersPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
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

  // BUSCA MEMBROS REAIS DA API
  const { members } = await getMembers({ slug })

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
    description: (currentClub as any).description,
  }

  const formattedMembers = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.name || 'Atleta',
    email: m.email,
    avatarUrl: m.avatarUrl,
    role: m.role,
    joinedAt: m.joinedAt
      ? new Date(m.joinedAt).toLocaleDateString('pt-BR')
      : 'Membro Ativo',
    subscriptionStatus: 'ACTIVE' as const,
    overdue: m.overdue,
    paceAvg: (m as any).paceAvg,
    birthDate: m.birthDate,
    shoes: m.shoes,
    watch: m.watch,
    hasMedicalConditions: m.hasMedicalConditions,
    medicalConditions: m.medicalConditions,
  }))

  return (
    <MembersClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      club={clubInfo}
      initialMembers={formattedMembers}
      currentUserRole={currentClub.role}
    />
  )
}
