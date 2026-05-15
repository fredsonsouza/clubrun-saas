'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Activity,
  Timer,
  CheckCircle2,
  Loader2,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { completeWorkoutAction } from '@/app/(app)/profile/actions'
import { Workout } from './workout-card'

interface CompleteWorkoutModalProps {
  isOpen: boolean
  workout: Workout | null
  onClose: () => void
  onSuccess?: () => void
}

export function CompleteWorkoutModal({
  isOpen,
  workout,
  onClose,
  onSuccess,
}: CompleteWorkoutModalProps) {
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const formatDuration = (totalSeconds: number) => {
    const sRaw = Number(totalSeconds) || 0
    const h = Math.floor(sRaw / 3600)
    const m = Math.floor((sRaw % 3600) / 60)
    const s = Math.floor(sRaw % 60)
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}m ${s}s`
  }

  // Initialize with workout values if it's a GOAL
  React.useEffect(() => {
    if (workout) {
      setDistance(workout.distance.toString())
      if (workout.durationInSeconds > 0) {
        const mins = Math.floor(workout.durationInSeconds / 60)
        const secs = workout.durationInSeconds % 60
        setDuration(`${mins}:${secs.toString().padStart(2, '0')}`)
      } else {
        setDuration('')
      }
    }
  }, [workout])

  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) {
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
    }
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0)
    }
    return (parts[0] || 0) * 60
  }

  const pace = useMemo(() => {
    const d = parseFloat(distance) || 0
    const totalSeconds = timeToSeconds(duration)
    if (d <= 0 || totalSeconds <= 0) return '0:00'
    const paceInSeconds = totalSeconds / d
    const mins = Math.floor(paceInSeconds / 60)
    const secs = Math.floor(paceInSeconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [distance, duration])

  if (!isOpen || !workout) return null

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '')
    const digits = val.replace(/\D/g, '')
    if (digits.length > 2) {
      val = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
    }
    setDuration(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const totalSeconds = timeToSeconds(duration)
    const d = parseFloat(distance) || 0
    const paceValue = d > 0 ? totalSeconds / d / 60 : 0

    const formData = new FormData()
    formData.append('slug', workout.club.slug)
    formData.append('workoutId', workout.id)
    formData.append('distance', distance)
    formData.append('duration', totalSeconds.toString())
    formData.append('pace', paceValue.toString())

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
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
            <CheckCircle2 className="h-5 w-5 text-orange-500" />
            Finalizar Treino
          </h2>
          <button onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
            <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-orange-500/5 blur-xl" />
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2">
              <Target className="h-3 w-3" /> Meta do Treinador
            </h4>
            <p className="text-base font-black text-gray-900 leading-tight">{workout.title}</p>
            <div className="mt-3 flex items-center gap-4">
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Distância</span>
                 <span className="text-sm font-black text-gray-700">{workout.distance}km</span>
               </div>
               <div className="h-6 w-px bg-orange-200/50" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Tempo Sugerido</span>
                 <span className="text-sm font-black text-gray-700">{workout.durationInSeconds > 0 ? formatDuration(workout.durationInSeconds) : 'Livre'}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                <Activity className="h-3.5 w-3.5 text-orange-500" /> Distância Real
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pr-12 pl-5 font-mono text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">km</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                <Timer className="h-3.5 w-3.5 text-orange-500" /> Tempo Real
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="00:00"
                  value={duration}
                  onChange={handleDurationChange}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-5 font-mono text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pace Médio Final</span>
              <p className="text-xs font-medium text-orange-400">Calculado automaticamente</p>
            </div>
            <div className="flex items-baseline gap-1 text-orange-600">
              <span className="font-mono text-3xl font-black">{pace}</span>
              <span className="text-sm font-bold opacity-70">/km</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-orange-500 font-black text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
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
