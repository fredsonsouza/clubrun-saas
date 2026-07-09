import { auth } from '@/auth/auth'
import { Club } from '@/components/club-card'
import React from 'react'
import { ExploreClubsClient } from './explore-clubs-client'

import { getExploreClubs } from '@/http/get-explore-clubs'
import { redirect } from 'next/navigation'

export default async function ExploreClubsPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { clubs } = await getExploreClubs()

  return (
    <ExploreClubsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      initialClubs={clubs}
    />
  )
}
