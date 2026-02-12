import { Activity, Calendar, MapPin, TrendingUp } from 'lucide-react'

interface WorkoutStatsBarProps {
  total: number
  thisWeek: number
  totalDistance: number
  averagePace: string
}

export function WorkoutStatsBar({
  total,
  thisWeek,
  totalDistance,
  averagePace,
}: WorkoutStatsBarProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total de Treinos */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
          <Activity className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">{total}</p>
          <p className="text-sm text-zinc-400">Total de Treinos</p>
        </div>
      </div>

      {/* Treinos desta Semana */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
          <Calendar className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">
            {thisWeek}
          </p>
          <p className="text-sm text-zinc-400">Nesta Semana</p>
        </div>
      </div>

      {/* Distância Total */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
          <MapPin className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">
            {totalDistance} km
          </p>
          <p className="text-sm text-zinc-400">Distância Total</p>
        </div>
      </div>

      {/* Pace Médio */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
          <TrendingUp className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">
            {averagePace}
          </p>
          <p className="text-sm text-zinc-400">Pace Médio</p>
        </div>
      </div>
    </div>
  )
}
