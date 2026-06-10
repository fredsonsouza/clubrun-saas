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
  Calendar as CalendarIcon,
  AlertCircle,
  MoreVertical,
  Navigation,
  Smile,
} from 'lucide-react'
import { isBefore, isToday, startOfDay, parseISO } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toggleWorkoutReactionAction } from '@/app/(app)/[slug]/dashboard/actions'
import { toast } from 'sonner'
import { ShoeIcon } from '@/components/shoe-icon'

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
  date?: string
  notes?: string | null
  routeData?: any | null
  rescheduleCount?: number
  syncSource?: string | null
  stravaActivityId?: string | null
  targetDistance?: number | null
  targetDuration?: number | null
  author: {
    id: string
    name: string
    avatarUrl?: string | null
  }
  club: {
    name: string
    slug: string
    avatarUrl?: string | null
  }
  reactions?: Array<{
    type: string
    count: number
  }>
  currentUserReaction?: string | null
}

interface WorkoutCardProps {
  workout: Workout
  currentUserId: string
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
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

const REACTION_STYLES: Record<
  string,
  { label: string; emoji: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  LIKE: {
    label: 'Gostei',
    emoji: '👍',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50/80',
    borderClass: 'border-blue-100',
  },
  FIRE: {
    label: 'Sensacional',
    emoji: '🔥',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50/80',
    borderClass: 'border-orange-100',
  },
  CLAP: {
    label: 'Parabéns',
    emoji: '👏',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50/80',
    borderClass: 'border-amber-100',
  },
  TROPHY: {
    label: 'Vitória',
    emoji: '🏆',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50/80',
    borderClass: 'border-violet-100',
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
  const [showPicker, setShowPicker] = React.useState(false)
  const [isReacting, setIsReacting] = React.useState(false)

  const handleToggleReaction = async (type: 'LIKE' | 'FIRE' | 'CLAP' | 'TROPHY') => {
    if (isReacting) return
    setIsReacting(true)
    setShowPicker(false)
    try {
      const result = await toggleWorkoutReactionAction({
        slug: workout.club.slug,
        workoutId: workout.id,
        type,
      })
      if (!result.success) {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error('Erro ao processar reação.')
    } finally {
      setIsReacting(false)
    }
  }

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

  // Check if can complete today
  const workoutDate = startOfDay(new Date(dateStr))
  const today = startOfDay(new Date())
  const canComplete = isToday(workoutDate) || isBefore(workoutDate, today)

  return (
    <article className={`shadow-soft-card group relative overflow-hidden rounded-[1.5rem] border transition-all duration-300 ${isPlanned ? 'border-orange-200 bg-orange-50/10 hover:shadow-lg hover:shadow-orange-500/5' : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-gray-200/50'}`}>
      {/* BADGES DE STATUS (Canto superior direito) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isPlanned && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-white shadow-lg shadow-orange-500/20">
            <Target className="h-3 w-3" />
            Agenda
          </div>
        )}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase transition-all duration-300 group-hover:scale-105 ${config.bgColor} ${config.color} ${config.borderColor} shadow-sm`}
        >
          <Activity className="h-3 w-3" />
          {config.label}
        </div>
        
        {isPlanned && isAuthor && (
           <div className="flex items-center gap-1 ml-2">
             <button
               onClick={() => onEdit?.(workout.id)}
               title="Reagendar"
               className="p-1.5 rounded-lg bg-white/80 border border-orange-100 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
             >
               <CalendarIcon className="h-3.5 w-3.5" />
             </button>
             <button
               onClick={() => onDelete?.(workout.id)}
               title="Pular Treino"
               className="p-1.5 rounded-lg bg-white/80 border border-orange-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
             >
               <Trash2 className="h-3.5 w-3.5" />
             </button>
           </div>
        )}
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
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 group-hover/author:text-orange-500 transition-colors">
                {workout.author.name}
              </h3>
              {workout.rescheduleCount && workout.rescheduleCount > 0 && (
                <span className="rounded bg-orange-100 px-1 py-0.5 text-[8px] font-black text-orange-600 uppercase">
                  {workout.rescheduleCount}x Reagendado
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-orange-400" />
                {new Date(dateStr).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  ...(isPlanned ? {} : { hour: '2-digit', minute: '2-digit' })
                })}
              </span>
              <span>•</span>
              {workout.visibility === 'PUBLIC' ? (
                <span title="Público"><Globe className="h-3 w-3 text-gray-400" /></span>
              ) : (
                <span title="Privado"><Lock className="h-3 w-3 text-orange-500" /></span>
              )}
              {workout.syncSource === 'STRAVA' && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[8px] font-black text-orange-600 uppercase" title="Sincronizado via Strava">
                    <ShoeIcon className="h-2.5 w-2.5 text-orange-600" /> Strava
                  </span>
                </>
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

      {/* SEÇÃO METAS VS REALIZADO */}
      {!isPlanned && workout.targetDistance && (
        <div className="mx-5 mb-4 rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Desempenho vs Meta Prescrita
            </h5>
            {/* Badge de Conquista */}
            {(() => {
              const targetD = workout.targetDistance || 0
              const realD = distance
              const ratio = realD / targetD

              if (ratio >= 1.05) {
                return (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black text-blue-600 uppercase">
                    🏆 Superação
                  </span>
                )
              } else if (ratio >= 0.95 && ratio <= 1.05) {
                return (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-600 uppercase">
                    ⭐ Meta Batida
                  </span>
                )
              } else {
                return (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-600 uppercase">
                    ⚡ Meta Parcial
                  </span>
                )
              }
            })()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Distância</span>
              <p className="font-extrabold text-gray-800 mt-0.5">
                {distance.toFixed(2)} km <span className="font-normal text-gray-400">de {workout.targetDistance.toFixed(2)} km</span>
              </p>
              <span className="text-[10px] font-bold text-gray-500 block mt-0.5">
                ({Math.round((distance / (workout.targetDistance || 1)) * 100)}% concluído)
              </span>
            </div>

            {workout.targetDuration && (
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Ritmo (Pace)</span>
                {(() => {
                  const targetPaceVal = (workout.targetDuration || 0) / (workout.targetDistance || 1) / 60
                  const realPaceVal = duration / distance / 60
                  const diffSeconds = Math.round((realPaceVal - targetPaceVal) * 60)

                  const formatPaceVal = (val: number) => {
                    const mins = Math.floor(val)
                    const secs = Math.round((val - mins) * 60)
                    return `${mins}:${secs.toString().padStart(2, '0')}`
                  }

                  if (isNaN(diffSeconds)) {
                    return <p className="font-extrabold text-gray-800 mt-0.5">--</p>
                  }

                  return (
                    <>
                      <p className="font-extrabold text-gray-800 mt-0.5">
                        {formatPaceVal(realPaceVal)}/km <span className="font-normal text-gray-400">vs {formatPaceVal(targetPaceVal)}/km</span>
                      </p>
                      <span className={`text-[10px] font-bold block mt-0.5 ${diffSeconds < 0 ? 'text-emerald-600' : diffSeconds > 0 ? 'text-rose-500' : 'text-gray-500'}`}>
                        {diffSeconds < 0 ? `-${Math.abs(diffSeconds)}s/km mais rápido ⚡` : diffSeconds > 0 ? `+${diffSeconds}s/km mais lento` : 'No ritmo exato!'}
                      </span>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}

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
          {workout.routeData && (
            <button className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-wider hover:text-orange-700">
              <Navigation className="h-3 w-3" /> Ver Percurso
            </button>
          )}
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

      {/* BADGES DE REAÇÕES ACUMULADAS */}
      {!isPlanned && workout.reactions && workout.reactions.some(r => r.count > 0) && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-3">
          {workout.reactions
            .filter(r => r.count > 0)
            .map(r => {
              const style = REACTION_STYLES[r.type]
              if (!style) return null
              return (
                <div
                  key={r.type}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bgClass} ${style.colorClass} ${style.borderClass} shadow-sm`}
                >
                  <span>{style.emoji}</span>
                  <span className="font-mono text-xs">{r.count}</span>
                </div>
              )
            })}
        </div>
      )}

      {/* FEEDBACK SOCIAL OU BOTÃO DE FINALIZAR */}
      {isPlanned && isAuthor ? (
        <div className="flex flex-col gap-3 border-t border-orange-100 bg-orange-50 px-5 py-4">
          <button 
            onClick={() => onComplete?.(workout)}
            disabled={!canComplete}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
          >
            <CheckCircle2 className="h-4 w-4" />
            {canComplete ? 'FINALIZAR TREINO' : `DISPONÍVEL EM ${new Date(dateStr).toLocaleDateString('pt-BR')}`}
          </button>
          {!canComplete && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 justify-center">
              <AlertCircle className="h-3 w-3" />
              Você só poderá finalizar este treino na data agendada.
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-6 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <div
            className="relative"
            onMouseEnter={() => setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
          >
            {workout.currentUserReaction ? (
              (() => {
                const style = REACTION_STYLES[workout.currentUserReaction]
                if (!style) return null
                return (
                  <button
                    onClick={() => handleToggleReaction(workout.currentUserReaction as any)}
                    disabled={isReacting}
                    className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition-all duration-300 ${style.bgClass} ${style.colorClass} ${style.borderClass} shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50`}
                  >
                    <span>{style.emoji}</span>
                    <span>{style.label}</span>
                  </button>
                )
              })()
            ) : (
              <button
                onClick={() => setShowPicker(!showPicker)}
                disabled={isReacting}
                className="cursor-pointer flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-orange-500 rounded-full px-3 py-1 border border-transparent hover:bg-gray-100/50 active:scale-95 disabled:opacity-50"
              >
                <Smile className="h-4.5 w-4.5" />
                <span>Reagir</span>
              </button>
            )}

            {showPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                <div className="absolute bottom-full left-0 mb-2 z-50 flex items-center gap-2 rounded-full border border-gray-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {Object.entries(REACTION_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => handleToggleReaction(key as any)}
                      disabled={isReacting}
                      className="cursor-pointer text-xl transition-transform duration-200 hover:scale-125 active:scale-95 p-1 rounded-full hover:bg-gray-50 disabled:opacity-50"
                      title={style.label}
                    >
                      {style.emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
