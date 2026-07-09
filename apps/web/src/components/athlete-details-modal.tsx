'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity,
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import React, { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Workout {
  id: string
  title?: string | null
  distance: number
  type: string
  status: 'PLANNED' | 'COMPLETED'
  createdAt: string
  date: string
  author: {
    id: string
    name: string
  }
  durationInSeconds?: number
  pace?: number | null
  targetDistance?: number | null
  targetDuration?: number | null
}

interface AthleteDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  athlete: {
    id: string
    userId: string
    name: string
    avatarUrl: string | null
    role: string
    adherence: number
    totalPlanned: number
    totalCompleted: number
  } | null
  completedWorkouts: Workout[]
  plannedWorkouts: Workout[]
}

const TYPE_CONFIG = {
  EASY: {
    label: 'Rodagem Leve',
    color: 'text-orange-500 bg-orange-50 border-orange-100',
  },
  INTERVAL: {
    label: 'Intervalado',
    color: 'text-pink-500 bg-pink-50 border-pink-100',
  },
  TEMPO: {
    label: 'Ritmo / Tempo',
    color: 'text-purple-500 bg-purple-50 border-purple-100',
  },
  LONG: {
    label: 'Longão',
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  },
  RECOVERY: {
    label: 'Regenerativo',
    color: 'text-blue-500 bg-blue-50 border-blue-100',
  },
}

