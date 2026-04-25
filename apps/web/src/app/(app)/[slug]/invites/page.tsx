import React from 'react'
import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getInvites } from '@/http/get-invites'
import { redirect } from 'next/navigation'
import { InvitesClient } from './invites-client'

interface InvitesPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function InvitesPage({ params }: InvitesPageProps) {
  const { slug } = await params
  const { user } = await auth()
  const { clubs } = await getClubs()

  const currentClub = clubs.find((c) => c.slug === slug)

  if (!currentClub) {
    redirect('/')
  }

  // BUSCA CONVITES REAIS DA API
  const { invites } = await getInvites({ slug })

  const formattedInvites = invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    createdAt: invite.createdAt,
    author: invite.author?.name || 'Sistema',
  }))

  const clubInfo = {
    name: currentClub.name,
    slug: currentClub.slug,
  }

  return (
    <InvitesClient
      user={user}
      club={clubInfo}
      initialInvites={formattedInvites}
      userRole={currentClub.role as any}
    />
  )
}
