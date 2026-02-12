'use client'

import { Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Input } from './ui/input'

interface WorkoutFiltersProps {
  onTypeChange?: (type: string) => void
  onAthleteChange?: (athleteId: string) => void
  onPeriodChange?: (period: string) => void
  onSearchChange?: (search: string) => void
  showAthleteFilter?: boolean
}

export function WorkoutFilters({
  onTypeChange,
  onAthleteChange,
  onPeriodChange,
  onSearchChange,
  showAthleteFilter = false,
}: WorkoutFiltersProps) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Dropdowns */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Tipo de Treino */}
          <Select onValueChange={onTypeChange}>
            <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 sm:w-[180px]">
              <SelectValue placeholder="Tipo de treino" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="run">Rodagem</SelectItem>
              <SelectItem value="long-run">Longão</SelectItem>
              <SelectItem value="interval">Intervalado</SelectItem>
              <SelectItem value="recovery">Recuperação</SelectItem>
              <SelectItem value="tempo">Tempo</SelectItem>
              <SelectItem value="race">Corrida</SelectItem>
            </SelectContent>
          </Select>

          {/* Atleta (apenas para owner/coach) */}
          {showAthleteFilter && (
            <Select onValueChange={onAthleteChange}>
              <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 sm:w-[180px]">
                <SelectValue placeholder="Atleta" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-950">
                <SelectItem value="all">Todos atletas</SelectItem>
                <SelectItem value="1">João Silva</SelectItem>
                <SelectItem value="2">Maria Santos</SelectItem>
                <SelectItem value="3">Pedro Alves</SelectItem>
                <SelectItem value="4">Ana Costa</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Período */}
          <Select onValueChange={onPeriodChange} defaultValue="all">
            <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950">
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Search */}
        <div className="relative w-full lg:w-auto">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Buscar treinos..."
            className="w-full border-zinc-700 bg-zinc-900 pl-10 lg:w-[250px]"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
