import { auth } from '@/auth/auth'
import { getClubs } from '@/http/get-clubs'
import { getInvites } from '@/http/get-invites'
import { getPendingMembers } from '@/http/get-pending-members'
import { redirect } from 'next/navigation'
import React from 'react'
import { InvitesClient } from './invites-client'

interface InvitesPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function InvitesPage({ params }: InvitesPageProps) {
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

  // BUSCA CONVITES REAIS DA API
  const { invites } = await getInvites({ slug })
  const { members: pendingMembers } = await getPendingMembers(slug)

  const formattedInvites = invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    createdAt: invite.createdAt,
    author: invite.author?.name || 'Sistema',
  }))

  const formattedPendingMembers = pendingMembers.map((m) => ({
    id: m.id,
    name: m.user.name || 'Novo Corredor',
    email: m.user.email,
    avatarUrl: m.user.avatarUrl,
    createdAt: m.createdAt,
  }))

  return (
    <InvitesClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      slug={slug}
      initialInvites={formattedInvites}
      initialPendingMembers={formattedPendingMembers}
    />
  )
}
