'use client'

import { AthleteDetailsModal } from '@/components/athlete-details-modal'
import { Header } from '@/components/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useState, useEffect } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Workout {
  id: string
  distance: number
  type: string
  status: 'PLANNED' | 'COMPLETED'
  createdAt: string
  date: string
  duration?: number | null
  pace?: number | null
  author: {
    id: string
    name: string
    avatarUrl?: string | null
  }
}

interface ReportsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  slug: string
  plannedWorkouts: Workout[]
  completedWorkouts: Workout[]
  members: any[]
}

function formatPace(pace: number | null | undefined): string {
  if (pace === null || pace === undefined || pace <= 0) return '--:--'
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
  return `${minutes}:${formattedSeconds}`
}

export function ReportsClient({
  user,
  slug,
  plannedWorkouts,
  completedWorkouts,
  members,
}: ReportsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Agrupar performance por atleta
  const athleteStats = useMemo(() => {
    return members
      .map((member) => {
        const athletePlanned = plannedWorkouts.filter(
          (w) => w.author.id === member.userId
        )
        const athleteCompleted = completedWorkouts.filter(
          (w) => w.author.id === member.userId
        )

        const totalPlanned = athletePlanned.length + athleteCompleted.length
        const totalCompleted = athleteCompleted.length

        const adherence =
          totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0

        // Média de precisão de meta (Distância executada vs prescrita)
        // Aqui simplificamos: se ele completou, assumimos que tentou a meta

        return {
          ...member,
          totalPlanned,
          totalCompleted,
          adherence,
          lastWorkout: athleteCompleted[0] || null,
        }
      })
      .sort((a, b) => b.adherence - a.adherence)
  }, [plannedWorkouts, completedWorkouts, members])

  const overallAdherence = useMemo(() => {
    const totalP = athleteStats.reduce(
      (acc, curr) => acc + curr.totalPlanned,
      0
    )
    const totalC = athleteStats.reduce(
      (acc, curr) => acc + curr.totalCompleted,
      0
    )
    return totalP > 0 ? (totalC / totalP) * 100 : 0
  }, [athleteStats])

  const adherenceTrend = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Mês anterior
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Treinos do mês atual
    const currentPlanned = plannedWorkouts.filter((w) => {
      const d = new Date(w.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const currentCompleted = completedWorkouts.filter((w) => {
      const d = new Date(w.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    // Treinos do mês anterior
    const prevPlanned = plannedWorkouts.filter((w) => {
      const d = new Date(w.date)
      return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear
    })
    const prevCompleted = completedWorkouts.filter((w) => {
      const d = new Date(w.date)
      return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear
    })

    const currentTotalPlanned = currentPlanned.length + currentCompleted.length
    const currentAdherence =
      currentTotalPlanned > 0
        ? (currentCompleted.length / currentTotalPlanned) * 100
        : 0

    const prevTotalPlanned = prevPlanned.length + prevCompleted.length
    const prevAdherence =
      prevTotalPlanned > 0 ? (prevCompleted.length / prevTotalPlanned) * 100 : 0

    const diff = currentAdherence - prevAdherence

    return {
      diff,
      hasData: currentTotalPlanned > 0 || prevTotalPlanned > 0,
    }
  }, [plannedWorkouts, completedWorkouts])

  const TYPE_LABELS = {
    EASY: 'Rodagem Leve',
    INTERVAL: 'Intervalado',
    TEMPO: 'Ritmo / Tempo',
    LONG: 'Longão',
    RECOVERY: 'Regenerativo',
  }

  const COLORS = {
    EASY: '#f97316', // Laranja
    INTERVAL: '#ec4899', // Rosa
    TEMPO: '#8b5cf6', // Roxo
    LONG: '#10b981', // Esmeralda
    RECOVERY: '#3b82f6', // Azul
  }

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    completedWorkouts.forEach((w) => {
      const type = w.type
      counts[type] = (counts[type] || 0) + 1
    })

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: COLORS[name as keyof typeof COLORS] || '#6b7280',
    }))
  }, [completedWorkouts])

  const weeklyAdherenceData = useMemo(() => {
    const data = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i * 7)

      const startOfWeek = new Date(d)
      startOfWeek.setDate(d.getDate() - d.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const weeklyPlanned = plannedWorkouts.filter((w) => {
        const date = new Date(w.date)
        return date >= startOfWeek && date < endOfWeek
      }).length

      const weeklyCompleted = completedWorkouts.filter((w) => {
        const date = new Date(w.date)
        return date >= startOfWeek && date < endOfWeek
      }).length

      const totalPlanned = weeklyPlanned + weeklyCompleted
      const weeklyAdherence =
        totalPlanned > 0 ? (weeklyCompleted / totalPlanned) * 100 : 0

      const formattedDate = startOfWeek.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      })

      data.push({
        name: formattedDate,
        aderencia: Math.round(Math.min(Math.max(weeklyAdherence, 0), 100)),
      })
    }
    return data
  }, [plannedWorkouts, completedWorkouts])

  const filteredStats = athleteStats.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* BOTÃO VOLTAR */}
        <div className="mb-6">
          <Link
            href={`/${slug}/dashboard`}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-600 text-xs shadow-sm transition-all hover:bg-gray-50 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar ao Dashboard
          </Link>
        </div>

        {/* HEADER DO RELATÓRIO */}
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-black text-3xl text-gray-900 tracking-tight">
              Performance do{' '}
              <span className="text-glow-orange text-orange-500">Pelotão</span>
            </h1>
            <p className="mt-1 font-medium text-gray-500 text-sm">
              Acompanhe a aderência e evolução dos seus atletas em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pr-4 pl-11 font-bold text-sm shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5"
              />
            </div>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* CARDS DE RESUMO GERAL */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group hover:-translate-y-1 relative overflow-hidden rounded-4xl bg-white p-6 shadow-gray-200/50 shadow-xl transition-all">
            <div className="-translate-y-8 absolute top-0 right-0 h-24 w-24 translate-x-8 rounded-full bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
              Aderência Geral
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-black text-4xl text-gray-900">
                {overallAdherence.toFixed(0)}%
              </span>
              {adherenceTrend.hasData ? (
                adherenceTrend.diff > 0 ? (
                  <span className="font-bold text-green-500 text-xs">
                    +{adherenceTrend.diff.toFixed(0)}% este mês
                  </span>
                ) : adherenceTrend.diff < 0 ? (
                  <span className="font-bold text-red-500 text-xs">
                    {adherenceTrend.diff.toFixed(0)}% este mês
                  </span>
                ) : (
                  <span className="font-bold text-gray-500 text-xs">
                    Estabilidade
                  </span>
                )
              ) : (
                <span className="font-bold text-gray-400 text-xs">
                  Sem dados
                </span>
              )}
            </div>
          </div>

          <div className="group hover:-translate-y-1 relative overflow-hidden rounded-4xl bg-white p-6 shadow-gray-200/50 shadow-xl transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
              Atletas Ativos
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-black text-4xl text-gray-900">
                {members.length}
              </span>
              <span className="font-bold text-gray-500 text-xs">no clube</span>
            </div>
          </div>

          <div className="group hover:-translate-y-1 relative overflow-hidden rounded-4xl bg-white p-6 shadow-gray-200/50 shadow-xl transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
              Treinos Concluídos
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-black text-4xl text-gray-900">
                {completedWorkouts.length}
              </span>
              <span className="font-bold text-gray-400 text-xs">
                total histórico
              </span>
            </div>
          </div>

          <div className="group hover:-translate-y-1 relative overflow-hidden rounded-4xl bg-white p-6 shadow-gray-200/50 shadow-xl transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
              Pendentes (Hoje)
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-black text-4xl text-gray-900">
                {
                  plannedWorkouts.filter(
                    (w) =>
                      new Date(w.date).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </span>
              <span className="font-bold text-red-500 text-xs">
                precisam de atenção
              </span>
            </div>
          </div>
        </div>

        {/* GRÁFICOS INTERATIVOS */}
        {isMounted && (
          <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Gráfico de Aderência Semanal */}
            <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white p-6 shadow-gray-200/50 shadow-xl lg:col-span-2">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-500/5 blur-2xl" />
              <h3 className="relative z-10 mb-6 flex items-center gap-2 font-extrabold text-gray-900">
                <BarChart3 className="h-5 w-5 text-orange-500" /> Aderência do
                Pelotão ao Longo do Tempo
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyAdherenceData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorAderencia"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
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
                      domain={[0, 100]}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderRadius: '1.25rem',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                      labelClassName="text-gray-400 font-medium text-xs mb-1"
                    />
                    <Area
                      type="monotone"
                      dataKey="aderencia"
                      stroke="#f97316"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAderencia)"
                      name="Aderência"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Distribuição por Tipo */}
            <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white p-6 shadow-gray-200/50 shadow-xl">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />
              <h3 className="relative z-10 mb-6 flex items-center gap-2 font-extrabold text-gray-900">
                <Target className="h-5 w-5 text-orange-500" /> Foco de Treino
                (Tipos)
              </h3>
              <div className="relative flex h-72 w-full items-center justify-center">
                {completedWorkouts.length > 0 ? (
                  <>
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#111827',
                              borderRadius: '1.25rem',
                              border: 'none',
                              color: '#fff',
                              fontWeight: 'bold',
                            }}
                            formatter={(value: any, name: any) => [
                              `${value} treinos`,
                              TYPE_LABELS[name as keyof typeof TYPE_LABELS] ||
                                name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pointer-events-none flex flex-col items-center justify-center">
                      <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        Total
                      </span>
                      <span className="font-black text-3xl text-gray-900">
                        {completedWorkouts.length}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-medium text-gray-400 text-sm">
                      Nenhum treino concluído ainda.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TABELA DE PERFORMANCE DOS ATLETAS */}
        <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl shadow-gray-200/20">
          <div className="border-gray-50 border-b bg-gray-50/50 px-8 py-6">
            <h3 className="flex items-center gap-2 font-black text-gray-900 text-lg">
              <Target className="h-5 w-5 text-orange-500" />
              Ranking de Aderência
            </h3>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredStats.map((stat, index) => (
              <div
                key={stat.id}
                className="group flex flex-col gap-6 p-6 transition-all hover:bg-orange-50/30 sm:flex-row sm:items-center"
              >
                {/* INFO ATLETA */}
                <div className="flex min-w-60 items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 font-black text-gray-400 text-sm transition-colors group-hover:bg-orange-500 group-hover:text-white">
                    {index + 1}º
                  </div>
                  <Avatar className="h-14 w-14 border-4 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarImage src={stat.avatarUrl || ''} />
                    <AvatarFallback className="font-bold text-gray-400">
                      {stat.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-gray-900 transition-colors group-hover:text-orange-600">
                      {stat.name}
                    </h4>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Aderência à Planilha
                    </span>
                    <span
                      className={`font-black text-xs ${stat.adherence >= 90 ? 'text-green-500' : stat.adherence >= 70 ? 'text-orange-500' : 'text-red-500'}`}
                    >
                      {stat.adherence.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full transition-all duration-1000 ${stat.adherence >= 90 ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : stat.adherence >= 70 ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'}`}
                      style={{ width: `${stat.adherence}%` }}
                    />
                  </div>
                </div>

                {/* STATUS CARDS */}
                <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-8">
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Treinos
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-gray-900 text-xl">
                        {stat.totalCompleted}
                      </span>
                      <span className="font-bold text-[10px] text-gray-400">
                        / {stat.totalPlanned}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Pace Médio
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-gray-900 text-xl">
                        {formatPace(stat.paceAvg)}
                      </span>
                      <span className="font-bold text-[10px] text-gray-400">
                        /km
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAthlete(stat)}
                    className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-50 px-6 font-bold text-gray-600 transition-all hover:bg-orange-500 hover:text-white active:scale-95"
                  >
                    Detalhes <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredStats.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="font-black text-gray-900 text-xl">
                  Nenhum atleta encontrado
                </h3>
                <p className="mt-1 font-medium text-gray-500 text-sm">
                  Tente ajustar sua busca ou filtros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES DO ATLETA */}
      <AthleteDetailsModal
        isOpen={!!selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        athlete={selectedAthlete}
        completedWorkouts={completedWorkouts}
        plannedWorkouts={plannedWorkouts}
      />
    </div>
  )
}
