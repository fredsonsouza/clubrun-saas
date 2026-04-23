import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
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

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
    description: 'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
  }

  return (
    <SettingsClient
      user={user}
      club={clubInfo}
      userRole={currentClub.role as any}
    />
  )
}
