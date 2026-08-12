'use client'

import { completeWorkoutAction } from '@/app/(app)/profile/actions'
import { getCurrentAthleteProfileAction } from '@/app/private-actions'
import { ShoeIcon } from '@/components/shoe-icon'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Target,
  Timer,
  X,
} from 'lucide-react'
import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import type { Workout } from './workout-card'

interface CompleteWorkoutModalProps {
  isOpen: boolean
  workout: Workout | null
  onClose: () => void
  onSuccess?: () => void
  isStravaConnected?: boolean
}

export function CompleteWorkoutModal({
  isOpen,
  workout,
  onClose,
  onSuccess,
  isStravaConnected = false,
}: CompleteWorkoutModalProps) {
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showStravaActivities, setShowStravaActivities] = useState(false)
  const [selectedStravaActivityId, setSelectedStravaActivityId] = useState<
    string | null
  >(null)

  const mockStravaActivities = [
    {
      id: 'strava-act-1',
      name: 'Corrida de Ritmo (Tempo Run)',
      distance: 8.0,
      durationStr: '38:40',
      date: 'Hoje',
    },
    {
      id: 'strava-act-2',
      name: 'Treino Regenerativo',
      distance: 5.2,
      durationStr: '26:10',
      date: 'Ontem',
    },
    {
      id: 'strava-act-3',
      name: 'Longão do Fim de Semana',
      distance: 12.0,
      durationStr: '65:12',
      date: 'Há 2 dias',
    },
  ]

  const formatDuration = (totalSeconds: number) => {
    const sRaw = Number(totalSeconds) || 0
    const h = Math.floor(sRaw / 3600)
    const m = Math.floor((sRaw % 3600) / 60)
    const s = Math.floor(sRaw % 60)
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}m ${s}s`
  }

  const formatSecondsToTime = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return ''
    const mins = Math.floor(totalSeconds / 60)
    const rawSecs = totalSeconds % 60
    const secs = Math.floor(rawSecs)
    const centis = Math.round((rawSecs - secs) * 100)
    if (centis > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}:${centis.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize with workout values if it's a GOAL
  React.useEffect(() => {
    if (workout) {
      setDistance(workout.distance.toString())
      setDuration(formatSecondsToTime(workout.durationInSeconds))
      setSelectedStravaActivityId(null)
      setShowStravaActivities(false)
    }
  }, [workout])

  const [athleteProfile, setAthleteProfile] = useState<any>(null)

  React.useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          const athleteProfile = await getCurrentAthleteProfileAction()
          setAthleteProfile(athleteProfile)
        } catch (error) {
          console.error('Erro ao buscar perfil:', error)
        }
      }
      fetchProfile()
    }
  }, [isOpen])

  const isDistanceInvalid = useMemo(() => {
    if (!athleteProfile?.shoes || !distance) return false
    const d = Number.parseFloat(distance) || 0
    const remaining = athleteProfile.shoesRemainingDistance ?? 0
    return d > remaining
  }, [athleteProfile, distance])

  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) {
      // Format MM:SS:CC (minutes:seconds:centiseconds)
      return (parts[0] || 0) * 60 + (parts[1] || 0) + (parts[2] || 0) / 100
    }
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0)
    }
    return (parts[0] || 0) * 60
  }

  const pace = useMemo(() => {
    const d = Number.parseFloat(distance) || 0
    const totalSeconds = timeToSeconds(duration)
    if (d <= 0 || totalSeconds <= 0) return '0:00'
    const paceInSeconds = Math.round(totalSeconds / d)
    const mins = Math.floor(paceInSeconds / 60)
    const secs = paceInSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [distance, duration])

  if (!isOpen || !workout) return null

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '')
    const digits = val.replace(/\D/g, '')
    if (digits.length > 2 && digits.length <= 4) {
      val = `${digits.slice(0, 2)}:${digits.slice(2)}`
    } else if (digits.length > 4) {
      val = `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`
    }
    setDuration(val)
  }

  const handleSelectStravaActivity = (
    act: (typeof mockStravaActivities)[0]
  ) => {
    setDistance(act.distance.toString())
    setDuration(act.durationStr)
    setSelectedStravaActivityId(act.id)
    setShowStravaActivities(false)
    toast.success('Atividade importada do Strava com sucesso!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (athleteProfile?.shoes) {
      const remaining = athleteProfile.shoesRemainingDistance ?? 0
      const d = Number.parseFloat(distance) || 0
      if (d > remaining) {
        toast.error(
          'A distância informada excede a quilometragem restante do tênis!'
        )
        setIsLoading(false)
        return
      }
    }

    const totalSeconds = timeToSeconds(duration)
    const d = Number.parseFloat(distance) || 0
    const paceValue = d > 0 ? totalSeconds / d / 60 : 0

    const formData = new FormData()
    formData.append('slug', workout.club.slug)
    formData.append('workoutId', workout.id)
    formData.append('distance', distance)
    formData.append('duration', totalSeconds.toString())
    formData.append('pace', paceValue.toString())
    if (selectedStravaActivityId) {
      formData.append('stravaActivityId', selectedStravaActivityId)
      formData.append('syncSource', 'STRAVA')
    }

    const result = await completeWorkoutAction(formData)

    if (result.success) {
      toast.success(result.message)
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center p-4 duration-200">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="zoom-in-95 relative w-full max-w-md animate-in overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-gray-100 border-b px-6 py-5">
          <h2 className="flex items-center gap-2 font-black text-gray-900 text-xl">
            <CheckCircle2 className="h-5 w-5 text-orange-500" />
            Finalizar Treino
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
            <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-orange-500/5 blur-xl" />
            <h4 className="mb-2 flex items-center gap-2 font-black text-[10px] text-orange-600 uppercase tracking-[0.2em]">
              <Target className="h-3 w-3" /> Meta do Treinador
            </h4>
            <p className="font-black text-base text-gray-900 leading-tight">
              {workout.title}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-gray-400 uppercase">
                  Distância
                </span>
                <span className="font-black text-gray-700 text-sm">
                  {workout.distance}km
                </span>
              </div>
              <div className="h-6 w-px bg-orange-200/50" />
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-gray-400 uppercase">
                  Tempo Sugerido
                </span>
                <span className="font-black text-gray-700 text-sm">
                  {workout.durationInSeconds > 0
                    ? formatDuration(workout.durationInSeconds)
                    : 'Livre'}
                </span>
              </div>
            </div>
          </div>

          {isStravaConnected && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowStravaActivities(!showStravaActivities)}
                className="flex w-full items-center justify-between gap-2 rounded-2xl bg-orange-50 px-5 py-3.5 font-black text-orange-600 text-xs transition-colors hover:bg-orange-100"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-3.828L8.375 6.056 6.287 10.172H9.333m5.549-4.116L12.06 0l-5.12 10.172h3.066" />
                  </svg>
                  IMPORTAR DO STRAVA
                </span>
                <span className="font-medium text-[10px] opacity-80">
                  {showStravaActivities ? 'Fechar ▲' : 'Selecionar atividade ▼'}
                </span>
              </button>

              {showStravaActivities && (
                <div className="slide-in-from-top-2 animate-in space-y-1.5 rounded-2xl border border-gray-100 bg-gray-50/50 p-2 duration-200">
                  {mockStravaActivities.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleSelectStravaActivity(act)}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-left transition-all hover:border-orange-200 hover:bg-orange-50/20 active:scale-99"
                    >
                      <div>
                        <p className="font-extrabold text-gray-800 text-xs">
                          {act.name}
                        </p>
                        <p className="font-bold text-[10px] text-gray-400">
                          {act.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-orange-600 text-sm">
                          {act.distance.toFixed(2)} km
                        </p>
                        <p className="font-bold font-mono text-[10px] text-gray-500">
                          {act.durationStr}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                <Activity className="h-3.5 w-3.5 text-orange-500" /> Distância
                Real
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pr-12 pl-5 font-bold font-mono text-gray-900 text-xl shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
                <span className="-translate-y-1/2 absolute top-1/2 right-5 font-bold text-gray-400">
                  km
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                <Timer className="h-3.5 w-3.5 text-orange-500" /> Tempo Real
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="00:00"
                  value={duration}
                  onChange={handleDurationChange}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold font-mono text-gray-900 text-xl shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>
          </div>

          {/* Informações do Tênis */}
          {athleteProfile?.shoes && (
            <div
              className={`space-y-2 rounded-2xl border p-4 font-semibold text-xs ${
                athleteProfile.shoesRemainingDistance <= 42
                  ? 'border-red-100 bg-red-50/50 text-red-700'
                  : 'border-orange-100 bg-orange-50/30 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShoeIcon
                    className={`h-4 w-4 shrink-0 ${athleteProfile.shoesRemainingDistance <= 42 ? 'text-red-500' : 'text-orange-500'}`}
                  />
                  <span
                    className="max-w-[180px] truncate font-bold"
                    title={athleteProfile.shoes}
                  >
                    {athleteProfile.shoes}
                  </span>
                </span>
                <span>
                  Vida útil do tênis:{' '}
                  <strong
                    className={
                      athleteProfile.shoesRemainingDistance <= 42
                        ? 'font-extrabold text-red-600'
                        : 'text-gray-900'
                    }
                  >
                    {athleteProfile.shoesRemainingDistance !== null &&
                    athleteProfile.shoesRemainingDistance !== undefined
                      ? `${athleteProfile.shoesRemainingDistance.toFixed(1)} km`
                      : '0 km'}
                  </strong>
                </span>
              </div>

              {athleteProfile.shoesRemainingDistance <= 42 && (
                <div className="flex items-center gap-1 font-bold text-[10px] text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Atenção: Vida útil próxima do fim! Recomendamos a troca.
                  </span>
                </div>
              )}

              {isDistanceInvalid && (
                <div className="mt-1 flex items-center gap-1 font-bold text-[10px] text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    A distância informada ({Number.parseFloat(distance)} km) é
                    maior que a restante do tênis (
                    {athleteProfile.shoesRemainingDistance?.toFixed(1)} km)!
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <div className="flex flex-col">
              <span className="font-black text-[10px] text-orange-600 uppercase tracking-widest">
                Pace Médio Final
              </span>
              <p className="font-medium text-orange-400 text-xs">
                Calculado automaticamente
              </p>
            </div>
            <div className="flex items-baseline gap-1 text-orange-600">
              <span className="font-black font-mono text-3xl">{pace}</span>
              <span className="font-bold text-sm opacity-70">/km</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isDistanceInvalid}
            className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-orange-500 font-black text-white shadow-orange-500/20 shadow-xl transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6 transition-transform group-hover:scale-110" />
                CONCLUIR ATIVIDADE AGORA
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
