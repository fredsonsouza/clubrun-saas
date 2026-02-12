import { Clock, MapPin, TrendingUp } from 'lucide-react'

interface WorkoutCardProps {
  type: 'run' | 'long-run' | 'interval' | 'recovery' | 'tempo' | 'race'
  distance: number
  pace: string
  duration: string
  date: string
  athleteName?: string
  athleteInitials?: string
  showAthlete?: boolean
}

const workoutTypeLabels = {
  run: 'Rodagem',
  'long-run': 'Longão',
  interval: 'Intervalado',
  recovery: 'Recuperação',
  tempo: 'Tempo',
  race: 'Corrida',
}

const workoutTypeStyles = {
  run: 'workout-run',
  'long-run': 'workout-long-run',
  interval: 'workout-interval',
  recovery: 'workout-recovery',
  tempo: 'workout-tempo',
  race: 'workout-race',
}

export function WorkoutCard({
  type,
  distance,
  pace,
  duration,
  date,
  athleteName,
  athleteInitials,
  showAthlete = false,
}: WorkoutCardProps) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showAthlete && athleteName && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-500">
                {athleteInitials || athleteName.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-zinc-300">
                {athleteName}
              </span>
            </div>
          )}
        </div>

        {/* Badge Tipo de Treino */}
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${workoutTypeStyles[type]}`}
        >
          {workoutTypeLabels[type]}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        {/* Distância */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-zinc-500" />
          <div>
            <p className="font-display text-lg font-bold text-white">
              {distance}
            </p>
            <p className="text-xs text-zinc-500">km</p>
          </div>
        </div>

        {/* Pace */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-zinc-500" />
          <div>
            <p className="font-display text-lg font-bold text-white">{pace}</p>
            <p className="text-xs text-zinc-500">min/km</p>
          </div>
        </div>

        {/* Duração */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-500" />
          <div>
            <p className="font-display text-lg font-bold text-white">
              {duration}
            </p>
            <p className="text-xs text-zinc-500">tempo</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
        <p className="text-xs text-zinc-500">{date}</p>
      </div>
    </div>
  )
}
