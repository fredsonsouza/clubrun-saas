'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  MapPin,
  Flag,
  Plus,
  Users,
  ChevronRight,
  Medal,
  Activity,
  Search,
  ArrowRight,
  Trophy,
} from 'lucide-react'
import { Header } from '@/components/header'

interface Race {
  id: string
  name: string
  date: string
  location: string
  distances: string[]
  registeredCount: number
  status: 'UPCOMING' | 'COMPLETED'
  clubAvatar?: string | null
}

interface RacesClientProps {
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
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
  upcomingRaces: Race[]
  pastRaces: Race[]
}

export function RacesClient({
  user,
  club,
  userRole,
  upcomingRaces,
  pastRaces,
}: RacesClientProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')

  const displayedRaces = (activeTab === 'upcoming' ? upcomingRaces : pastRaces).filter(
    (race) => race.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const canManage = userRole === 'OWNER' || userRole === 'MANAGER' || userRole === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        
        {/* CABEÇALHO */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
              <Activity className="h-4 w-4" /> Planejamento de Provas
            </div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Calendário <span className="text-orange-500">Target</span>
            </h1>
            <p className="max-w-md text-sm font-medium text-gray-500">
              Acompanhe os eventos onde o <strong className="text-gray-900">{club.name}</strong> estará presente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManage && (
              <button className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95">
                <Plus className="h-5 w-5" /> Adicionar Prova
              </button>
            )}
          </div>
        </div>

        {/* CONTROLES (Busca e Abas) */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 rounded-[1.25rem] border border-gray-100 bg-white p-1.5 shadow-sm md:w-auto">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`cursor-pointer flex-1 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider transition-all md:flex-none ${activeTab === 'upcoming' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Próximas Provas
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`cursor-pointer flex-1 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider transition-all md:flex-none ${activeTab === 'past' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Resultados
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar prova..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-white py-3.5 pr-4 pl-11 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
            />
          </div>
        </div>

        {/* GRID DE PROVAS */}
        {displayedRaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {displayedRaces.map((race) => (
              <Link
                key={race.id}
                href={`/${club.slug}/races/${race.id}`}
                className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-1 transition-all hover:border-orange-200 hover:shadow-2xl"
              >
                <div className="flex flex-col h-full bg-white rounded-[2rem] p-6 sm:p-8">
                  <div className="mb-6 flex items-start justify-between">
                    {/* Data Badge */}
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100 transition-transform group-hover:scale-110">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                        {race.date.split(' ')[1]}
                      </span>
                      <span className="text-2xl font-black leading-none">
                        {race.date.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex-1">
                    <h3 className="mb-2 text-2xl font-black tracking-tight text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {race.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <MapPin className="h-4 w-4 text-orange-500" /> {race.location}
                    </div>
                  </div>

                  <div className="mt-auto space-y-6">
                    {/* Distâncias Chips */}
                    <div className="flex flex-wrap gap-2">
                      {race.distances.map((dist) => (
                        <span
                          key={dist}
                          className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-gray-600"
                        >
                          {dist}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200">
                              <img src={`https://i.pravatar.cc/150?u=${race.id}-${i}`} className="h-full w-full rounded-full object-cover" alt="" />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                          {race.registeredCount} Atletas
                        </span>
                      </div>

                      {activeTab === 'past' && (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600">
                          <Trophy className="h-3.5 w-3.5" /> Ver Resultados
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-white py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-300">
              <CalendarDays className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-gray-900">
              {searchQuery ? 'Nenhuma prova encontrada para sua busca' : 'O horizonte está livre'}
            </h3>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-gray-500">
              {activeTab === 'upcoming'
                ? 'Ainda não foram definidas provas-alvo. Que tal sugerir uma ao treinador?'
                : 'Ainda não temos resultados registrados no histórico deste clube.'}
            </p>
            {canManage && !searchQuery && (
              <button className="mt-8 cursor-pointer flex items-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95">
                <Plus className="h-5 w-5" /> Cadastrar Primeira Prova
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
