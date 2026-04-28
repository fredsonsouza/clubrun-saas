'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Activity,
  Timer,
  MapPin,
  Globe,
  Lock,
  Flame,
  ChevronDown,
  Calendar as CalendarIcon,
  Loader2,
  Users as UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { createWorkoutAction } from '@/app/(app)/[slug]/dashboard/actions'

interface CreateWorkoutModalProps {
  isOpen: boolean
  slug: string
  onClose: () => void
  onSuccess?: () => void
  userRole?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
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
  const [duration, setDuration] = useState('') // Agora aceita MM:SS ou HH:MM:SS
  const [type, setType] = useState('EASY')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [athleteId, setAthleteId] = useState<string>('')
  const [assignmentMode, setAssignmentMode] = useState<'GOAL' | 'FREE'>('GOAL')
  const [isLoading, setIsLoading] = useState(false)

  const isCoach = userRole === 'COACH' || userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MANAGER'
  const canPrescribe = userRole === 'COACH' || userRole === 'OWNER' || userRole === 'ADMIN'
  const isPrescribing = !!athleteId && athleteId !== ''

  // Helper para converter HH:MM:SS ou MM:SS para segundos
  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) {
      // MM:SS:CC (centésimos de segundo)
      return (parts[0] || 0) * 60 + (parts[1] || 0) + ((parts[2] || 0) / 100)
    }
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0)
    }
    return (parts[0] || 0) * 60
  }

  // Reatividade em tempo real: Cálculo do pace enquanto o usuário digita
  const pace = useMemo(() => {
    const d = parseFloat(distance) || 0
    const totalSeconds = timeToSeconds(duration)
    
    if (d <= 0 || totalSeconds <= 0) return '0:00'
    
    const paceInSecondsPerKm = totalSeconds / d
    const mins = Math.floor(paceInSecondsPerKm / 60)
    const secs = Math.floor(paceInSecondsPerKm % 60)
    const millis = Math.round((paceInSecondsPerKm % 1) * 100)
    
    if (millis > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [distance, duration])

  const handleDurationBlur = () => {
    if (!duration) return
    
    // Remove tudo que não for dígito
    const digits = duration.replace(/\D/g, '')
    
    if (digits.length === 2) {
      setDuration(`${digits}:00`)
    } else if (digits.length === 3) {
      setDuration(`${digits.slice(0, 2)}:${digits.slice(2)}0`)
    } else if (digits.length === 4) {
      setDuration(`${digits.slice(0, 2)}:${digits.slice(2)}`)
    } else if (digits.length === 5) {
      // 5 dígitos: MM:SS:C -> MM:SS:C0
      setDuration(`${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}0`)
    } else if (digits.length >= 6) {
      setDuration(`${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`)
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    // Permite apenas números e dois pontos
    val = val.replace(/[^0-9:]/g, '')
    
    // Auto-inserção do : após 2 dígitos e 4 dígitos
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

    const totalSeconds = timeToSeconds(duration)
    const d = parseFloat(distance) || 0
    const paceValue = d > 0 ? totalSeconds / d / 60 : 0 // pace em minutos decimais para o banco

    const formData = new FormData()
    formData.append('slug', slug)
    formData.append('title', title || `Treino de ${TYPE_CONFIG[type as any]?.label || 'Corrida'}`)
    formData.append('distance', distance)
    if (totalSeconds > 0) {
      formData.append('duration', totalSeconds.toString())
    }
    formData.append('pace', paceValue.toString())
    formData.append('type', type)
    formData.append('date', date)
    formData.append('notes', notes)
    formData.append('status', isPrescribing ? 'PLANNED' : 'COMPLETED')
    
    if (isPrescribing) {
      formData.append('athleteId', athleteId)
      formData.append('assignmentMode', assignmentMode)
    }

    const result = await createWorkoutAction(formData)

    if (result.success) {
      toast.success(result.message)
      setTitle('')
      setDistance('')
      setDuration('')
      setNotes('')
      setType('EASY')
      setAthleteId('')
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  const TYPE_CONFIG: any = {
    EASY: { label: 'Rodagem Leve' },
    INTERVAL: { label: 'Treino de Tiro' },
    TEMPO: { label: 'Ritmo / Tempo' },
    LONG: { label: 'Longão' },
    RECOVERY: { label: 'Regenerativo' },
    RACE: { label: 'Prova' },
    STRENGTH: { label: 'Fortalecimento' },
    WALK: { label: 'Caminhada' },
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Activity className="h-4 w-4" />
            </div>
            {isPrescribing ? 'Prescrever Treino' : 'Registrar Novo Treino'}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto bg-white p-6 md:p-8">
          <form id="workout-form" onSubmit={handleSubmit} className="space-y-6">
            {/* SELECIONAR ATLETA (Para Coaches/Owners) */}
            {canPrescribe && (
              <div className="space-y-4 rounded-2xl bg-orange-50/50 p-4 border border-orange-100">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-orange-600 uppercase">
                    <UsersIcon className="h-3.5 w-3.5" /> Prescrever Para
                  </label>
                  <div className="relative">
                    <select
                      value={athleteId}
                      onChange={(e) => setAthleteId(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-orange-100 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                    >
                      <option value="">Para mim mesmo (Treino Concluído)</option>
                      {members.map(member => (
                        <option key={member.id} value={member.userId}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-orange-400" />
                  </div>
                </div>

                {isPrescribing && (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                      Tipo de Prescrição
                    </label>
                    <div className="flex p-1 bg-white rounded-xl border border-orange-100">
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('GOAL')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${assignmentMode === 'GOAL' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-orange-500'}`}
                      >
                        <Timer className="h-3.5 w-3.5" />
                        Meta (Fixo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('FREE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${assignmentMode === 'FREE' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-orange-500'}`}
                      >
                        <Activity className="h-3.5 w-3.5" />
                        Livre (Flexível)
                      </button>
                    </div>
                    <p className="text-[10px] text-orange-400 font-medium px-1 leading-relaxed">
                      {assignmentMode === 'GOAL' 
                        ? 'O atleta deverá tentar cumprir a distância e o tempo exatos sugeridos.' 
                        : 'Apenas a distância é sugerida. O atleta registrará o tempo quando concluir.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TÍTULO */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <MapPin className="h-3.5 w-3.5 text-orange-500" /> Título
                (Opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Treino de velocidade na pista"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
              />
            </div>

            {/* DATA DO TREINO */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <CalendarIcon className="h-3.5 w-3.5 text-orange-500" /> Data da Atividade
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
              />
            </div>

            {/* TIPO DE TREINO (Obrigatório) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Activity className="h-3.5 w-3.5 text-orange-500" /> Tipo de
                Treino
              </label>
              <div className="relative">
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                >
                  <option value="EASY">Rodagem Leve / Easy Run</option>
                  <option value="INTERVAL">Treino de Tiro / Intervalado</option>
                  <option value="TEMPO">Ritmo / Tempo Run</option>
                  <option value="LONG">Longão / Long Run</option>
                  <option value="RECOVERY">Regenerativo / Recovery</option>
                  <option value="RACE">Prova / Prova Oficial</option>
                  <option value="STRENGTH">Fortalecimento / Strength</option>
                  <option value="WALK">Caminhada / Walk</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DISTÂNCIA */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Activity className="h-3.5 w-3.5 text-orange-500" /> Distância
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-12 pl-4 font-mono text-2xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-gray-400">
                    km
                  </span>
                </div>
              </div>

              {/* TEMPO */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Timer className="h-3.5 w-3.5 text-orange-500" /> Tempo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required={!isPrescribing || assignmentMode === 'GOAL'}
                    value={duration}
                    onChange={handleDurationChange}
                    onBlur={handleDurationBlur}
                    placeholder={isPrescribing && assignmentMode === 'FREE' ? "Livre" : "Ex: 15:25"}
                    disabled={isPrescribing && assignmentMode === 'FREE'}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-20 pl-4 font-mono text-2xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none disabled:opacity-50 disabled:bg-gray-100"
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-gray-400">
                    {isPrescribing && assignmentMode === 'FREE' ? '' : 'tempo'}
                  </span>
                </div>
              </div>
            </div>

            {/* QUADRO DE PACE REACTIVO */}
            {(!isPrescribing || assignmentMode === 'GOAL') && (
              <div className="relative flex items-center justify-between overflow-hidden rounded-xl border border-orange-100 bg-orange-50 p-4">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-orange-500/10 blur-xl" />
                <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                  {isPrescribing ? 'Ritmo Alvo (Pace)' : 'Pace Médio Calculado'}
                </span>
                <div className="relative z-10 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-light tracking-tight text-orange-600">
                    {pace}
                  </span>
                  <span className="text-sm font-bold text-orange-500/70">
                    /km
                  </span>
                </div>
              </div>
            )}

            {/* NOTAS / DESCRIÇÃO */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Notas (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como se sentiu hoje?"
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
              />
            </div>

            {/* PRIVACIDADE */}
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Privacidade
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    className="peer sr-only"
                    checked={visibility === 'PUBLIC'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:ring-1">
                    <Globe className="h-5 w-5 shrink-0 text-orange-500" />
                    <div>
                      <span className="block text-sm font-bold text-gray-900">
                        Público
                      </span>
                    </div>
                  </div>
                </label>
                <label className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    className="peer sr-only"
                    checked={visibility === 'PRIVATE'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:ring-1">
                    <Lock className="h-5 w-5 shrink-0 text-gray-400 peer-checked:text-orange-500" />
                    <div>
                      <span className="block text-sm font-bold text-gray-900">
                        Privado
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-3 rounded-b-3xl border-t border-gray-100 bg-gray-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer h-11 rounded-xl px-5 font-bold text-gray-600 transition-colors hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="workout-form"
            disabled={isLoading}
            className="cursor-pointer flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Flame className="h-4 w-4" /> Registrar no Pelotão
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
