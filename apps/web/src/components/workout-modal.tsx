'use client'

import {
  createWorkoutAction,
  logToServerAction,
} from '@/app/(app)/[slug]/dashboard/actions'
import { ShoeIcon } from '@/components/shoe-icon'
import { getProfile } from '@/http/get-profile'
import { getUserProfile } from '@/http/get-user-profile'
import {
  addHours,
  isBefore,
  isSameDay,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns'
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Flame,
  Globe,
  Loader2,
  Lock,
  Map as MapIcon,
  MapPin,
  Timer,
  Users as UsersIcon,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { DatePicker } from './date-picker'
import { WarningModal } from './warning-modal'

const MapEditor = dynamic(
  () => import('./map-editor').then((mod) => mod.MapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-50 font-bold text-gray-300 text-xs uppercase tracking-widest">
        Carregando mapa...
      </div>
    ),
  }
)

interface CreateWorkoutModalProps {
  isOpen: boolean
  slug: string
  onClose: () => void
  onSuccess?: () => void
  userRole?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  members?: Array<{ id: string; name: string; userId: string }>
  defaultDate?: Date
}

export function CreateWorkoutModal({
  isOpen,
  slug,
  onClose,
  onSuccess,
  userRole,
  members = [],
  defaultDate,
}: CreateWorkoutModalProps) {
  const [title, setTitle] = useState('')
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [type, setType] = useState('EASY')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('06:00')
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [athleteId, setAthleteId] = useState<string>('')
  const [assignmentMode, setAssignmentMode] = useState<'GOAL' | 'FREE'>('GOAL')
  const [isLoading, setIsLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [routeData, setRouteData] = useState<any>(null)
  const mapEditorRef = React.useRef<any>(null)

  const [athleteProfile, setAthleteProfile] = useState<any>(null)

  React.useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDistance('')
      setDuration('')
      setType('EASY')

      const targetDate = defaultDate || new Date()
      const dd = String(targetDate.getDate()).padStart(2, '0')
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
      const yyyy = targetDate.getFullYear()
      setDate(`${dd}/${mm}/${yyyy}`)

      setTime('06:00')
      setNotes('')
      setVisibility('PUBLIC')
      setAthleteId('')
      setAssignmentMode('GOAL')
      setRouteData(null)

      const fetchProfile = async () => {
        try {
          const { user } = await getProfile()
          if (user?.id) {
            const profileData = await getUserProfile(user.id)
            setAthleteProfile(profileData.athleteProfile)
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error)
        }
      }
      fetchProfile()
    }
  }, [isOpen, defaultDate])

  const canPrescribe =
    userRole === 'COACH' || userRole === 'OWNER' || userRole === 'ADMIN'
  const isPrescribing = !!athleteId && athleteId !== ''

  const isDistanceInvalid = useMemo(() => {
    if (isPrescribing || !athleteProfile?.shoes || !distance) return false
    const d = Number.parseFloat(distance) || 0
    const remaining = athleteProfile.shoesRemainingDistance ?? 0
    return d > remaining
  }, [isPrescribing, athleteProfile, distance])

  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return parts[0] * 60
  }

  const pace = useMemo(() => {
    const d = Number.parseFloat(distance) || 0
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

    if (!isPrescribing && athleteProfile?.shoes) {
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

    let formattedDate = date
    if (date.includes('/')) {
      const [day, month, year] = date.split('/')
      formattedDate = `${year}-${month}-${day}`
    }

    if (isPrescribing) {
      const workoutDate = startOfDay(parseISO(formattedDate))
      const today = startOfDay(new Date())

      if (isBefore(workoutDate, today)) {
        setWarningMessage(
          'Treinos prescritos devem ser para hoje ou datas futuras.'
        )
        setShowWarning(true)
        setIsLoading(false)
        return
      }

      if (isSameDay(workoutDate, today)) {
        const workoutDateTime = parse(
          `${formattedDate} ${time}`,
          'yyyy-MM-dd HH:mm',
          new Date()
        )
        if (isBefore(workoutDateTime, addHours(new Date(), 2))) {
          setWarningMessage(
            'Treinos para o mesmo dia devem ser prescritos com no mínimo 2h de antecedência.'
          )
          setShowWarning(true)
          setIsLoading(false)
          return
        }
      }
    }

    const totalSeconds = timeToSeconds(duration)
    const d = Number.parseFloat(distance) || 0
    const paceValue = d > 0 ? totalSeconds / d / 60 : 0

    let finalRouteData = routeData
    await logToServerAction(
      `[DEBUG CL] handleSave, mapEditorRef.current exists? ${!!mapEditorRef.current}`
    )
    if (mapEditorRef.current) {
      const activeData = mapEditorRef.current.finalize()
      await logToServerAction(
        `[DEBUG CL] handleSave finalize returned: ${activeData ? 'COMPLETED' : 'NULL'}`
      )
      if (activeData?.features && activeData.features.length > 0) {
        finalRouteData = activeData
        await logToServerAction(
          `[DEBUG CL] handleSave finalRouteData features length: ${finalRouteData.features.length}`
        )
      } else {
        await logToServerAction(
          '[DEBUG CL] handleSave activeData features length is 0 or undefined'
        )
      }
    }

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
    if (finalRouteData) {
      formData.append('routeData', JSON.stringify(finalRouteData))
    }
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
    <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center p-4 duration-200">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="zoom-in-95 relative flex max-h-[95vh] w-full max-w-5xl animate-in flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <header className="flex items-center justify-between border-gray-100 border-b bg-white px-6 py-5">
          <h2 className="flex items-center gap-3 font-black text-gray-900 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <ActivityIcon className="h-5 w-5" />
            </div>
            {isPrescribing ? 'Prescrever Treino' : 'Registrar Atividade'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <form
            id="workout-form"
            onSubmit={handleSubmit}
            className="p-6 md:p-8"
          >
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                {canPrescribe && (
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 font-black text-[10px] text-orange-600 uppercase tracking-widest">
                      <UsersIcon className="h-3.5 w-3.5" /> Prescrever Para
                    </label>
                    <select
                      value={athleteId}
                      onChange={(e) => setAthleteId(e.target.value)}
                      className="w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    >
                      <option value="">Para mim mesmo (Concluído)</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.userId}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Título do Treino
                  </label>
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
                  <DatePicker
                    label="Data"
                    value={date}
                    onChange={setDate}
                    required
                  />
                  <div className="space-y-1.5">
                    <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Hora
                    </label>
                    <input
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Distância (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold font-mono text-gray-900 text-xl focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Duração (MM:SS)
                    </label>
                    <input
                      type="text"
                      required
                      value={duration}
                      onChange={handleDurationChange}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold font-mono text-gray-900 text-xl focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Tipo de Treino
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                  >
                    <option value="EASY">Rodagem Leve</option>
                    <option value="INTERVAL">Intervalado</option>
                    <option value="TEMPO">Ritmo / Tempo</option>
                    <option value="LONG">Longão</option>
                    <option value="RECOVERY">Regenerativo</option>
                  </select>
                </div>

                {/* Informações do Tênis */}
                {!isPrescribing && athleteProfile?.shoes && (
                  <div
                    className={`mt-4 space-y-2 rounded-2xl border p-4 font-semibold text-xs ${
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
                          Atenção: Vida útil próxima do fim! Recomendamos a
                          troca.
                        </span>
                      </div>
                    )}

                    {isDistanceInvalid && (
                      <div className="mt-1 flex items-center gap-1 font-bold text-[10px] text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          A distância informada ({Number.parseFloat(distance)}{' '}
                          km) é maior que a restante do tênis (
                          {athleteProfile.shoesRemainingDistance?.toFixed(1)}{' '}
                          km)!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-4 lg:h-full">
                <label className="flex items-center gap-2 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                  <MapIcon className="h-3.5 w-3.5 text-orange-500" /> Percurso
                  (Opcional)
                </label>
                <div className="min-h-[350px] flex-1 overflow-hidden rounded-3xl border border-gray-100">
                  <MapEditor
                    forwardedRef={mapEditorRef}
                    onChange={setRouteData}
                  />
                </div>
                <div className="mt-auto flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-5">
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] text-orange-600 uppercase tracking-widest">
                      Pace Estimado
                    </span>
                    <p className="font-medium text-[9px] text-orange-400">
                      Minutos por km
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 text-orange-600">
                    <span className="font-black font-mono text-3xl">
                      {pace}
                    </span>
                    <span className="font-bold text-sm opacity-70">/km</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-4 border-gray-100 border-t bg-gray-50 px-8 py-6">
          <button
            onClick={onClose}
            className="h-14 rounded-2xl px-8 font-bold text-gray-600 hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="workout-form"
            disabled={isLoading || isDistanceInvalid}
            className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-orange-500 px-10 font-black text-white shadow-orange-500/20 shadow-xl hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
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
