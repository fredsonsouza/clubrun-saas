import { WorkoutCard } from './workout-card'
import { EmptyState } from './empty-state'
import { Activity } from 'lucide-react'

interface Workout {
  id: string
  type: 'run' | 'long-run' | 'interval' | 'recovery' | 'tempo' | 'race'
  distance: number
  pace: string
  duration: string
  date: string
  athleteName?: string
  athleteInitials?: string
}

interface WorkoutListProps {
  workouts: Workout[]
  showAthlete?: boolean
  isLoading?: boolean
}

export function WorkoutList({
  workouts,
  showAthlete = false,
  isLoading = false,
}: WorkoutListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhum treino encontrado"
        description="Não há treinos que correspondam aos filtros selecionados. Tente ajustar os filtros ou adicione um novo treino."
      />
    )
  }

  // Workouts grid
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          type={workout.type}
          distance={workout.distance}
          pace={workout.pace}
          duration={workout.duration}
          date={workout.date}
          athleteName={workout.athleteName}
          athleteInitials={workout.athleteInitials}
          showAthlete={showAthlete}
        />
      ))}
    </div>
  )
}
