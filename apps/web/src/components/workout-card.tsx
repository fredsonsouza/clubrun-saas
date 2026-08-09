'use client'

import { setWorkoutReactionAction } from '@/app/(app)/[slug]/dashboard/actions'
import { ShoeIcon } from '@/components/shoe-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { isBefore, isToday, parseISO, startOfDay } from 'date-fns'
import {
  Activity,
  AlertCircle,
  Calendar as CalendarIcon,
  Edit2,
  Globe,
  Lock,
  MapPin,
  MessageCircle,
  MoreVertical,
  Navigation,
  Smile,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'
import { RouteViewModal } from './route-view-modal'

function formatKm(km: number): string {
  const formatted =
    km % 1 === 0 ? km.toFixed(0) : km.toFixed(2).replace(/0+$/, '')
  return formatted.replace('.', ',')
}

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
  visibility: 'PUBLIC' | 'COACH_ONLY' | 'PRIVATE'
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
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
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
  {
    label: string
    emoji: string
    colorClass: string
    bgClass: string
    borderClass: string
  }
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
  const [isRouteOpen, setIsRouteOpen] = React.useState(false)

  const handleSetReaction = async (
    type: 'LIKE' | 'FIRE' | 'CLAP' | 'TROPHY'
  ) => {
    if (isReacting) return
    setIsReacting(true)
    setShowPicker(false)
    try {
      const result = await setWorkoutReactionAction({
        slug: workout.club.slug,
        workoutId: workout.id,
        type: workout.currentUserReaction === type ? null : type,
      })
      if (!result.success) {
        toast.error(result.message)
      }
    } catch (_err) {
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

    if (Number.isNaN(paceInSeconds)) return '0:00'

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
  const duration =
    Number(workout.durationInSeconds ?? (workout as any).duration) || 0
  const dateStr =
    workout.createdAt ?? (workout as any).date ?? new Date().toISOString()

  const config = TYPE_CONFIG[workout.type] || TYPE_CONFIG.EASY

  // Check if can complete today
  const workoutDate = startOfDay(new Date(dateStr))
  const today = startOfDay(new Date())
  const canComplete = isToday(workoutDate) || isBefore(workoutDate, today)

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] border shadow-soft-card transition-all duration-300 ${isPlanned ? 'border-orange-200 bg-orange-50/10 hover:shadow-lg hover:shadow-orange-500/5' : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-gray-200/50 hover:shadow-xl'}`}
    >
      {/* BADGES DE STATUS (Canto superior direito) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isPlanned && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-2.5 py-1 font-black text-[10px] text-white uppercase tracking-wider shadow-lg shadow-orange-500/20">
            <Target className="h-3 w-3" />
            Agenda
          </div>
        )}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-black text-[10px] uppercase tracking-wider transition-all duration-300 group-hover:scale-105 ${config.bgColor} ${config.color} ${config.borderColor} shadow-sm`}
        >
          <Activity className="h-3 w-3" />
          {config.label}
        </div>

        {isPlanned && isAuthor && (
          <div className="ml-2 flex items-center gap-1">
            <button
              onClick={() => onEdit?.(workout.id)}
              title="Reagendar"
              className="rounded-lg border border-orange-100 bg-white/80 p-1.5 text-orange-500 shadow-sm transition-all hover:bg-orange-500 hover:text-white"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete?.(workout.id)}
              title="Pular Treino"
              className="rounded-lg border border-orange-100 bg-white/80 p-1.5 text-gray-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-500"
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
          className="group/author flex cursor-pointer items-center gap-3"
        >
          <Avatar className="h-10 w-10 shrink-0 border border-gray-200 transition-transform group-hover/author:scale-105">
            <AvatarImage
              src={workout.author.avatarUrl || ''}
              className="object-cover"
            />
            <AvatarFallback className="font-bold text-gray-400 text-sm">
              {workout.author.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm transition-colors group-hover/author:text-orange-500">
                {workout.author.name}
              </h3>
              {workout.rescheduleCount && workout.rescheduleCount > 0 && (
                <span className="rounded bg-orange-100 px-1 py-0.5 font-black text-[8px] text-orange-600 uppercase">
                  {workout.rescheduleCount}x Reagendado
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-medium text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-orange-400" />
                {new Date(dateStr).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  ...(isPlanned ? {} : { hour: '2-digit', minute: '2-digit' }),
                })}
              </span>
              <span>•</span>
              {workout.visibility === 'PUBLIC' ? (
                <span title="Público">
                  <Globe className="h-3 w-3 text-gray-400" />
                </span>
              ) : (
                <span title="Privado">
                  <Lock className="h-3 w-3 text-orange-500" />
                </span>
              )}
              {workout.syncSource === 'STRAVA' && (
                <>
                  <span>•</span>
                  <span
                    className="flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 font-black text-[8px] text-orange-600 uppercase"
                    title="Sincronizado via Strava"
                  >
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
        <h4 className="mb-1 font-extrabold text-gray-900 text-lg">
          {workout.title}
        </h4>
        {(workout.description || (workout as any).notes) && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {workout.description || (workout as any).notes}
          </p>
        )}
      </div>

      {/* SEÇÃO METAS VS REALIZADO */}
      {!isPlanned && workout.targetDistance && (
        <div className="mx-5 mb-4 space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-[10px] text-gray-400 uppercase tracking-wider">
              Desempenho vs Meta Prescrita
            </h5>
            {/* Badge de Conquista */}
            {(() => {
              const targetD = workout.targetDistance || 0
              const realD = distance
              const ratio = realD / targetD

              if (ratio >= 1.05) {
                return (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-black text-[9px] text-blue-600 uppercase">
                    🏆 Superação
                  </span>
                )
              }
              if (ratio >= 0.95 && ratio <= 1.05) {
                return (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-black text-[9px] text-emerald-600 uppercase">
                    ⭐ Meta Batida
                  </span>
                )
              }
              return (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-black text-[9px] text-amber-600 uppercase">
                  ⚡ Meta Parcial
                </span>
              )
            })()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-bold text-[10px] text-gray-400 uppercase">
                Distância
              </span>
              <p className="mt-0.5 font-extrabold text-gray-800">
                {formatKm(distance)} km{' '}
                <span className="font-normal text-gray-400">
                  de {formatKm(workout.targetDistance)} km
                </span>
              </p>
              <span className="mt-0.5 block font-bold text-[10px] text-gray-500">
                ({Math.round((distance / (workout.targetDistance || 1)) * 100)}%
                concluído)
              </span>
            </div>

            {workout.targetDuration && (
              <div>
                <span className="block font-bold text-[10px] text-gray-400 uppercase">
                  Ritmo (Pace)
                </span>
                {(() => {
                  const targetPaceVal =
                    (workout.targetDuration || 0) /
                    (workout.targetDistance || 1) /
                    60
                  const realPaceVal = duration / distance / 60
                  const diffSeconds = Math.round(
                    (realPaceVal - targetPaceVal) * 60
                  )

                  const formatPaceVal = (val: number) => {
                    const mins = Math.floor(val)
                    const secs = Math.round((val - mins) * 60)
                    return `${mins}:${secs.toString().padStart(2, '0')}`
                  }

                  if (Number.isNaN(diffSeconds)) {
                    return (
                      <p className="mt-0.5 font-extrabold text-gray-800">--</p>
                    )
                  }

                  return (
                    <>
                      <p className="mt-0.5 font-extrabold text-gray-800">
                        {formatPaceVal(realPaceVal)}/km{' '}
                        <span className="font-normal text-gray-400">
                          vs {formatPaceVal(targetPaceVal)}/km
                        </span>
                      </p>
                      <span
                        className={`mt-0.5 block font-bold text-[10px] ${diffSeconds < 0 ? 'text-emerald-600' : diffSeconds > 0 ? 'text-rose-500' : 'text-gray-500'}`}
                      >
                        {diffSeconds < 0
                          ? `-${Math.abs(diffSeconds)}s/km mais rápido ⚡`
                          : diffSeconds > 0
                            ? `+${diffSeconds}s/km mais lento`
                            : 'No ritmo exato!'}
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
      <div className="grid grid-cols-3 gap-2 px-3 pb-6 sm:px-5">
        <div className="border-orange-500 border-l-2 pl-2 sm:pl-3">
          <span className="block truncate font-bold text-[8px] text-gray-400 uppercase tracking-wider sm:text-[10px]">
            {isPlanned ? 'Dist. Sugerida' : 'Distância'}
          </span>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="font-light font-mono text-2xl text-gray-900 tracking-tight sm:text-3xl">
              {formatKm(distance)}
            </span>
            <span className="font-bold text-gray-500 text-xs sm:text-sm">
              km
            </span>
          </div>
          {workout.routeData && (
            <button
              type="button"
              onClick={() => setIsRouteOpen(true)}
              className="mt-2 flex cursor-pointer items-center gap-1 font-black text-[8px] text-orange-600 uppercase tracking-wider hover:text-orange-700 sm:text-[10px]"
            >
              <Navigation className="h-2.5 w-2.5" /> Rota
            </button>
          )}
        </div>
        <div className="border-gray-100 border-l-2 pl-2 sm:pl-3">
          <span className="block truncate font-bold text-[8px] text-gray-400 uppercase tracking-wider sm:text-[10px]">
            {isPlanned ? 'Pace Alvo' : 'Pace Médio'}
          </span>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="font-light font-mono text-gray-900 text-xl tracking-tight sm:text-2xl">
              {calculatePace(distance, duration)}
            </span>
            <span className="font-bold text-[10px] text-gray-500 sm:text-xs">
              /km
            </span>
          </div>
        </div>
        <div className="border-gray-100 border-l-2 pl-2 sm:pl-3">
          <span className="block truncate font-bold text-[8px] text-gray-400 uppercase tracking-wider sm:text-[10px]">
            {isPlanned ? 'Tempo Alvo' : 'Tempo'}
          </span>
          <span className="mt-1 block font-light font-mono text-gray-900 text-lg tracking-tight sm:text-xl">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* BADGES DE REAÇÕES ACUMULADAS */}
      {!isPlanned &&
        workout.reactions &&
        workout.reactions.some((r) => r.count > 0) && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {workout.reactions
              .filter((r) => r.count > 0)
              .map((r) => {
                const style = REACTION_STYLES[r.type]
                if (!style) return null
                return (
                  <div
                    key={r.type}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold text-xs ${style.bgClass} ${style.colorClass} ${style.borderClass} shadow-sm`}
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
        <div className="flex flex-col gap-3 border-orange-100 border-t bg-orange-50 px-5 py-4">
          <button
            onClick={() => onComplete?.(workout)}
            disabled={!canComplete}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-black text-sm text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:bg-gray-400 disabled:opacity-50 disabled:shadow-none"
          >
            <CheckCircle2 className="h-4 w-4" />
            {canComplete
              ? 'FINALIZAR TREINO'
              : `DISPONÍVEL EM ${new Date(dateStr).toLocaleDateString('pt-BR')}`}
          </button>
          {!canComplete && (
            <div className="flex items-center justify-center gap-2 font-bold text-[10px] text-orange-400">
              <AlertCircle className="h-3 w-3" />
              Você só poderá finalizar este treino na data agendada.
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-6 border-gray-100 border-t bg-gray-50 px-5 py-3">
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
                    onClick={() =>
                      handleSetReaction(workout.currentUserReaction as any)
                    }
                    disabled={isReacting}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-bold text-sm transition-all duration-300 ${style.bgClass} ${style.colorClass} ${style.borderClass} shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50`}
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
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-transparent px-3 py-1 font-bold text-gray-500 text-sm transition-colors hover:bg-gray-100/50 hover:text-orange-500 active:scale-95 disabled:opacity-50"
              >
                <Smile className="h-4.5 w-4.5" />
                <span>Reagir</span>
              </button>
            )}

            {showPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPicker(false)}
                />
                <div className="fade-in slide-in-from-bottom-2 absolute bottom-full left-0 z-50 mb-2 flex animate-in items-center gap-2 rounded-full border border-gray-100 bg-white p-1.5 shadow-xl duration-200">
                  {Object.entries(REACTION_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => handleSetReaction(key as any)}
                      disabled={isReacting}
                      className="cursor-pointer rounded-full p-1 text-xl transition-transform duration-200 hover:scale-125 hover:bg-gray-50 active:scale-95 disabled:opacity-50"
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
      {workout.routeData && (
        <RouteViewModal
          isOpen={isRouteOpen}
          onClose={() => setIsRouteOpen(false)}
          routeData={workout.routeData}
          title={workout.title}
        />
      )}
    </article>
  )
}
