'use client'

import { Activity, MapPin, TrendingUp, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface AthleteCardProps {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
  status: 'active' | 'inactive'
  stats: {
    totalWorkouts: number
    totalDistance: number
    averagePace: string
  }
  onViewProfile?: (id: string) => void
}

const roleConfig = {
  OWNER: {
    label: 'Proprietário',
    badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: '👑',
  },
  ADMIN: {
    label: 'Administrador',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: '⚡',
  },
  COACH: {
    label: 'Coach',
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: '🎯',
  },
  MEMBER: {
    label: 'Atleta',
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: '🏃',
  },
  BILLING: {
    label: 'Financeiro',
    badge: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: '💳',
  },
}

export function AthleteCard({
  id,
  name,
  email,
  avatarUrl,
  role,
  status,
  stats,
  onViewProfile,
}: AthleteCardProps) {
  const config = roleConfig[role]
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      className={`group cursor-pointer rounded-2xl border p-6 transition-all hover:scale-[1.02] hover:border-orange-500/50 ${
        status === 'active'
          ? 'border-zinc-800 bg-zinc-900/70'
          : 'border-zinc-800/50 bg-zinc-900/30 opacity-60'
      }`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={() => onViewProfile?.(id)}
    >
      {/* Header: Avatar + Name + Status */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-12 w-12 rounded-full border-2 border-zinc-800 object-cover"
            />
          ) : (
            <div className="font-display flex h-12 w-12 items-center justify-center rounded-full border-2 border-zinc-800 bg-orange-500/20 text-lg font-bold text-orange-500">
              {initials}
            </div>
          )}

          {/* Name + Email */}
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              {name}
            </h3>
            <p className="text-sm text-zinc-500">{email}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2 w-2 rounded-full ${
              status === 'active' ? 'bg-green-500' : 'bg-zinc-600'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              status === 'active' ? 'text-green-500' : 'text-zinc-600'
            }`}
          >
            {status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}
        >
          <span>{config.icon}</span>
          {config.label}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-4 space-y-2">
        <p className="text-xs font-medium text-zinc-400">Stats do Mês</p>
        <div className="space-y-2">
          {/* Treinos */}
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-zinc-500" />
            <span className="font-medium text-white">
              {stats.totalWorkouts}
            </span>
            <span className="text-zinc-500">treinos</span>
          </div>

          {/* Distância */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <span className="font-medium text-white">
              {stats.totalDistance}
            </span>
            <span className="text-zinc-500">km</span>
          </div>

          {/* Pace */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-zinc-500" />
            <span className="font-medium text-white">{stats.averagePace}</span>
            <span className="text-zinc-500">pace médio</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="ghost"
        className="w-full justify-between text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
        onClick={(e) => {
          e.stopPropagation()
          onViewProfile?.(id)
        }}
      >
        Ver Perfil Completo
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
