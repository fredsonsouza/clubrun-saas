import React from 'react'
import { auth } from '@/auth/auth'
import { getSystemClubs } from '@/http/get-system-clubs'
import { AdminClubsClient } from './clubs-client'

export default async function AdminClubsPage() {
  const { user } = await auth()
  const { clubs } = await getSystemClubs()

  return (
    <AdminClubsClient 
      user={user}
      initialClubs={clubs}
    />
  )
}
