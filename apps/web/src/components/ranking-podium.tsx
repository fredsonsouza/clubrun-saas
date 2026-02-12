'use client'

interface PodiumAthlete {
  id: string
  name: string
  avatarUrl: string | null
  metricValue: string
  metricLabel: string
}

interface RankingPodiumProps {
  first?: PodiumAthlete
  second?: PodiumAthlete
  third?: PodiumAthlete
  onAthleteClick?: (athleteId: string) => void
}

export function RankingPodium({
  first,
  second,
  third,
  onAthleteClick,
}: RankingPodiumProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const PodiumCard = ({
    athlete,
    position,
    medal,
    borderColor,
    bgColor,
    scale,
  }: {
    athlete?: PodiumAthlete
    position: number
    medal: string
    borderColor: string
    bgColor: string
    scale: string
  }) => {
    if (!athlete) return <div className="flex-1" />

    return (
      <div
        className={`group flex cursor-pointer flex-col items-center transition-all hover:scale-105 ${scale}`}
        onClick={() => onAthleteClick?.(athlete.id)}
      >
        <div
          className={`rounded-2xl border-2 p-6 text-center shadow-xl transition-all group-hover:shadow-2xl ${borderColor} ${bgColor}`}
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Medal */}
          <div className="mb-4 text-5xl">{medal}</div>

          {/* Avatar */}
          <div className="mb-4 flex justify-center">
            {athlete.avatarUrl ? (
              <img
                src={athlete.avatarUrl}
                alt={athlete.name}
                className={`h-20 w-20 rounded-full border-4 object-cover ${borderColor}`}
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full border-4 bg-orange-500/20 ${borderColor}`}
              >
                <span className="font-display text-2xl font-bold text-orange-500">
                  {getInitials(athlete.name)}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-heading mb-2 text-xl font-bold text-white">
            {athlete.name}
          </h3>

          {/* Metric */}
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${bgColor}`}
          >
            <span className="font-display text-2xl font-bold text-white">
              {athlete.metricValue}
            </span>
            <span className="text-sm text-zinc-400">{athlete.metricLabel}</span>
          </div>

          {/* Position Badge */}
          <div className="mt-4">
            <span className="text-sm font-medium text-zinc-400">
              {position}º Lugar
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl font-bold text-white">
          🏆 Pódio do Ranking
        </h2>
        <p className="mt-2 text-zinc-400">Top 3 atletas do período</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4">
        {/* 2nd Place */}
        <PodiumCard
          athlete={second}
          position={2}
          medal="🥈"
          borderColor="border-zinc-400"
          bgColor="bg-zinc-400/10"
          scale="scale-95"
        />

        {/* 1st Place */}
        <PodiumCard
          athlete={first}
          position={1}
          medal="🥇"
          borderColor="border-yellow-500"
          bgColor="bg-yellow-500/10"
          scale="scale-110"
        />

        {/* 3rd Place */}
        <PodiumCard
          athlete={third}
          position={3}
          medal="🥉"
          borderColor="border-amber-600"
          bgColor="bg-amber-600/10"
          scale="scale-90"
        />
      </div>
    </div>
  )
}
