'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  Medal,
  Trophy,
  Activity,
  Flag,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SubmitResultModal } from '@/components/submit-result-modal'

interface RaceDetailClientProps {
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
  race: {
    id: string
    name: string
    description: string | null
    date: string
    location: string
    distances: string[]
    status: 'UPCOMING' | 'COMPLETED'
    hasSubmittedResult: boolean
  }
  results: Array<{
    id: string
    athlete: {
      id: string
      name: string
      avatarUrl: string | null
    }
    time: string
    pace: string
    distance: string
  }>
}

export function RaceDetailClient({
  user,
  club,
  race,
  results,
}: RaceDetailClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(race.hasSubmittedResult)
  const [selectedDistance, setSelectedDistance] = useState(race.distances[race.distances.length - 1])

  const filteredResults = results.filter((r) => r.distance === selectedDistance)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-6xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* NAVEGAÇÃO */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/${club.slug}/races`}
            className="group flex items-center gap-2 text-xs font-black tracking-widest text-gray-400 uppercase transition-colors hover:text-orange-500"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors group-hover:border-orange-200 group-hover:bg-orange-50">
              <ArrowLeft className="h-3 w-3" />
            </div>
            Calendário do Clube
          </Link>
        </div>

        {/* HERO BANNER */}
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
          <div className="relative h-48 bg-gray-900 sm:h-64">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-8 right-8">
              {race.status === 'COMPLETED' ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                  <Medal className="h-4 w-4" /> Concluída
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                  <CalendarDays className="h-4 w-4" /> Em Breve
                </div>
              )}
            </div>
          </div>

          <div className="relative -mt-20 flex flex-col justify-between gap-8 px-6 pb-10 sm:-mt-24 md:flex-row md:items-end md:px-12">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white p-1 shadow-xl ring-1 ring-gray-100">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Flag className="h-7 w-7" />
                  </div>
                </div>
                <div className="pt-8 md:pt-4">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                    {race.name}
                  </h1>
                </div>
              </div>
              
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <p className="text-base font-medium leading-relaxed text-gray-500 md:text-lg">
                    {race.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-orange-500" /> {race.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" /> {race.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3">
              {race.status === 'COMPLETED' ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={hasSubmitted}
                  className={`cursor-pointer flex h-16 items-center justify-center gap-3 rounded-2xl px-10 font-black tracking-widest uppercase transition-all shadow-lg ${hasSubmitted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'}`}
                >
                  {hasSubmitted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Resultado Enviado
                    </>
                  ) : (
                    <>
                      <Trophy className="h-5 w-5" /> Enviar Resultado
                    </>
                  )}
                </button>
              ) : (
                <button className="cursor-pointer flex h-16 items-center justify-center gap-3 rounded-2xl bg-gray-900 px-10 font-black tracking-widest uppercase text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95">
                  <Users className="h-5 w-5" /> Vou Participar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          
          {/* Seletor de Distâncias */}
          <div className="space-y-3 lg:col-span-3">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Categorias
            </h3>
            <div className="space-y-1">
              {race.distances.map((dist) => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistance(dist)}
                  className={`cursor-pointer flex w-full items-center justify-between rounded-[1.25rem] px-5 py-4 text-sm font-black transition-all ${selectedDistance === dist ? 'bg-white text-orange-600 shadow-md shadow-orange-500/5 ring-1 ring-gray-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                >
                  <span>{dist}</span>
                  {selectedDistance === dist && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quadro de Resultados / Participantes */}
          <div className="lg:col-span-9">
            <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">
                    {race.status === 'COMPLETED' ? 'Quadro de Resultados' : 'Atletas Confirmados'}
                    <span className="ml-2 font-mono text-orange-500">— {selectedDistance}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-xs ring-1 ring-gray-100">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> {filteredResults.length} TOTAL
                </div>
              </div>

              {filteredResults.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredResults.map((result, index) => (
                    <Link
                      key={result.id}
                      href={`/profile/${result.athlete.id}`}
                      className="cursor-pointer group grid grid-cols-12 items-center gap-4 p-6 transition-colors hover:bg-gray-50/50 sm:px-8"
                    >
                      <div className="col-span-2 text-center text-xl font-black text-gray-200 italic transition-colors group-hover:text-orange-200 sm:col-span-1">
                        {index + 1}
                      </div>

                      <div className="col-span-10 flex items-center gap-4 sm:col-span-6">
                        <Avatar className="h-12 w-12 border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                          <AvatarImage src={result.athlete.avatarUrl || ''} className="object-cover" />
                          <AvatarFallback className="font-bold text-gray-400">{result.athlete.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-gray-900 group-hover:text-orange-500 transition-colors">
                            {result.athlete.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Medal className="h-3.5 w-3.5 text-amber-500" /> Finalista
                          </div>
                        </div>
                      </div>

                      <div className="col-span-6 flex flex-col items-end text-right sm:col-span-3">
                        <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-300">
                          <Clock className="h-3 w-3" /> Tempo Final
                        </span>
                        <span className="font-mono text-xl font-black tracking-tight text-gray-900">
                          {result.time}
                        </span>
                      </div>

                      <div className="col-span-6 flex flex-col items-end text-right sm:col-span-2">
                        <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-300">
                          Pace
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-base font-bold text-gray-500">
                            {result.pace}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">/km</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Nenhum resultado registrado ainda</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500">Seja o primeiro do seu clube a submeter o tempo para {selectedDistance}!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SubmitResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        raceDistances={race.distances}
        onSuccess={() => {
          setHasSubmitted(true)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
