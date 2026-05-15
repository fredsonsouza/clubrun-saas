'use client'

import React, { useMemo, useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  ChevronRight,
  Filter,
  BarChart3,
  Target
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Header } from '@/components/header'

interface Workout {
  id: string
  distance: number
  type: string
  status: 'PLANNED' | 'COMPLETED'
  createdAt: string
  author: {
    id: string
    name: string
    avatarUrl?: string | null
  }
}

interface ReportsClientProps {
  slug: string
  plannedWorkouts: Workout[]
  completedWorkouts: Workout[]
  members: any[]
}

export function ReportsClient({
  slug,
  plannedWorkouts,
  completedWorkouts,
  members,
}: ReportsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Agrupar performance por atleta
  const athleteStats = useMemo(() => {
    return members.map(member => {
      const athletePlanned = plannedWorkouts.filter(w => w.author.id === member.userId)
      const athleteCompleted = completedWorkouts.filter(w => w.author.id === member.userId)
      
      const totalPlanned = athletePlanned.length + athleteCompleted.length
      const totalCompleted = athleteCompleted.length
      
      const adherence = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0
      
      // Média de precisão de meta (Distância executada vs prescrita)
      // Aqui simplificamos: se ele completou, assumimos que tentou a meta
      
      return {
        ...member,
        totalPlanned,
        totalCompleted,
        adherence,
        lastWorkout: athleteCompleted[0] || null
      }
    }).sort((a, b) => b.adherence - a.adherence)
  }, [plannedWorkouts, completedWorkouts, members])

  const filteredStats = athleteStats.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const overallAdherence = useMemo(() => {
    const totalP = athleteStats.reduce((acc, curr) => acc + curr.totalPlanned, 0)
    const totalC = athleteStats.reduce((acc, curr) => acc + curr.totalCompleted, 0)
    return totalP > 0 ? (totalC / totalP) * 100 : 0
  }, [athleteStats])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* HEADER DO RELATÓRIO */}
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Performance do <span className="text-orange-500 text-glow-orange">Pelotão</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Acompanhe a aderência e evolução dos seus atletas em tempo real.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar atleta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5"
                />
             </div>
             <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
               <Filter className="h-5 w-5" />
             </button>
          </div>
        </header>

        {/* CARDS DE RESUMO GERAL */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">Aderência Geral</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">{overallAdherence.toFixed(0)}%</span>
              <span className="text-xs font-bold text-green-500">+2% este mês</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">Atletas Ativos</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">{members.length}</span>
              <span className="text-xs font-bold text-gray-500">no clube</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">Treinos Concluídos</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">{completedWorkouts.length}</span>
              <span className="text-xs font-bold text-gray-400">total histórico</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">Pendentes (Hoje)</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">
                {plannedWorkouts.filter(w => new Date(w.createdAt).toDateString() === new Date().toDateString()).length}
              </span>
              <span className="text-xs font-bold text-red-500">precisam de atenção</span>
            </div>
          </div>
        </div>

        {/* TABELA DE PERFORMANCE DOS ATLETAS */}
        <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl shadow-gray-200/20">
          <div className="border-b border-gray-50 bg-gray-50/50 px-8 py-6">
             <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
               <Target className="h-5 w-5 text-orange-500" />
               Ranking de Aderência
             </h3>
          </div>
          
          <div className="divide-y divide-gray-50">
            {filteredStats.map((stat, index) => (
              <div key={stat.id} className="group flex flex-col gap-6 p-6 transition-all hover:bg-orange-50/30 sm:flex-row sm:items-center">
                
                {/* INFO ATLETA */}
                <div className="flex min-w-[240px] items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-black text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {index + 1}º
                  </div>
                  <Avatar className="h-14 w-14 border-4 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarImage src={stat.avatarUrl || ''} />
                    <AvatarFallback className="font-bold text-gray-400">{stat.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">{stat.name}</h4>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Aderência à Planilha</span>
                    <span className={`text-xs font-black ${stat.adherence >= 90 ? 'text-green-500' : stat.adherence >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Treinos</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-gray-900">{stat.totalCompleted}</span>
                      <span className="text-[10px] font-bold text-gray-400">/ {stat.totalPlanned}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pace Médio</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-gray-900">4:50</span>
                      <span className="text-[10px] font-bold text-gray-400">/km</span>
                    </div>
                  </div>

                  <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gray-50 px-6 font-bold text-gray-600 transition-all hover:bg-orange-500 hover:text-white active:scale-95">
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
                 <h3 className="text-xl font-black text-gray-900">Nenhum atleta encontrado</h3>
                 <p className="mt-1 text-sm font-medium text-gray-500">Tente ajustar sua busca ou filtros.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
