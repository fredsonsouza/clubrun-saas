'use client'

import React, { useState, useMemo } from 'react'
import { X, Timer, Medal, Flame, Target } from 'lucide-react'

interface SubmitResultModalProps {
  isOpen: boolean
  onClose: () => void
  raceDistances: string[] // Ex: ['5k', '10k', '21k']
  onSuccess: (result: any) => void
}

export function SubmitResultModal({
  isOpen,
  onClose,
  raceDistances,
  onSuccess,
}: SubmitResultModalProps) {
  const [distance, setDistance] = useState(raceDistances[0] || '5k')
  const [hours, setHours] = useState('00')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Cálculo de Pace Reactivo
  const pace = useMemo(() => {
    const distNum = parseFloat(distance.replace('k', ''))
    const totalMinutes =
      parseInt(hours || '0') * 60 +
      parseInt(minutes || '0') +
      parseInt(seconds || '0') / 60

    if (!distNum || totalMinutes <= 0) return '0:00'

    const paceDecimal = totalMinutes / distNum
    const pMins = Math.floor(paceDecimal)
    const pSecs = Math.floor((paceDecimal - pMins) * 60)
    return `${pMins}:${pSecs.toString().padStart(2, '0')}`
  }, [distance, hours, minutes, seconds])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // API Call: POST /races/:id/results
    setTimeout(() => {
      setIsLoading(false)
      onSuccess({
        distance,
        time: `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`,
        pace,
      })
    }, 1000)
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Medal className="h-4 w-4" />
            </div>
            Submeter Resultado
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="bg-white p-6">
          <form id="result-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Target className="h-3.5 w-3.5 text-orange-500" /> Distância
                Concluída
              </label>
              <div className="grid grid-cols-3 gap-2">
                {raceDistances.map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setDistance(dist)}
                    className={`rounded-xl border py-3 text-sm font-bold transition-all ${distance === dist ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Timer className="h-3.5 w-3.5 text-orange-500" /> Tempo Oficial
                (Líquido)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center font-mono text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                />
                <span className="font-bold text-gray-400">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  required
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center font-mono text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                />
                <span className="font-bold text-gray-400">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  required
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center font-mono text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                Pace Médio Estimado
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-black text-gray-900">
                  {pace}
                </span>
                <span className="text-sm font-bold text-gray-400">/km</span>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-3 rounded-b-3xl border-t border-gray-100 bg-gray-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-5 font-bold text-gray-600 transition-colors hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="result-form"
            disabled={isLoading || !minutes || !seconds}
            className="flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Flame className="h-4 w-4" /> Guardar Resultado
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
