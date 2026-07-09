'use client'

import { Header } from '@/components/header'
import { RankingShareModal } from '@/components/ranking-share-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getClubRanking } from '@/http/get-club-ranking'
import {
  Activity,
  ArrowLeft,
  Calendar,
  Loader2,
  Medal,
  Share2,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'

interface RankingAthlete {
  id: string
  name: string
  avatarUrl: string | null
  distance: number
  pace: string
  workoutsCount: number
}

function formatKm(km: number): string {
  const formatted = km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)
  return formatted.replace('.', ',')
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
  initialRankings: (RankingAthlete & {
    points: number
    isMe: boolean
    position: number
  })[]
}

export function RankingClient({
  user,
  club,
  initialRankings,
}: RankingClientProps) {
  const [ranking, setRanking] = useState(initialRankings)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    let isCurrent = true

    // Se for o estado inicial com 'month', não precisamos refazer a requisição no primeiro render
    if (period === 'month' && ranking === initialRankings) {
      return
    }

    const fetchRanking = async () => {
      setIsLoading(true)
      try {
        const typeMap = {
          week: 'weekly',
          month: 'monthly',
          year: 'yearly',
        } as const

        const { rankings } = await getClubRanking({
          slug: club.slug,
          type: typeMap[period],
        })

        if (!isCurrent) return

        const formatted = rankings.map((r, index) => {
          const paceAvg = (r as any).paceAvg || 0
          const mins = Math.floor(paceAvg)
          const secs = Math.round((paceAvg - mins) * 60)
          const formattedPace =
            paceAvg > 0
              ? `${mins}:${secs.toString().padStart(2, '0')}`
              : '--:--'

          return {
            id: r.athlete.id,
            name: r.athlete.name || 'Atleta',
            avatarUrl: r.athlete.avatarUrl,
            distance: r.distance || 0,
            workoutsCount: r.workoutsCount || 0,
            points: r.points,
            pace: formattedPace,
            isMe: r.athlete.id === user.id,
            position: index + 1,
          }
        })

        setRanking(formatted)
      } catch (err) {
        console.error('Erro ao buscar rankings:', err)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    fetchRanking()

    return () => {
      isCurrent = false
    }
  }, [period, club.slug, user.id, initialRankings])

  const top3 = ranking.slice(0, 3)
  const restOfRanking = ranking.slice(3)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* VOLTAR PARA DASHBOARD */}
        <div className="mb-8">
          <Link
            href={`/${club.slug}/dashboard`}
            className="group flex w-fit items-center gap-2 font-bold text-gray-400 text-xs transition-colors hover:text-orange-500"
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
            <div className="mb-4 flex items-center gap-2 font-black text-[10px] text-orange-500 uppercase tracking-widest">
              <Medal className="h-4 w-4" /> Performance do Clube
            </div>
            <h1 className="mb-2 flex items-center gap-3 font-extrabold text-3xl text-gray-900 tracking-tight md:text-4xl">
              Quadro de Líderes
              {isLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              )}
            </h1>
            <p className="max-w-md font-medium text-gray-500 text-sm">
              Acompanhe quem está dominando o asfalto em{' '}
              <strong className="text-gray-900">{club.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ranking.length > 0 && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-black text-gray-500 text-xs uppercase tracking-wider shadow-xs transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500 active:scale-95"
              >
                <Share2 className="h-4 w-4" /> Compartilhar Pódio
              </button>
            )}

            <div className="flex rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={isLoading}
                  className={`cursor-pointer rounded-xl px-5 py-2 font-black text-xs uppercase tracking-wider transition-all ${period === p ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:text-gray-900'} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PÓDIO E LISTAGEM */}
        <div
          className={`transition-all duration-300 ${isLoading ? 'pointer-events-none opacity-40' : ''}`}
        >
          {/* PÓDIO (TOP 3) */}
          {top3.length > 0 && (
            <div className="mx-auto mb-12 grid max-w-4xl grid-cols-3 items-end gap-2 px-2 sm:gap-8">
              {/* 2º LUGAR (PRATA) */}
              {top3.length >= 2 ? (
                <Link
                  href={`/profile/${top3[1].id}`}
                  className="group relative flex h-60 cursor-pointer flex-col items-center justify-end rounded-t-4xl border border-gray-100 border-b-0 bg-white p-4 pt-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
                >
                  <div className="absolute top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-black text-gray-500 italic shadow-inner">
                    2
                  </div>
                  <div className="z-10 mb-4 h-16 w-16 overflow-hidden rounded-full border-4 border-gray-50 bg-white shadow-md transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={top3[1].avatarUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="font-bold text-gray-400 text-lg">
                        {top3[1].name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="mb-1 w-full truncate px-1 text-center font-black text-gray-900 text-xs uppercase tracking-tight sm:text-sm">
                    {top3[1].name}
                  </p>
                  <p className="font-black font-mono text-2xl text-gray-400">
                    {formatKm(top3[1].distance)}
                    <span className="ml-0.5 font-bold text-xs">km</span>
                  </p>
                  <div className="mt-2 h-1.5 w-12 rounded-full bg-gray-100" />
                </Link>
              ) : (
                <div className="hidden h-60 sm:block" />
              )}

              {/* 1º LUGAR (OURO) */}
              {top3.length >= 1 && (
                <Link
                  href={`/profile/${top3[0].id}`}
                  className="group hover:-translate-y-2 relative flex h-80 cursor-pointer flex-col items-center justify-end rounded-t-[3rem] bg-linear-to-b from-gray-900 to-gray-800 p-4 pt-10 text-white shadow-2xl shadow-orange-500/10 transition-all"
                >
                  <div className="-top-6 absolute z-20 flex h-16 w-16 animate-bounce-subtle items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg">
                    <Trophy className="h-8 w-8" fill="currentColor" />
                  </div>
                  <div className="z-10 mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-xl transition-transform group-hover:scale-110 sm:h-28 sm:w-28">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={top3[0].avatarUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="font-bold text-2xl text-gray-400">
                        {top3[0].name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="mb-1 w-full truncate px-2 text-center font-black text-orange-400 text-sm uppercase tracking-widest sm:text-base">
                    {top3[0].name}
                  </p>
                  <p className="font-black font-mono text-4xl">
                    {formatKm(top3[0].distance)}
                    <span className="ml-1 font-bold text-orange-500 text-sm">
                      km
                    </span>
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest backdrop-blur-sm">
                    <Activity className="h-3.5 w-3.5 text-orange-500" />{' '}
                    {top3[0].pace} /KM
                  </div>
                </Link>
              )}

              {/* 3º LUGAR (BRONZE) */}
              {top3.length >= 3 ? (
                <Link
                  href={`/profile/${top3[2].id}`}
                  className="group relative flex h-[220px] cursor-pointer flex-col items-center justify-end rounded-t-4xl border border-gray-100 border-b-0 bg-white p-4 pt-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
                >
                  <div className="absolute top-4 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 font-black text-amber-700 italic shadow-inner">
                    3
                  </div>
                  <div className="z-10 mb-4 h-14 w-14 overflow-hidden rounded-full border-4 border-amber-50 bg-white shadow-md transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={top3[2].avatarUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="font-bold text-gray-400 text-lg">
                        {top3[2].name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="mb-1 w-full truncate px-1 text-center font-black text-gray-900 text-xs uppercase tracking-tight sm:text-sm">
                    {top3[2].name}
                  </p>
                  <p className="font-black font-mono text-amber-700/60 text-xl">
                    {formatKm(top3[2].distance)}
                    <span className="ml-0.5 font-bold text-[10px]">km</span>
                  </p>
                  <div className="mt-2 h-1.5 w-10 rounded-full bg-amber-50" />
                </Link>
              ) : (
                <div className="hidden h-[220px] sm:block" />
              )}
            </div>
          )}

          {/* TABELA DE POSIÇÕES COMPLETA */}
          <div className="overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-gray-50 border-b bg-gray-50/50 p-5 font-black text-[10px] text-gray-400 uppercase tracking-widest">
              <div className="col-span-2 text-center sm:col-span-1">#</div>
              <div className="col-span-7 sm:col-span-5">Atleta</div>
              <div className="col-span-3 text-right sm:col-span-3">
                Distância
              </div>
              <div className="col-span-3 hidden justify-end sm:flex">
                Pace Médio
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {ranking.map((athlete, index) => {
                const position = index + 1
                const isMe = athlete.id === user.id

                return (
                  <Link
                    key={athlete.id}
                    href={`/profile/${athlete.id}`}
                    className={`group grid cursor-pointer grid-cols-12 items-center gap-4 p-5 transition-all hover:bg-gray-50 sm:p-6 ${isMe ? 'bg-orange-50/20' : ''}`}
                  >
                    <div className="col-span-2 text-center font-black text-gray-300 text-lg italic group-hover:text-gray-400 sm:col-span-1">
                      {position}
                    </div>

                    <div className="col-span-7 flex items-center gap-4 sm:col-span-5">
                      <Avatar className="h-10 w-10 border border-gray-100 bg-white transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
                        <AvatarImage
                          src={athlete.avatarUrl || ''}
                          className="object-cover"
                        />
                        <AvatarFallback className="font-bold text-gray-400 text-xs">
                          {athlete.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p
                          className={`truncate font-extrabold text-sm sm:text-base ${isMe ? 'text-orange-600' : 'text-gray-900'} transition-colors group-hover:text-orange-500`}
                        >
                          {athlete.name}
                          {isMe && (
                            <span className="ml-2 rounded-lg bg-orange-100 px-2 py-0.5 font-black text-[9px] text-orange-600 uppercase tracking-widest">
                              Você
                            </span>
                          )}
                        </p>
                        <p className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                          {athlete.workoutsCount} atividades registradas
                        </p>
                      </div>
                    </div>

                    <div className="col-span-3 text-right sm:col-span-3">
                      <span className="font-black font-mono text-gray-900 text-xl tracking-tight sm:text-2xl">
                        {formatKm(athlete.distance)}
                      </span>
                      <span className="ml-1 font-black text-[10px] text-gray-400 uppercase sm:text-xs">
                        km
                      </span>
                    </div>

                    <div className="col-span-3 hidden items-center justify-end gap-2 text-right sm:flex">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-300 transition-colors group-hover:bg-orange-50 group-hover:text-orange-500">
                        <Activity className="h-4 w-4" />
                      </div>
                      <span className="font-bold font-mono text-gray-600 text-sm">
                        {athlete.pace}{' '}
                        <span className="font-bold text-[10px] text-gray-400">
                          /KM
                        </span>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* MENSAGEM DE INCENTIVO */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <Trophy className="h-5 w-5 text-amber-500" />
            <p className="font-bold text-gray-600 text-sm">
              O ranking é atualizado em tempo real.{' '}
              <span className="text-orange-500">Bons treinos!</span>
            </p>
          </div>
        </div>
      </main>

      <RankingShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        clubName={club.name}
        clubSlug={club.slug}
        period={period}
        topAthletes={ranking}
      />
    </div>
  )
}
