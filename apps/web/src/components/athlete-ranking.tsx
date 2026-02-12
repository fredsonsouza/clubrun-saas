import { Trophy, TrendingUp } from 'lucide-react'

interface AthleteRankingProps {
  athletes: Array<{
    name: string
    initials: string
    totalDistance: number
    totalWorkouts: number
  }>
  currentUserName?: string
}

export function AthleteRanking({
  athletes,
  currentUserName,
}: AthleteRankingProps) {
  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-500'
    if (position === 2) return 'text-zinc-400'
    if (position === 3) return 'text-amber-600'
    return 'text-zinc-600'
  }

  const getMedalBg = (position: number) => {
    if (position === 1) return 'bg-yellow-500/10'
    if (position === 2) return 'bg-zinc-400/10'
    if (position === 3) return 'bg-amber-600/10'
    return 'bg-zinc-800/50'
  }

  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
          <Trophy className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            Top Atletas
          </h2>
          <p className="text-sm text-zinc-500">Ranking do mês</p>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {athletes.map((athlete, index) => {
          const position = index + 1
          const isCurrentUser = athlete.name === currentUserName

          return (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                isCurrentUser
                  ? 'border border-orange-500/30 bg-orange-500/5'
                  : 'hover:bg-zinc-800/50'
              }`}
            >
              {/* Position / Medal */}
              <div
                className={`font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${getMedalColor(position)} ${getMedalBg(position)}`}
              >
                {position <= 3 ? (
                  <Trophy className="h-5 w-5" />
                ) : (
                  <span>{position}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-500">
                  {athlete.initials}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-medium text-white">
                  {athlete.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-orange-500">(Você)</span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {athlete.totalWorkouts} treinos
                  </span>
                </div>
              </div>

              {/* Distance */}
              <div className="text-right">
                <p className="font-display text-lg font-bold text-white">
                  {athlete.totalDistance}
                </p>
                <p className="text-xs text-zinc-500">km</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {athletes.length === 0 && (
        <div className="py-12 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">
            Nenhum atleta com treinos este mês
          </p>
        </div>
      )}
    </div>
  )
}
