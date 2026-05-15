'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Activity as ActivityIcon,
  Timer,
  MapPin,
  Globe,
  Lock,
  Flame,
  ChevronDown,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  AlertTriangle,
  Map as MapIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createWorkoutAction } from '@/app/(app)/[slug]/dashboard/actions'
import { DatePicker } from './date-picker'
import { WarningModal } from './warning-modal'
import { isBefore, startOfDay, parseISO, parse, addHours, isSameDay } from 'date-fns'
import dynamic from 'next/dynamic'

const MapEditor = dynamic(() => import('./map-editor').then(mod => mod.MapEditor), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-300 uppercase tracking-widest">Carregando mapa...</div>
})

interface CreateWorkoutModalProps {
  isOpen: boolean
  slug: string
  onClose: () => void
  onSuccess?: () => void
  userRole?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  members?: Array<{ id: string, name: string, userId: string }>
}

export function CreateWorkoutModal({
  isOpen,
  slug,
  onClose,
  onSuccess,
  userRole,
  members = [],
}: CreateWorkoutModalProps) {
  const [title, setTitle] = useState('')
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [type, setType] = useState('EASY')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('06:00')
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [athleteId, setAthleteId] = useState<string>('')
  const [assignmentMode, setAssignmentMode] = useState<'GOAL' | 'FREE'>('GOAL')
  const [isLoading, setIsLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [routeData, setRouteData] = useState<any>(null)

  const canPrescribe = userRole === 'COACH' || userRole === 'OWNER' || userRole === 'ADMIN'
  const isPrescribing = !!athleteId && athleteId !== ''

  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return parts[0] * 60
  }

  const pace = useMemo(() => {
    const d = parseFloat(distance) || 0
    const totalSeconds = timeToSeconds(duration)
    if (d <= 0 || totalSeconds <= 0) return '0:00'
    const paceInSecondsPerKm = totalSeconds / d
    const mins = Math.floor(paceInSecondsPerKm / 60)
    const secs = Math.floor(paceInSecondsPerKm % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [distance, duration])

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

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    let formattedDate = date
    if (date.includes('/')) {
      const [day, month, year] = date.split('/')
      formattedDate = `${year}-${month}-${day}`
    }

    if (isPrescribing) {
      const workoutDate = startOfDay(parseISO(formattedDate))
      const today = startOfDay(new Date())

      if (isBefore(workoutDate, today)) {
        setWarningMessage('Treinos prescritos devem ser para hoje ou datas futuras.')
        setShowWarning(true)
        setIsLoading(false)
        return
      }

      if (isSameDay(workoutDate, today)) {
        const workoutDateTime = parse(`${formattedDate} ${time}`, 'yyyy-MM-dd HH:mm', new Date())
        if (isBefore(workoutDateTime, addHours(new Date(), 2))) {
          setWarningMessage('Treinos para o mesmo dia devem ser prescritos com no mínimo 2h de antecedência.')
          setShowWarning(true)
          setIsLoading(false)
          return
        }
      }
    }

    const totalSeconds = timeToSeconds(duration)
    const d = parseFloat(distance) || 0
    const paceValue = d > 0 ? totalSeconds / d / 60 : 0 

    const formData = new FormData()
    formData.append('slug', slug)
    formData.append('title', title || `Treino de ${type}`)
    formData.append('distance', distance)
    if (totalSeconds > 0) formData.append('duration', totalSeconds.toString())
    formData.append('pace', paceValue.toString())
    formData.append('type', type)
    formData.append('date', `${formattedDate}T${time}:00`)
    formData.append('notes', notes)
    formData.append('visibility', visibility)
    if (routeData) formData.append('routeData', JSON.stringify(routeData))
    formData.append('status', isPrescribing ? 'PLANNED' : 'COMPLETED')
    
    if (isPrescribing) {
      formData.append('athleteId', athleteId)
      formData.append('assignmentMode', assignmentMode)
    }

    const result = await createWorkoutAction(formData)

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

      <div className="animate-in zoom-in-95 relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-3 text-xl font-black text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <ActivityIcon className="h-5 w-5" />
            </div>
            {isPrescribing ? 'Prescrever Treino' : 'Registrar Atividade'}
          </h2>
          <button onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <form id="workout-form" onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                {canPrescribe && (
                   <div className="space-y-1.5">
                     <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-600 uppercase">
                       <UsersIcon className="h-3.5 w-3.5" /> Prescrever Para
                     </label>
                     <select
                       value={athleteId}
                       onChange={(e) => setAthleteId(e.target.value)}
                       className="w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                     >
                       <option value="">Para mim mesmo (Concluído)</option>
                       {members.map(m => (
                         <option key={m.id} value={m.userId}>{m.name}</option>
                       ))}
                     </select>
                   </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Título do Treino</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Rodagem de 10km"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker label="Data" value={date} onChange={setDate} required />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Hora</label>
                    <input
                      type="text"
                      required
                      value={time}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '')
                        if (val.length > 4) val = val.slice(0, 4)
                        if (val.length > 2) val = val.replace(/(\d{2})(\d{2})/, '$1:$2')
                        setTime(val)
                      }}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Distância (km)</label>
                    <input
                      type="number" step="0.1" required
                      value={distance} onChange={(e) => setDistance(e.target.value)}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-mono text-xl font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Duração (MM:SS)</label>
                    <input
                      type="text" required
                      value={duration} onChange={handleDurationChange}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-mono text-xl font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Tipo de Treino</label>
                  <select
                    value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                  >
                    <option value="EASY">Rodagem Leve</option>
                    <option value="INTERVAL">Intervalado</option>
                    <option value="TEMPO">Ritmo / Tempo</option>
                    <option value="LONG">Longão</option>
                    <option value="RECOVERY">Regenerativo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-4 lg:h-full">
                <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <MapIcon className="h-3.5 w-3.5 text-orange-500" /> Percurso (Opcional)
                </label>
                <div className="flex-1 overflow-hidden min-h-[350px] border border-gray-100 rounded-3xl">
                  <MapEditor onChange={setRouteData} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-5 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pace Estimado</span>
                    <p className="text-[9px] font-medium text-orange-400">Minutos por km</p>
                  </div>
                  <div className="flex items-baseline gap-1 text-orange-600">
                    <span className="font-mono text-3xl font-black">{pace}</span>
                    <span className="text-sm font-bold opacity-70">/km</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-4 border-t border-gray-100 bg-gray-50 px-8 py-6">
          <button onClick={onClose} className="h-14 rounded-2xl px-8 font-bold text-gray-600 hover:bg-gray-200/50">Cancelar</button>
          <button
            type="submit" form="workout-form" disabled={isLoading}
            className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-orange-500 px-10 font-black text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <CheckCircle2 className="h-6 w-6" />
                {isPrescribing ? 'PRESCREVER AGORA' : 'REGISTRAR NO PELOTÃO'}
              </>
            )}
          </button>
        </footer>
      </div>
      <WarningModal
        isOpen={showWarning}
        title="Agendamento Inválido"
        message={warningMessage}
        onClose={() => setShowWarning(false)}
      />
    </div>
  )
}
