import { Activity, ChevronRight } from 'lucide-react'
import { WorkoutCard } from './workout-card'
import { Button } from './ui/button'

interface Workout {
  id: string
  type: 'run' | 'long-run' | 'interval' | 'recovery' | 'tempo' | 'race'
  distance: number
  pace: string
  duration: string
  date: string
}

interface AthleteRecentWorkoutsProps {
  workouts: Workout[]
  onViewAll?: () => void
}

export function AthleteRecentWorkouts({
  workouts,
  onViewAll,
}: AthleteRecentWorkoutsProps) {
  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
            <Activity className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              Últimos Treinos
            </h2>
            <p className="text-sm text-zinc-500">Atividades recentes</p>
          </div>
        </div>
        {onViewAll && workouts.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
            onClick={onViewAll}
          >
            Ver todos
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Workouts List */}
      {workouts.length > 0 ? (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              type={workout.type}
              distance={workout.distance}
              pace={workout.pace}
              duration={workout.duration}
              date={workout.date}
              showAthlete={false}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Activity className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-sm text-zinc-400">
            Nenhum treino registrado ainda
          </p>
        </div>
      )}
    </div>
  )
}
