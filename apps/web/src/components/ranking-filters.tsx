'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface RankingFiltersProps {
  onPeriodChange?: (period: string) => void
  onMetricChange?: (metric: string) => void
}

export function RankingFilters({
  onPeriodChange,
  onMetricChange,
}: RankingFiltersProps) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Período */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-zinc-400">Período:</label>
          <Select onValueChange={onPeriodChange} defaultValue="month">
            <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950">
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="all">Histórico Completo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Métrica */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-zinc-400">Métrica:</label>
          <Select onValueChange={onMetricChange} defaultValue="distance">
            <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:w-[180px]">
              <SelectValue placeholder="Selecione a métrica" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950">
              <SelectItem value="distance">Distância (km)</SelectItem>
              <SelectItem value="workouts">Quantidade de Treinos</SelectItem>
              <SelectItem value="pace">Melhor Pace</SelectItem>
              <SelectItem value="streak">Maior Sequência</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
