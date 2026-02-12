'use client'

interface RankingEntry {
  position: number
  athlete: {
    id: string
    name: string
    avatarUrl: string | null
  }
  metric: {
    value: number
    label: string
  }
  stats: {
    totalWorkouts: number
    averagePace: string
  }
  isCurrentUser?: boolean
}

interface RankingTableProps {
  rankings: RankingEntry[]
  onAthleteClick?: (athleteId: string) => void
}

export function RankingTable({ rankings, onAthleteClick }: RankingTableProps) {
  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
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
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-white">
          Ranking Completo
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {rankings.length} atletas classificados
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="pb-3 text-sm font-medium text-zinc-400">#</th>
              <th className="pb-3 text-sm font-medium text-zinc-400">Atleta</th>
              <th className="pb-3 text-sm font-medium text-zinc-400">
                Métrica
              </th>
              <th className="hidden pb-3 text-sm font-medium text-zinc-400 sm:table-cell">
                Pace Médio
              </th>
              <th className="hidden pb-3 text-sm font-medium text-zinc-400 md:table-cell">
                Treinos
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rankings.map((entry, index) => {
              const medal = getMedalEmoji(entry.position)

              return (
                <tr
                  key={entry.athlete.id}
                  id={`rank-${entry.position}`}
                  className={`group cursor-pointer border-b border-zinc-800/50 transition-all hover:bg-zinc-800/50 ${
                    entry.isCurrentUser
                      ? 'border-2 border-orange-500 bg-orange-500/5'
                      : ''
                  }`}
                  onClick={() => onAthleteClick?.(entry.athlete.id)}
                >
                  {/* Position */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="font-display text-lg font-bold text-zinc-400">
                          {entry.position}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Athlete */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {entry.athlete.avatarUrl ? (
                        <img
                          src={entry.athlete.avatarUrl}
                          alt={entry.athlete.name}
                          className="h-10 w-10 rounded-full border-2 border-zinc-800 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-800 bg-orange-500/20 text-xs font-bold text-orange-500">
                          {getInitials(entry.athlete.name)}
                        </div>
                      )}
                      {/* Name */}
                      <div>
                        <p className="font-medium text-white group-hover:text-orange-500">
                          {entry.athlete.name}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-xs text-orange-500">
                              (Você)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Metric */}
                  <td className="py-4">
                    <span className="font-display text-lg font-bold text-white">
                      {entry.metric.label}
                    </span>
                  </td>

                  {/* Pace (hidden on mobile) */}
                  <td className="hidden py-4 sm:table-cell">
                    <span className="text-sm text-zinc-400">
                      {entry.stats.averagePace}
                    </span>
                  </td>

                  {/* Workouts (hidden on mobile/tablet) */}
                  <td className="hidden py-4 md:table-cell">
                    <span className="text-sm text-zinc-400">
                      {entry.stats.totalWorkouts} treinos
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
