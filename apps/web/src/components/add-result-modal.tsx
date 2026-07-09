'use client'

import { createRaceResultAction } from '@/app/(app)/[slug]/races/actions'
import { ShoeIcon } from '@/components/shoe-icon'
import { getProfile } from '@/http/get-profile'
import { getUserProfile } from '@/http/get-user-profile'
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Loader2,
  Trophy,
  X,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface AddResultModalProps {
  isOpen: boolean
  slug: string
  raceId: string
  raceName: string
  raceDistance: number
  onClose: () => void
}

export function AddResultModal({
  isOpen,
  slug,
  raceId,
  raceName,
  raceDistance,
  onClose,
}: AddResultModalProps) {
  const [time, setTime] = useState('00:00:00')
  const [position, setPosition] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [athleteProfile, setAthleteProfile] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen])

  const isDistanceInvalid = useMemo(() => {
    if (!athleteProfile?.shoes || !raceDistance) return false
    const remaining = athleteProfile.shoesRemainingDistance ?? 0
    return raceDistance > remaining
  }, [athleteProfile, raceDistance])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (athleteProfile?.shoes) {
      const remaining = athleteProfile.shoesRemainingDistance ?? 0
      if (raceDistance > remaining) {
        toast.error(
          'A distância da corrida excede a quilometragem restante do tênis!'
        )
        setIsLoading(false)
        return
      }
    }

    const formData = new FormData()
    formData.append('slug', slug)
    formData.append('raceId', raceId)
    formData.append('time', time)
    if (position) formData.append('position', position)

    const result = await createRaceResultAction(formData)

    if (result.success) {
      toast.success(result.message)
      onClose()
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-3 text-xl font-black text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
            Registrar Resultado
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="bg-white p-6 md:p-8">
          <div className="mb-6 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Prova
            </p>
            <p className="font-bold text-gray-900">{raceName}</p>
          </div>

          <form id="result-form" onSubmit={handleSubmit} className="space-y-6">
            {/* TEMPO */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Clock className="h-3.5 w-3.5 text-orange-500" /> Tempo Final
                (HH:MM:SS)
              </label>
              <input
                type="text"
                required
                pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="00:00:00"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-mono text-2xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            {/* POSIÇÃO */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Trophy className="h-3.5 w-3.5 text-orange-500" /> Posição Geral
                (Opcional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: 42"
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 font-black text-gray-400">
                  º
                </span>
              </div>
            </div>

            {/* Informações do Tênis */}
            {athleteProfile?.shoes && (
              <div
                className={`rounded-2xl border p-4 space-y-2 text-xs font-semibold ${
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
                      className="font-bold truncate max-w-[180px]"
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
                          ? 'text-red-600 font-extrabold'
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
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Atenção: Vida útil próxima do fim! Recomendamos a troca.
                    </span>
                  </div>
                )}

                {isDistanceInvalid && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      A distância da corrida ({raceDistance.toFixed(1)} km) é
                      maior que a restante do tênis (
                      {athleteProfile.shoesRemainingDistance?.toFixed(1)} km)!
                    </span>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <footer className="flex items-center justify-end gap-4 rounded-b-[2.5rem] border-t border-gray-100 bg-gray-50 px-8 py-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer h-12 rounded-xl px-6 font-bold text-gray-600 transition-colors hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="result-form"
            disabled={isLoading || isDistanceInvalid}
            className="cursor-pointer flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                SALVAR RESULTADO
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
