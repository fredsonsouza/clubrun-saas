import { auth } from '@/auth/auth'
import { getSystemLogs } from '@/http/get-system-logs'
import { redirect } from 'next/navigation'
import React from 'react'
import { AdminLogsClient } from './logs-client'

export default async function AdminLogsPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.isSystemAdmin && user.email !== 'admin@clubrun.com') {
    redirect('/')
  }

  // Buscar logs iniciais (página 1, limite 20)
  const { logs, totalPages } = await getSystemLogs({ page: 1, limit: 20 })

  return (
    <AdminLogsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      initialLogs={logs}
      initialTotalPages={totalPages}
    />
  )
}
