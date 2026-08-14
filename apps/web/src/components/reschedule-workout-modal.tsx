'use client'

import { updateWorkoutAction } from '@/app/(app)/profile/actions'
import { addHours, isBefore, parse } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, Target, X } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { DatePicker } from './date-picker'
import type { Workout } from './workout-card'

interface RescheduleWorkoutModalProps {
  isOpen: boolean
  workout: Workout | null
  onClose: () => void
  onSuccess?: () => void
}

export function RescheduleWorkoutModal({
  isOpen,
  workout,
  onClose,
  onSuccess,
}: RescheduleWorkoutModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('06:00')
  const [isLoading, setIsLoading] = useState(false)

  React.useEffect(() => {
    if (workout && isOpen) {
      const d = new Date(workout.createdAt ?? (workout as any).date)
      setDate(d.toLocaleDateString('pt-BR'))

      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      setTime(`${hours}:${minutes}`)
    }
  }, [workout, isOpen])

  if (!isOpen || !workout) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    let formattedDate = date
    if (date.includes('/')) {
      const [day, month, year] = date.split('/')
      formattedDate = `${year}-${month}-${day}`
    }

    // Business Rules Client-side Validation
    const now = new Date()
    const newDate = new Date(formattedDate)

    // Limit Check
    if (workout.rescheduleCount && workout.rescheduleCount >= 3) {
      toast.error(
        'Você já atingiu o limite de 3 reagendamentos para este treino.'
      )
      setIsLoading(false)
      return
    }

    // 2h Rule
    const isTodayTarget =
      now.getFullYear() === newDate.getFullYear() &&
      now.getMonth() === newDate.getMonth() &&
      now.getDate() === newDate.getDate()

    if (isTodayTarget) {
      const workoutDateTime = parse(
        `${formattedDate} ${time}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      )

      if (isBefore(workoutDateTime, addHours(now, 2))) {
        toast.error(
          'Reagendamentos para o mesmo dia devem ser feitos com no mínimo 2h de antecedência.'
        )
        setIsLoading(false)
        return
      }
    }

    const formData = new FormData()
    formData.append('slug', workout.club.slug)
    formData.append('workoutId', workout.id)
    formData.append('title', workout.title)
    formData.append('distance', workout.distance.toString())
    formData.append('type', workout.type)
    formData.append('date', `${formattedDate}T${time}:00`)

    // Duration and pace from workout if exists
    const duration = workout.durationInSeconds ?? (workout as any).duration
    if (duration) formData.append('duration', duration.toString())

    const pace = (workout as any).pace
    if (pace) formData.append('pace', pace.toString())

    const result = await updateWorkoutAction(formData)

    if (result.success) {
      toast.success('Treino reagendado com sucesso!')
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center p-4 duration-200">
      <button
        type="button"
        aria-label="Fechar modal de reagendamento"
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="zoom-in-95 relative w-full max-w-sm animate-in rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-gray-100 border-b px-6 py-5">
          <h2 className="flex items-center gap-2 font-black text-gray-900 text-xl">
            <CalendarIcon className="h-5 w-5 text-orange-500" />
            Reagendar Treino
          </h2>
          <button
            type="button"
            aria-label="Fechar modal de reagendamento"
            onClick={onClose}
            className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
            <h4 className="mb-1 font-black text-[10px] text-orange-600 uppercase tracking-widest">
              Treino Selecionado
            </h4>
            <p className="font-bold text-gray-900 text-sm">{workout.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Nova Data"
              value={date}
              onChange={setDate}
              required
            />
            <div className="space-y-1.5">
              <label
                htmlFor="reschedule-time"
                className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
              >
                Novo Horário
              </label>
              <input
                id="reschedule-time"
                type="text"
                required
                value={time}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '')
                  if (val.length > 4) val = val.slice(0, 4)
                  if (val.length > 2)
                    val = val.replace(/(\d{2})(\d{2})/, '$1:$2')
                  setTime(val)
                }}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <p className="font-medium text-[10px] text-gray-400 leading-relaxed">
            Ao reagendar, o treino continuará na sua agenda, mas aparecerá na
            nova data e horário escolhidos.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              'CONFIRMAR NOVA DATA'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
