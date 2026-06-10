'use client'

import React, { useState } from 'react'
import {
  Trophy,
  MapPin,
  Calendar,
  Activity,
  ArrowLeft,
  Clock,
  Medal,
  ChevronRight,
  Loader2,
  Hourglass,
  CheckCircle2,
  Coins,
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateRacePaymentStatusAction } from '../actions'

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full animate-pulse rounded-[3rem] bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">Carregando percurso...</div>
})

interface Result {
  id: string
  time: number
  position: number | null
  pace: number | null
  athlete: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

interface Participant {
  id: string
  createdAt: string
  paymentStatus: 'PENDING' | 'CONFIRMED' | null
  athlete: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

interface RaceDetailsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  club: {
    name: string
    slug: string
  }
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  race: {
    id: string
    name: string
    distance: number
    city: string
    date: string
    imageUrl: string | null
    routeData: any | null
  }
  results: Result[]
  participants: Participant[]
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatPace(pace: number | null) {
  if (!pace) return '--:--'
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function RaceDetailsClient({
  user,
  club,
  userRole,
  race,
  results,
  participants,
}: RaceDetailsClientProps) {
  const router = useRouter()
  const [updatingAthleteId, setUpdatingAthleteId] = useState<string | null>(null)

  const handleTogglePayment = async (athleteId: string, currentStatus: 'PENDING' | 'CONFIRMED') => {
    const nextStatus = currentStatus === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED'
    setUpdatingAthleteId(athleteId)

    const formData = new FormData()
    formData.append('slug', club.slug)
    formData.append('raceId', race.id)
    formData.append('athleteId', athleteId)
    formData.append('paymentStatus', nextStatus)

    try {
      const result = await updateRacePaymentStatusAction(formData)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Erro ao atualizar status do pagamento.')
    } finally {
      setUpdatingAthleteId(null)
    }
  }

  const isFuture = new Date(race.date) > new Date()

  const raceDate = new Date(race.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* BACK BUTTON */}
        <Link
          href={`/${club.slug}/races`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o Calendário
        </Link>

        {/* RACE HERO */}
        <div className="relative mb-12 overflow-hidden rounded-[3rem] border border-gray-100 bg-white p-8 shadow-2xl md:p-12">
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
            {/* Image Placeholder or Actual Image */}
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-4xl bg-orange-50 md:h-48 md:w-48">
              {race.imageUrl ? (
                <img
                  src={race.imageUrl}
                  alt={race.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Activity className="h-16 w-16 text-orange-200" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-orange-500/20">
                  {race.distance}k
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
                  Oficial
                </span>
              </div>
              <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
                {race.name}
              </h1>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <Calendar className="h-4 w-4 text-orange-500" /> {raceDate}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <MapPin className="h-4 w-4 text-orange-500" /> {race.city}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <Trophy className="h-4 w-4 text-orange-500" />{' '}
                  {results.length} Atletas Finalistas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAP SECTION */}
        {race.routeData && (
          <div className="mb-12">
            <MapView routeData={race.routeData} />
          </div>
        )}

        {/* CONDITIONAL SECTION: PARTICIPANTS OR LEADERBOARD */}
        {isFuture ? (
          <div className="space-y-6">
            <div className="flex items-end justify-between px-4 sm:px-0">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900">
                  Atletas <span className="text-orange-500">Inscritos</span>
                </h2>
                <p className="text-sm font-medium text-gray-400">
                  Acompanhe quem está confirmado no pelotão para a largada de {race.name}.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase w-24">
                        #
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Atleta
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Data de Inscrição
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase w-56">
                        Status do Pagamento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {participants.length > 0 ? (
                      participants.map((p, index) => {
                        const isPrivileged = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MANAGER'
                        const isOwnRegistration = p.athlete.id === user.id
                        const canViewStatus = isPrivileged || isOwnRegistration

                        return (
                          <tr
                            key={p.id}
                            className="group transition-colors hover:bg-gray-50/50"
                          >
                            <td className="px-8 py-6">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black bg-gray-100 text-gray-500">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm ring-2 ring-white transition-transform group-hover:scale-105">
                                  {p.athlete.avatarUrl ? (
                                    <img
                                      src={p.athlete.avatarUrl}
                                      alt={p.athlete.name || ''}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center font-black text-gray-300">
                                      {p.athlete.name?.[0] || 'A'}
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-black text-gray-900 transition-colors group-hover:text-orange-500">
                                  {p.athlete.name || 'Atleta Anônimo'}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-gray-500">
                              {new Date(p.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-8 py-6">
                              {isPrivileged ? (
                                <button
                                  onClick={() => handleTogglePayment(p.athlete.id, p.paymentStatus || 'PENDING')}
                                  disabled={updatingAthleteId === p.athlete.id}
                                  className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all shadow-sm active:scale-95 disabled:opacity-75 ${
                                    p.paymentStatus === 'CONFIRMED'
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                                  }`}
                                >
                                  {updatingAthleteId === p.athlete.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : p.paymentStatus === 'CONFIRMED' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <Hourglass className="h-3.5 w-3.5" />
                                  )}
                                  {p.paymentStatus === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                                </button>
                              ) : (
                                <div className="inline-flex">
                                  {canViewStatus ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[9px] font-black tracking-widest uppercase ${
                                        p.paymentStatus === 'CONFIRMED'
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                                      }`}
                                    >
                                      {p.paymentStatus === 'CONFIRMED' ? 'Confirmado' : 'Aguardando Admin'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase">
                                      Inscrito
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                              <Calendar className="h-8 w-8" />
                            </div>
                          </div>
                          <h3 className="text-xl font-black text-gray-900">
                            Nenhum inscrito ainda
                          </h3>
                          <p className="text-sm font-medium text-gray-400">
                            Seja o primeiro a garantir sua presença clicando em "Inscrever-se" no calendário!
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-end justify-between px-4 sm:px-0">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900">
                  Leaderboard <span className="text-orange-500">do Clube</span>
                </h2>
                <p className="text-sm font-medium text-gray-400">
                  Os melhores tempos registrados pelos atletas do {club.name}.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Posição
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Atleta
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Tempo Final
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Pace Médio
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Posição Geral
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <tr
                          key={result.id}
                          className="group transition-colors hover:bg-gray-50/50"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black ${
                                  index === 0
                                    ? 'bg-amber-100 text-amber-600 shadow-sm'
                                    : index === 1
                                      ? 'bg-slate-100 text-slate-500 shadow-sm'
                                      : index === 2
                                        ? 'bg-orange-100 text-orange-600 shadow-sm'
                                        : 'bg-gray-50 text-gray-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              {index < 3 && (
                                <Medal
                                  className={`h-5 w-5 ${
                                    index === 0
                                      ? 'text-amber-500'
                                      : index === 1
                                        ? 'text-slate-400'
                                        : 'text-orange-500'
                                  }`}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-2 ring-white transition-transform group-hover:scale-110">
                                {result.athlete.avatarUrl ? (
                                  <img
                                    src={result.athlete.avatarUrl}
                                    alt={result.athlete.name || ''}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-black text-gray-300">
                                    {result.athlete.name?.[0] || 'A'}
                                  </div>
                                )}
                              </div>
                              <span className="text-base font-black text-gray-900 transition-colors group-hover:text-orange-500">
                                {result.athlete.name || 'Atleta Anônimo'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-mono text-xl font-black text-gray-900">
                            {formatDuration(result.time)}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-black text-gray-600">
                                {formatPace(result.pace)}{' '}
                                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                  min/km
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-black text-gray-600">
                              {result.position
                                ? `${result.position}º Lugar`
                                : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                              <Clock className="h-8 w-8" />
                            </div>
                          </div>
                          <h3 className="text-xl font-black text-gray-900">
                            Nenhum resultado ainda
                          </h3>
                          <p className="text-sm font-medium text-gray-400">
                            Os atletas do clube ainda não registraram seus tempos
                            nesta prova.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
