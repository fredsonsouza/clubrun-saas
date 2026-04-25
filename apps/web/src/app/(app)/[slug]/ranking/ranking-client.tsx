'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Trophy, Activity, ArrowLeft, Calendar, Medal } from 'lucide-react'
import { Header } from '@/components/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface RankingAthlete {
  id: string
  name: string
  avatarUrl: string | null
  distance: number
  pace: string
  workoutsCount: number
}

interface RankingClientProps {
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
  ranking: RankingAthlete[]
}

export function RankingClient({
  user,
  club,
  ranking,
}: RankingClientProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  const top3 = ranking.slice(0, 3)
  const restOfRanking = ranking.slice(3)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        
        {/* VOLTAR PARA DASHBOARD */}
        <div className="mb-8">
          <Link 
            href={`/${club.slug}/dashboard`} 
            className="group flex w-fit items-center gap-2 text-xs font-bold text-gray-400 transition-colors hover:text-orange-500"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors group-hover:border-orange-200 group-hover:bg-orange-50">
              <ArrowLeft className="h-3 w-3" />
            </div>
            VOLTAR PARA O CLUBE
          </Link>
        </div>

        {/* CABEÇALHO E FILTROS */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
              <Medal className="h-4 w-4" /> Performance do Clube
            </div>
            <h1 className="mb-2 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Quadro de Líderes
            </h1>
            <p className="max-w-md text-sm font-medium text-gray-500">
              Acompanhe quem está dominando o asfalto em <strong className="text-gray-900">{club.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`cursor-pointer rounded-xl px-5 py-2 text-xs font-black uppercase tracking-wider transition-all ${period === p ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PÓDIO (TOP 3) */}
        {top3.length >= 3 && (
          <div className="mx-auto mb-12 grid max-w-4xl grid-cols-3 items-end gap-2 px-2 sm:gap-8">
            
            {/* 2º LUGAR (PRATA) */}
            <Link 
              href={`/profile/${top3[1].id}`}
              className="group cursor-pointer relative flex h-[240px] flex-col items-center justify-end rounded-t-[2rem] border border-b-0 border-gray-100 bg-white p-4 pt-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
            >
              <div className="absolute top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-black text-gray-500 italic shadow-inner">
                2
              </div>
              <div className="z-10 mb-4 h-16 w-16 overflow-hidden rounded-full border-4 border-gray-50 bg-white shadow-md transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                <Avatar className="h-full w-full">
                  <AvatarImage src={top3[1].avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="text-lg font-bold text-gray-400">{top3[1].name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <p className="mb-1 w-full truncate px-1 text-center text-xs font-black text-gray-900 uppercase tracking-tight sm:text-sm">
                {top3[1].name}
              </p>
              <p className="font-mono text-2xl font-black text-gray-400">
                {top3[1].distance.toFixed(1)}<span className="ml-0.5 text-xs font-bold">km</span>
              </p>
              <div className="mt-2 h-1.5 w-12 rounded-full bg-gray-100" />
            </Link>

            {/* 1º LUGAR (OURO) */}
            <Link 
              href={`/profile/${top3[0].id}`}
              className="group cursor-pointer relative flex h-[320px] flex-col items-center justify-end rounded-t-[3rem] bg-gradient-to-b from-gray-900 to-gray-800 p-4 pt-10 text-white shadow-2xl shadow-orange-500/10 transition-all hover:-translate-y-2"
            >
              <div className="absolute -top-6 z-20 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg animate-bounce-subtle">
                <Trophy className="h-8 w-8" fill="currentColor" />
              </div>
              <div className="z-10 mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-xl transition-transform group-hover:scale-110 sm:h-28 sm:w-28">
                <Avatar className="h-full w-full">
                  <AvatarImage src={top3[0].avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold text-gray-400">{top3[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <p className="mb-1 w-full truncate px-2 text-center text-sm font-black uppercase tracking-widest text-orange-400 sm:text-base">
                {top3[0].name}
              </p>
              <p className="font-mono text-4xl font-black">
                {top3[0].distance.toFixed(1)}<span className="ml-1 text-sm font-bold text-orange-500">km</span>
              </p>
              <div className="mt-4 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                <Activity className="h-3.5 w-3.5 text-orange-500" /> {top3[0].pace} /KM
              </div>
            </Link>

            {/* 3º LUGAR (BRONZE) */}
            <Link 
              href={`/profile/${top3[2].id}`}
              className="group cursor-pointer relative flex h-[220px] flex-col items-center justify-end rounded-t-[2rem] border border-b-0 border-gray-100 bg-white p-4 pt-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
            >
              <div className="absolute top-4 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 font-black text-amber-700 italic shadow-inner">
                3
              </div>
              <div className="z-10 mb-4 h-14 w-14 overflow-hidden rounded-full border-4 border-amber-50 bg-white shadow-md transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
                <Avatar className="h-full w-full">
                  <AvatarImage src={top3[2].avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="text-lg font-bold text-gray-400">{top3[2].name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <p className="mb-1 w-full truncate px-1 text-center text-xs font-black text-gray-900 uppercase tracking-tight sm:text-sm">
                {top3[2].name}
              </p>
              <p className="font-mono text-xl font-black text-amber-700/60">
                {top3[2].distance.toFixed(1)}<span className="ml-0.5 text-[10px] font-bold">km</span>
              </p>
              <div className="mt-2 h-1.5 w-10 rounded-full bg-amber-50" />
            </Link>
          </div>
        )}

        {/* TABELA DO RESTO DO RANKING */}
        <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-gray-50 bg-gray-50/50 p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="col-span-2 text-center sm:col-span-1">#</div>
            <div className="col-span-7 sm:col-span-5">Atleta</div>
            <div className="col-span-3 text-right sm:col-span-3">Distância</div>
            <div className="col-span-3 hidden justify-end sm:flex">Pace Médio</div>
          </div>

          <div className="divide-y divide-gray-50">
            {restOfRanking.map((athlete, index) => {
              const position = index + 4
              const isMe = athlete.id === user.id

              return (
                <Link
                  key={athlete.id}
                  href={`/profile/${athlete.id}`}
                  className={`cursor-pointer group grid grid-cols-12 items-center gap-4 p-5 transition-all hover:bg-gray-50 sm:p-6 ${isMe ? 'bg-orange-50/20' : ''}`}
                >
                  <div className="col-span-2 text-center text-lg font-black text-gray-300 italic group-hover:text-gray-400 sm:col-span-1">
                    {position}
                  </div>

                  <div className="col-span-7 flex items-center gap-4 sm:col-span-5">
                    <Avatar className="h-10 w-10 border border-gray-100 bg-white transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
                      <AvatarImage src={athlete.avatarUrl || ''} className="object-cover" />
                      <AvatarFallback className="text-xs font-bold text-gray-400">{athlete.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-extrabold sm:text-base ${isMe ? 'text-orange-600' : 'text-gray-900'} group-hover:text-orange-500 transition-colors`}>
                        {athlete.name}
                        {isMe && <span className="ml-2 rounded-lg bg-orange-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-600">Você</span>}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {athlete.workoutsCount} atividades registradas
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 text-right sm:col-span-3">
                    <span className="font-mono text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                      {athlete.distance.toFixed(1)}
                    </span>
                    <span className="ml-1 text-[10px] font-black uppercase text-gray-400 sm:text-xs">
                      km
                    </span>
                  </div>

                  <div className="col-span-3 hidden items-center justify-end gap-2 text-right sm:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-600">
                      {athlete.pace} <span className="text-[10px] font-bold text-gray-400">/KM</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* MENSAGEM DE INCENTIVO */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm border border-gray-100">
            <Trophy className="h-5 w-5 text-amber-500" />
            <p className="text-sm font-bold text-gray-600">
              O ranking é atualizado em tempo real. <span className="text-orange-500">Bons treinos!</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
