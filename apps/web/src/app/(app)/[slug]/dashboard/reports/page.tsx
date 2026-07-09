import { auth } from '@/auth/auth'
import { getMembers } from '@/http/get-members'
import { getWorkouts } from '@/http/get-workouts'
import { redirect } from 'next/navigation'
import { ReportsClient } from './reports-client'

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Fetch all workouts (PLANNED and COMPLETED) to calculate performance
  const [plannedWorkoutsResponse, completedWorkoutsResponse, membersResponse] =
    await Promise.all([
      getWorkouts({ slug, status: 'PLANNED', limit: 100 }),
      getWorkouts({ slug, status: 'COMPLETED', limit: 100 }),
      getMembers({ slug }),
    ])

  // Formata os treinos para o formato esperado pelo componente (author ao invés de athlete)
  const formatWorkouts = (workouts: any[]) =>
    workouts.map((w) => ({
      ...w,
      durationInSeconds: w.duration || 0,
      pace: w.pace || null,
      author: {
        id: w.athlete.id,
        name: w.athlete.name || 'Atleta',
        avatarUrl: w.athlete.avatarUrl,
      },
    }))

  return (
    <ReportsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      slug={slug}
      plannedWorkouts={formatWorkouts(plannedWorkoutsResponse.workouts)}
      completedWorkouts={formatWorkouts(completedWorkoutsResponse.workouts)}
      members={membersResponse.members}
    />
  )
}
