import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { redirect } from 'next/navigation'
import { InvitesClient } from './invites-client'

interface InvitesPageProps {
  params: Promise<{
    slug: string
  }>
}

// --- MOCKS ---
const MOCK_INVITES = [
  {
    id: 'inv-1',
    email: 'atleta.novo@exemplo.com',
    role: 'MEMBER' as const,
    createdAt: 'Há 2 dias',
  },
  {
    id: 'inv-2',
    email: 'treinador.pro@exemplo.com',
    role: 'MANAGER' as const,
    createdAt: 'Há 5 horas',
  },
]

export default async function InvitesPage({ params }: InvitesPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  // Procura o clube atual e o papel do usuário nele
  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // Controle de Acesso: Somente OWNER e MANAGER podem acessar esta página
  const allowedRoles = ['OWNER', 'MANAGER', 'ADMIN']
  if (!allowedRoles.includes(currentClub.role)) {
    redirect(`/${slug}/dashboard`)
  }

  return (
    <InvitesClient
      user={user}
      slug={slug}
      initialInvites={MOCK_INVITES}
    />
  )
}
