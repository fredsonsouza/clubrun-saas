import { auth } from '@/auth/auth'
import { getSystemClubs } from '@/http/get-system-clubs'
import { redirect } from 'next/navigation'
import React from 'react'
import { AdminClubsClient } from './clubs-client'

export default async function AdminClubsPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.isSystemAdmin && user.email !== 'admin@clubrun.com') {
    redirect('/')
  }

  const { clubs } = await getSystemClubs()

  return (
    <AdminClubsClient
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
