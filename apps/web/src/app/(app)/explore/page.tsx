import React from 'react'
import { auth } from '@/auth/auth'
import { Club } from '@/components/club-card'
import { ExploreClubsClient } from './explore-clubs-client'

import { getExploreClubs } from '@/http/get-explore-clubs'

export default async function ExploreClubsPage() {
  const { user } = await auth()
  const { clubs } = await getExploreClubs()

  return (
    <ExploreClubsClient user={user} initialClubs={clubs} />
  )
}
