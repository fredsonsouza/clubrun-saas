'use client'

import React, { useState } from 'react'
import { X, Calendar as CalendarIcon, Loader2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { updateWorkoutAction } from '@/app/(app)/profile/actions'
import { Workout } from './workout-card'
import { DatePicker } from './date-picker'
import { parse, isBefore, addHours } from 'date-fns'

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
  const [isLoading, setIsLoading] = useState(false)

  React.useEffect(() => {
    if (workout && isOpen) {
      const d = new Date(workout.createdAt ?? (workout as any).date)
      setDate(d.toLocaleDateString('pt-BR'))
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
      toast.error('Você já atingiu o limite de 3 reagendamentos para este treino.')
      setIsLoading(false)
      return
    }

    // 2h Rule
    const isTodayTarget = 
      now.getFullYear() === newDate.getFullYear() &&
      now.getMonth() === newDate.getMonth() &&
      now.getDate() === newDate.getDate()

    if (isTodayTarget) {
      const workoutTime = workout.date ? new Date(workout.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '06:00'
      const workoutDateTime = parse(`${formattedDate} ${workoutTime}`, 'yyyy-MM-dd HH:mm', new Date())
      
      if (isBefore(workoutDateTime, addHours(now, 2))) {
        toast.error('Reagendamentos para o mesmo dia devem ser feitos com no mínimo 2h de antecedência.')
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
    formData.append('date', formattedDate)
    
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
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="animate-in zoom-in-95 relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
            <CalendarIcon className="h-5 w-5 text-orange-500" />
            Reagendar Treino
          </h2>
          <button onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Treino Selecionado</h4>
            <p className="text-sm font-bold text-gray-900">{workout.title}</p>
          </div>

          <DatePicker
            label="Nova Data"
            value={date}
            onChange={setDate}
            required
          />

          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            Ao reagendar, o treino continuará na sua agenda, mas aparecerá na nova data escolhida.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONFIRMAR NOVA DATA'}
          </button>
        </form>
      </div>
    </div>
  )
}
