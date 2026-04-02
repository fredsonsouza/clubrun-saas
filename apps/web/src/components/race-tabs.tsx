'use client'

interface RaceTabsProps {
  activeTab: 'upcoming' | 'past' | 'mine'
  onTabChange: (tab: 'upcoming' | 'past' | 'mine') => void
  counts?: {
    upcoming: number
    past: number
    mine: number
  }
}

export function RaceTabs({ activeTab, onTabChange, counts }: RaceTabsProps) {
  const tabs = [
    { id: 'upcoming' as const, label: 'Próximas', count: counts?.upcoming },
    { id: 'past' as const, label: 'Passadas', count: counts?.past },
    { id: 'mine' as const, label: 'Minhas', count: counts?.mine },
  ]

  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-1 cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
