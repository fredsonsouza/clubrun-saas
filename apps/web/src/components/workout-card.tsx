'use client'

import React from 'react'
import {
  Activity,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  ThumbsUp,
  Timer,
  Trash2,
  Edit2,
  Globe,
  Lock,
} from 'lucide-react'

// Tipagem baseada no seu Prisma Schema e retornos da API
export interface Workout {
  id: string
  title: string
  description?: string | null
  distance: number // em km
  durationInMinutes: number
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  author: {
    id: string
    name: string
    avatarUrl?: string | null
  }
}

interface WorkoutCardProps {
  workout: Workout
  currentUserId: string
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function WorkoutCard({
  workout,
  currentUserId,
  userRole,
  onDelete,
  onEdit,
}: WorkoutCardProps) {
  // Lógica de Permissão (Espelhando o CASL do Back-end)
  const isAuthor = currentUserId === workout.author.id
  const canModify = isAuthor || userRole === 'OWNER' || userRole === 'MANAGER' || userRole === 'ADMIN'

  // Cálculo de Pace
  const calculatePace = (dist: number, mins: number) => {
    if (dist <= 0) return '0:00'
    const paceDecimal = mins / dist
    const pMins = Math.floor(paceDecimal)
    const pSecs = Math.floor((paceDecimal - pMins) * 60)
    return `${pMins}:${pSecs.toString().padStart(2, '0')}`
  }

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <article className="shadow-soft-card group overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white transition-colors hover:border-orange-200">
      {/* CABEÇALHO DO TREINO */}
      <div className="flex items-start justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {workout.author.avatarUrl ? (
              <img
                src={workout.author.avatarUrl}
                alt={workout.author.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-gray-400">
                {workout.author.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {workout.author.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>
                {new Date(workout.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>•</span>
              {workout.visibility === 'PUBLIC' ? (
                <Globe className="h-3 w-3 text-gray-400" title="Público" />
              ) : (
                <Lock className="h-3 w-3 text-orange-500" title="Privado" />
              )}
            </div>
          </div>
        </div>

        {/* AÇÕES DE PERMISSÃO */}
        {canModify && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {isAuthor && onEdit && (
              <button
                onClick={() => onEdit(workout.id)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(workout.id)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className="px-5 pb-4">
        <h4 className="mb-1 text-lg font-extrabold text-gray-900">
          {workout.title}
        </h4>
        {workout.description && (
          <p className="text-sm leading-relaxed text-gray-600">
            {workout.description}
          </p>
        )}
      </div>

      {/* MÉTRICAS (Métricas com fonte tabular para não tremer) */}
      <div className="grid grid-cols-3 gap-4 px-5 pb-6">
        <div className="border-l-2 border-orange-500 pl-3">
          <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Distância
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-light tracking-tight text-gray-900">
              {workout.distance.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-gray-500">km</span>
          </div>
        </div>
        <div className="border-l-2 border-gray-100 pl-3">
          <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Pace Médio
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-light tracking-tight text-gray-900">
              {calculatePace(workout.distance, workout.durationInMinutes)}
            </span>
            <span className="text-xs font-bold text-gray-500">/km</span>
          </div>
        </div>
        <div className="border-l-2 border-gray-100 pl-3">
          <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Tempo
          </span>
          <span className="font-mono text-xl font-light tracking-tight text-gray-900">
            {formatDuration(workout.durationInMinutes)}
          </span>
        </div>
      </div>

      {/* FEEDBACK SOCIAL */}
      <div className="flex items-center gap-6 border-t border-gray-100 bg-gray-50 px-5 py-3">
        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-orange-500 cursor-pointer">
          <ThumbsUp className="h-4 w-4" /> Dar Kudos
        </button>
        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900 cursor-pointer">
          <MessageCircle className="h-4 w-4" /> Comentar
        </button>
      </div>
    </article>
  )
}
