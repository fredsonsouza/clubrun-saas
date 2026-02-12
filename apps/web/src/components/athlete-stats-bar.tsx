import { Users, UserCheck, UserX } from 'lucide-react'

interface AthleteStatsBarProps {
  total: number
  active: number
  inactive: number
}

export function AthleteStatsBar({
  total,
  active,
  inactive,
}: AthleteStatsBarProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Total de Atletas */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
          <Users className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">{total}</p>
          <p className="text-sm text-zinc-400">Total de Atletas</p>
        </div>
      </div>

      {/* Atletas Ativos */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
          <UserCheck className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">{active}</p>
          <p className="text-sm text-zinc-400">Ativos</p>
        </div>
      </div>

      {/* Atletas Inativos */}
      <div
        className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700/10">
          <UserX className="h-6 w-6 text-zinc-500" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">
            {inactive}
          </p>
          <p className="text-sm text-zinc-400">Inativos</p>
        </div>
      </div>
    </div>
  )
}
