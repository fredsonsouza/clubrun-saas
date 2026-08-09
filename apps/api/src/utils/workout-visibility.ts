import type { Role } from '@saas/auth'

type WorkoutVisibility = 'PUBLIC' | 'COACH_ONLY' | 'PRIVATE'

type VisibilityFilter = {
  OR: Array<{
    athleteId?: string
    visibility?: WorkoutVisibility
  }>
}

const coachVisibilityRoles: Role[] = ['OWNER', 'MANAGER', 'ADMIN', 'COACH']

export function getWorkoutVisibilityFilter(
  viewerId: string,
  role: Role,
  isSystemAdmin = false
): VisibilityFilter | Record<string, never> {
  if (isSystemAdmin) {
    return {}
  }

  const visibleWorkouts: VisibilityFilter['OR'] = [
    { athleteId: viewerId },
    { visibility: 'PUBLIC' },
  ]

  if (coachVisibilityRoles.includes(role)) {
    visibleWorkouts.push({ visibility: 'COACH_ONLY' })
  }

  return { OR: visibleWorkouts }
}

export function canViewWorkout(
  workout: { athleteId: string; visibility: WorkoutVisibility },
  viewerId: string,
  role: Role,
  isSystemAdmin = false
) {
  if (isSystemAdmin || workout.athleteId === viewerId) {
    return true
  }

  if (workout.visibility === 'PUBLIC') {
    return true
  }

  return (
    workout.visibility === 'COACH_ONLY' && coachVisibilityRoles.includes(role)
  )
}
