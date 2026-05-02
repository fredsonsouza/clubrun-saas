import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getMembers } from '@/http/get-members'
import { getClubBilling } from '@/http/get-club-billing'
import { getClub } from '@/http/get-club'
import { getClubDashboard } from '@/http/get-club-dashboard'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

interface ClubSettingsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ClubSettingsPage({ params }: ClubSettingsPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  // Procura o clube atual e o papel do usuário nele
  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // Controle de Acesso: Somente OWNER, MANAGER e ADMIN podem acessar as configurações
  const allowedRoles = ['OWNER', 'MANAGER', 'ADMIN']
  if (!allowedRoles.includes(currentClub.role)) {
    redirect(`/${slug}/dashboard`)
  }

  const [{ members }, { billing }, { club }, { metrics }] = await Promise.all([
    getMembers({ slug }),
    getClubBilling(slug),
    getClub(slug),
    getClubDashboard({ slug })
  ])

  const clubInfo = {
    name: club.name,
    slug: club.slug,
    description: club.description || 'Sem descrição.',
  }

  return (
    <SettingsClient
      user={user}
      club={clubInfo}
      userRole={currentClub.role as any}
      members={members}
      billing={billing}
      metrics={metrics}
    />
  )
}
