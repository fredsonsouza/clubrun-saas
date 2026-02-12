import { Activity, MapPin, TrendingUp, Flame } from 'lucide-react'

interface AthleteStatsCardsProps {
  totalWorkouts: number
  monthWorkouts: number
  totalDistance: number
  monthDistance: number
  averagePace: string
  monthPace: string
  currentStreak: number
  longestStreak: number
}

export function AthleteStatsCards({
  totalWorkouts,
  monthWorkouts,
  totalDistance,
  monthDistance,
  averagePace,
  monthPace,
  currentStreak,
  longestStreak,
}: AthleteStatsCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total de Treinos */}
      <div
        className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
          <Activity className="h-6 w-6 text-orange-500" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-zinc-400">
          Total de Treinos
        </h3>
        <p className="font-display mb-2 text-3xl font-bold text-white">
          {totalWorkouts}
        </p>
        <p className="text-sm text-zinc-500">+{monthWorkouts} este mês</p>
      </div>

      {/* Distância Total */}
      <div
        className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
          <MapPin className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-zinc-400">
          Distância Total
        </h3>
        <p className="font-display mb-2 text-3xl font-bold text-white">
          {totalDistance.toLocaleString()} km
        </p>
        <p className="text-sm text-zinc-500">{monthDistance} km este mês</p>
      </div>

      {/* Pace Médio */}
      <div
        className="rounded-xl border border-green-500/20 bg-green-500/5 p-6"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-zinc-400">Pace Médio</h3>
        <p className="font-display mb-2 text-3xl font-bold text-white">
          {averagePace}
        </p>
        <p className="text-sm text-zinc-500">{monthPace} este mês</p>
      </div>

      {/* Sequência */}
      <div
        className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
          <Flame className="h-6 w-6 text-purple-500" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-zinc-400">
          Sequência Atual
        </h3>
        <p className="font-display mb-2 text-3xl font-bold text-white">
          {currentStreak} dias
        </p>
        <p className="text-sm text-zinc-500">Recorde: {longestStreak} dias</p>
      </div>
    </div>
  )
}
