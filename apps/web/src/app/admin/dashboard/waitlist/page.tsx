import { auth } from '@/auth/auth'
import { getSystemWaitlist } from '@/http/waitlist-actions'
import { redirect } from 'next/navigation'
import React from 'react'
import { AdminWaitlistClient } from './waitlist-client'

export default async function AdminWaitlistPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.isSystemAdmin && user.email !== 'admin@clubrun.com') {
    redirect('/')
  }

  // Buscar registros da lista de espera iniciais
  const { waitlist, totalPages } = await getSystemWaitlist({
    page: 1,
    limit: 20,
  })

  return (
    <AdminWaitlistClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      initialWaitlist={waitlist}
      initialTotalPages={totalPages}
    />
  )
}
