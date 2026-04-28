'use client'

import React from 'react'
import Link from 'next/link'
import {
  Activity,
  MapPin,
  MessageCircle,
  ThumbsUp,
  Trash2,
  Edit2,
  Globe,
  Lock,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export type WorkoutType =
  | 'EASY'
  | 'INTERVAL'
  | 'TEMPO'
  | 'LONG'
  | 'RECOVERY'
  | 'RACE'
  | 'STRENGTH'
  | 'WALK'

// Tipagem baseada no seu Prisma Schema e retornos da API
export interface Workout {
  id: string
  title: string
  description?: string | null
  distance: number // em km
  durationInSeconds: number
  type: WorkoutType
  visibility: 'PUBLIC' | 'PRIVATE'
  status: 'PLANNED' | 'COMPLETED'
  assignmentMode?: 'GOAL' | 'FREE' | null
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
  onComplete?: (workout: Workout) => void
}

export const TYPE_CONFIG: Record<
  WorkoutType,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  EASY: {
    label: 'Rodagem Leve',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
  },
  INTERVAL: {
    label: 'Intervalado',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
  },
  TEMPO: {
    label: 'Ritmo / Tempo',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
  },
  LONG: {
    label: 'Longão',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
  },
  RECOVERY: {
    label: 'Regenerativo',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100',
  },
  RACE: {
    label: 'Prova / Race',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
  },
  STRENGTH: {
    label: 'Fortalecimento',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-100',
  },
  WALK: {
    label: 'Caminhada',
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-100',
  },
}

import { CheckCircle2, Target } from 'lucide-react'

export function WorkoutCard({
  workout,
  currentUserId,
  userRole,
  onDelete,
  onEdit,
  onComplete,
}: WorkoutCardProps) {
  // Lógica de Permissão (Espelhando o CASL do Back-end)
  const isAuthor = currentUserId === workout.author.id
  const canModify =
    isAuthor ||
    userRole === 'OWNER' ||
    userRole === 'MANAGER' ||
    userRole === 'ADMIN'

  const isPlanned = workout.status === 'PLANNED'

  // Cálculo de Pace (dist em km, secs em segundos)
  const calculatePace = (dist: number, totalSeconds: number) => {
    const d = Number(dist) || 0
    const s = Number(totalSeconds) || 0
    
    if (d <= 0 || s <= 0) return '0:00'
    const paceInSeconds = s / d
    
    if (isNaN(paceInSeconds)) return '0:00'
    
    const pMins = Math.floor(paceInSeconds / 60)
    const pSecs = Math.floor(paceInSeconds % 60)
    return `${pMins}:${pSecs.toString().padStart(2, '0')}`
  }

  const formatDuration = (totalSeconds: number) => {
    const sRaw = Number(totalSeconds) || 0
    if (sRaw === 0 && isPlanned) return 'Livre'

    const h = Math.floor(sRaw / 3600)
    const m = Math.floor((sRaw % 3600) / 60)
    const s = Math.floor(sRaw % 60)
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`
    }
    return `${m}m ${s}s`
  }

  // Fallbacks defensivos para garantir que os dados existam mesmo se o mapeamento falhar
  const distance = Number(workout.distance) || 0
  const duration = Number(workout.durationInSeconds ?? (workout as any).duration) || 0
  const dateStr = workout.createdAt ?? (workout as any).date ?? new Date().toISOString()

  const config = TYPE_CONFIG[workout.type] || TYPE_CONFIG.EASY

  return (
    <article className={`shadow-soft-card group relative overflow-hidden rounded-[1.5rem] border transition-colors ${isPlanned ? 'border-orange-200 bg-orange-50/10' : 'border-gray-100 bg-white hover:border-orange-200'}`}>
      {/* BADGES DE STATUS (Canto superior direito) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isPlanned && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-white shadow-lg shadow-orange-500/20">
            <Target className="h-3 w-3" />
            Prescrito
          </div>
        )}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase transition-all duration-300 group-hover:scale-105 ${config.bgColor} ${config.color} ${config.borderColor} shadow-sm`}
        >
          <Activity className="h-3 w-3" />
          {config.label}
        </div>
      </div>

      {/* CABEÇALHO DO TREINO */}
      <div className="flex items-start justify-between p-5">
        <Link 
          href={`/profile/${workout.author.id}`}
          className="cursor-pointer group/author flex items-center gap-3"
        >
          <Avatar className="h-10 w-10 shrink-0 border border-gray-200 transition-transform group-hover/author:scale-105">
            <AvatarImage src={workout.author.avatarUrl || ''} className="object-cover" />
            <AvatarFallback className="text-sm font-bold text-gray-400">
              {workout.author.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-gray-900 group-hover/author:text-orange-500 transition-colors">
              {workout.author.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>
                {new Date(dateStr).toLocaleDateString('pt-BR', {
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
        </Link>

        {/* AÇÕES DE PERMISSÃO */}
        {canModify && !isPlanned && (
          <div className="mr-32 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {isAuthor && onEdit && (
              <button
                onClick={() => onEdit(workout.id)}
                className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(workout.id)}
                className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
        {(workout.description || (workout as any).notes) && (
          <p className="text-sm leading-relaxed text-gray-600">
            {workout.description || (workout as any).notes}
          </p>
        )}
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-3 gap-4 px-5 pb-6">
        <div className="border-l-2 border-orange-500 pl-3">
          <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            {isPlanned ? 'Distância Sugerida' : 'Distância'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-light tracking-tight text-gray-900">
              {distance.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-gray-500">km</span>
          </div>
        </div>
        <div className="border-l-2 border-gray-100 pl-3">
          <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            {isPlanned ? 'Pace Alvo' : 'Pace Médio'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-light tracking-tight text-gray-900">
              {calculatePace(distance, duration)}
            </span>
            <span className="text-xs font-bold text-gray-500">/km</span>
          </div>
        </div>
        <div className="border-l-2 border-gray-100 pl-3">
          <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            {isPlanned ? 'Tempo Alvo' : 'Tempo'}
          </span>
          <span className="font-mono text-xl font-light tracking-tight text-gray-900">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* FEEDBACK SOCIAL OU BOTÃO DE FINALIZAR */}
      {isPlanned && isAuthor ? (
        <div className="flex items-center gap-3 border-t border-orange-100 bg-orange-50 px-5 py-4">
          <button 
            onClick={() => onComplete?.(workout)}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            FINALIZAR TREINO
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button className="cursor-pointer flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-orange-500">
            <ThumbsUp className="h-4 w-4" /> Dar Kudos
          </button>
          <button className="cursor-pointer flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900">
            <MessageCircle className="h-4 w-4" /> Comentar
          </button>
        </div>
      )}
    </article>
  )
}
