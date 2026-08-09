import { auth } from '@/auth/auth'
import { getSystemFeedbacks } from '@/http/waitlist-actions'
import { redirect } from 'next/navigation'
import React from 'react'
import { AdminFeedbacksClient } from './feedbacks-client'

export default async function AdminFeedbacksPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.isSystemAdmin) {
    redirect('/')
  }

  // Buscar feedbacks iniciais
  const { feedbacks, totalPages } = await getSystemFeedbacks({
    page: 1,
    limit: 15,
  })

  return (
    <AdminFeedbacksClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      initialFeedbacks={feedbacks}
      initialTotalPages={totalPages}
    />
  )
}
