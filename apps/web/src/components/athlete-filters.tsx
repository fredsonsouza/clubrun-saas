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

interface AthleteFiltersProps {
  onStatusChange?: (status: string) => void
  onSearchChange?: (search: string) => void
}

export function AthleteFilters({
  onStatusChange,
  onSearchChange,
}: AthleteFiltersProps) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Status Filter */}
        <div className="flex items-center gap-3">
          <Select onValueChange={onStatusChange} defaultValue="all">
            <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Buscar atleta..."
            className="w-full border-zinc-700 bg-zinc-900 pl-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:w-[250px]"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