export function AthleteDetailsModal({
  isOpen,
  onClose,
  athlete,
  completedWorkouts,
  plannedWorkouts,
}: AthleteDetailsModalProps) {
  if (!isOpen || !athlete) return null

  // Filtrar treinos do atleta
  const athleteCompleted = useMemo(() => {
    return completedWorkouts
      .filter((w) => w.author.id === athlete.userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [completedWorkouts, athlete])

  // Volume Total e Pace Médio Real
  const stats = useMemo(() => {
    let totalKm = 0
    let totalSeconds = 0

    athleteCompleted.forEach((w) => {
      totalKm += w.distance
      totalSeconds += w.durationInSeconds ?? 0
    })

    const avgPaceDecimal = totalKm > 0 ? totalSeconds / 60 / totalKm : 0
    const mins = Math.floor(avgPaceDecimal)
    const secs = Math.round((avgPaceDecimal % 1) * 60)
    const paceStr =
      totalKm > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : '0:00'

    return {
      totalKm:
        totalKm % 1 === 0
          ? totalKm.toFixed(0)
          : totalKm.toFixed(1).replace('.', ','),
      avgPace: paceStr,
    }
  }, [athleteCompleted])

  // Gráfico de Pace Histórico (Evolução do Pace)
  const paceHistoryData = useMemo(() => {
    return athleteCompleted.map((w, idx) => {
      const durMin = (w.durationInSeconds ?? 0) / 60
      const dist = w.distance || 1
      const paceDecimal = durMin / dist
      return {
        name: `T${idx + 1}`,
        pace: Number(paceDecimal.toFixed(2)),
        dateLabel: new Date(w.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
      }
    })
  }, [athleteCompleted])

  // Obter treinos planejados recentes e seu desvio
  const plannedRecent = useMemo(() => {
    return plannedWorkouts
      .filter((w) => w.author.id === athlete.userId)
      .slice(0, 5)
  }, [plannedWorkouts, athlete])

  return (
    <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center p-4 duration-200">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default border-none bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="zoom-in-95 relative flex max-h-[90vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        {/* HEADER */}
        <header className="flex items-center justify-between border-gray-100 border-b bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-gray-200 bg-white">
              <AvatarImage src={athlete.avatarUrl || ''} />
              <AvatarFallback className="font-bold text-gray-400">
                {athlete.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-black text-gray-900 text-lg">
                {athlete.name}
              </h2>
              <p className="font-black text-[10px] text-orange-500 uppercase tracking-widest">
                {athlete.role === 'OWNER'
                  ? 'Fundador'
                  : athlete.role === 'MANAGER'
                    ? 'Gestor'
                    : 'Atleta'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* COLUNA ESQUERDA - MÉTRIQUE & INFO */}
            <div className="space-y-6 lg:col-span-5">
              {/* Card de Aderência */}
              <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
                <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                  Aderência Individual
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-black text-4xl text-gray-900">
                    {athlete.adherence.toFixed(0)}%
                  </span>
                  <span className="font-semibold text-gray-400 text-xs">
                    das metas cumpridas
                  </span>
                </div>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full transition-all duration-1000 ${athlete.adherence >= 90 ? 'bg-green-500' : athlete.adherence >= 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${athlete.adherence}%` }}
                  />
                </div>
              </div>

              {/* Cards de Performance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Flame className="h-5 w-5" />
                  </div>
                  <span className="font-black text-[9px] text-gray-400 uppercase tracking-wider">
                    Volume Total
                  </span>
                  <p className="mt-1 font-black font-mono text-2xl text-gray-900">
                    {stats.totalKm} km
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="font-black text-[9px] text-gray-400 uppercase tracking-wider">
                    Pace Médio
                  </span>
                  <p className="mt-1 font-black font-mono text-2xl text-gray-900">
                    {stats.avgPace} /km
                  </p>
                </div>
              </div>

              {/* Treinos Planejados (Metas Ativas) */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-black text-gray-400 text-xs uppercase tracking-widest">
                  <Target className="h-4 w-4 text-orange-500" /> Metas de
                  Treinos Ativos
                </h4>

                {plannedRecent.length > 0 ? (
                  <div className="space-y-2">
                    {plannedRecent.map((w) => {
                      const cfg =
                        TYPE_CONFIG[w.type as keyof typeof TYPE_CONFIG] ||
                        TYPE_CONFIG.EASY
                      return (
                        <div
                          key={w.id}
                          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs"
                        >
                          <div>
                            <p className="font-extrabold text-gray-900 text-sm">
                              {w.title || 'Sem título'}
                            </p>
                            <span
                              className={`mt-1 inline-block rounded-md border px-1.5 py-0.5 font-black text-[8px] uppercase ${cfg.color}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black font-mono text-orange-500 text-sm">
                              {w.distance} km
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="font-semibold text-gray-400 text-xs italic">
                    Nenhuma meta planejada atualmente.
                  </p>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA - EVOLUÇÃO DE PACE */}
            <div className="flex flex-col space-y-6 lg:col-span-7">
              <div className="flex flex-1 flex-col justify-between rounded-4xl border border-gray-100 bg-white p-6 shadow-sm">
                <div>
                  <h3 className="mb-6 flex items-center gap-2 font-extrabold text-gray-900">
                    <Activity className="h-5 w-5 text-orange-500" /> Curva de
                    Pace Recente (min/km)
                  </h3>
                  <div className="h-64 w-full">
                    {athleteCompleted.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={paceHistoryData}
                          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f3f4f6"
                          />
                          <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            fontSize={11}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            fontSize={11}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            reversed
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#111827',
                              borderRadius: '1.25rem',
                              border: 'none',
                              color: '#fff',
                              fontWeight: 'bold',
                            }}
                            labelFormatter={(label, items) => {
                              const item = items[0]?.payload
                              return item
                                ? `${item.name} (${item.dateLabel})`
                                : label
                            }}
                            formatter={(value) => [`${value} min/km`, 'Pace']}
                          />
                          <Line
                            type="monotone"
                            dataKey="pace"
                            stroke="#8b5cf6"
                            strokeWidth={4}
                            activeDot={{ r: 8 }}
                            dot={{
                              stroke: '#8b5cf6',
                              strokeWidth: 2,
                              r: 4,
                              fill: '#fff',
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="font-semibold text-gray-400 text-sm italic">
                          Nenhum treino concluído ainda.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-gray-50 border-t pt-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                  <span>Início</span>
                  <span className="text-purple-600">
                    ⚡ Gráfico Invertido (Menor pace = Mais rápido)
                  </span>
                  <span>Recente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
