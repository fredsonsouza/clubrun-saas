import { getWorkouts } from '@/http/get-workouts'
import { getMembers } from '@/http/get-members'
import { ReportsClient } from './reports-client'

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Fetch all workouts (PLANNED and COMPLETED) to calculate performance
  const [plannedWorkoutsResponse, completedWorkoutsResponse, membersResponse] = await Promise.all([
    getWorkouts({ slug, status: 'PLANNED', limit: 100 }),
    getWorkouts({ slug, status: 'COMPLETED', limit: 100 }),
    getMembers({ slug }),
  ])

  // Formata os treinos para o formato esperado pelo componente (author ao invés de athlete)
  const formatWorkouts = (workouts: any[]) => workouts.map(w => ({
    ...w,
    author: {
      id: w.athlete.id,
      name: w.athlete.name || 'Atleta',
      avatarUrl: w.athlete.avatarUrl,
    }
  }))

  return (
    <ReportsClient
      slug={slug}
      plannedWorkouts={formatWorkouts(plannedWorkoutsResponse.workouts)}
      completedWorkouts={formatWorkouts(completedWorkoutsResponse.workouts)}
      members={membersResponse.members}
    />
  )
}
