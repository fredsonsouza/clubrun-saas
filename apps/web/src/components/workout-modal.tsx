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
} from 'lucide-react'

interface CreateWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (workout: any) => void
}

export function CreateWorkoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkoutModalProps) {
  const [title, setTitle] = useState('')
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [type, setType] = useState('EASY')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [isLoading, setIsLoading] = useState(false)

  // Reatividade em tempo real: Cálculo do pace enquanto o usuário digita
  const pace = useMemo(() => {
    const d = parseFloat(distance) || 0
    const t = parseFloat(duration) || 0
    if (d <= 0 || t <= 0) return '0:00'
    const paceDecimal = t / d
    const mins = Math.floor(paceDecimal)
    const secs = Math.floor((paceDecimal - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [distance, duration])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulação de chamada de API
    setTimeout(() => {
      setIsLoading(false)
      onSuccess({
        id: Math.random().toString(),
        title: title || 'Treino Sem Título',
        distance: parseFloat(distance),
        durationInMinutes: parseFloat(duration),
        type,
        visibility,
        createdAt: new Date().toISOString(),
        author: { id: 'usr-1', name: 'Fredson Souza' },
      })
      // Reset form
      setTitle('')
      setDistance('')
      setDuration('')
      setType('EASY')
    }, 1000)
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
            Registrar Novo Treino
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
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-14 pl-4 font-mono text-2xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-gray-400">
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* QUADRO DE PACE REACTIVO */}
            <div className="relative flex items-center justify-between overflow-hidden rounded-xl border border-orange-100 bg-orange-50 p-4">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-orange-500/10 blur-xl" />
              <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                Pace Médio Calculado
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
            className="cursor-pointer flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Flame className="h-4 w-4" /> Salvar Treino
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
