'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Flame,
  MapPin,
  Plus,
  Trophy,
  Users,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { Header } from '@/components/header'
import { WorkoutCard, Workout } from '@/components/workout-card'
import { CreateWorkoutModal } from '@/components/workout-modal'
import { setCookie } from 'cookies-next'
import { useEffect } from 'react'

interface DashboardClientProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
  club: {
    id: string
    name: string
    slug: string
    description: string | null
    membersCount: number
    location: string
    monthlyDistance: number
  }
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
  initialFeed: Workout[]
  ranking: Array<{
    id: string
    name: string
    avatarUrl: string | null
    distance: number
    isMe?: boolean
  }>
}

export function DashboardClient({
  user,
  club,
  userRole,
  initialFeed,
  ranking,
}: DashboardClientProps) {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [feed, setFeed] = useState<Workout[]>(initialFeed)

  useEffect(() => {
    // Sincroniza o cookie de clube ativo com o clube atual do dashboard
    setCookie('club', club.slug)
  }, [club.slug])

  const currentUserId = 'usr-1' // Idealmente viria do perfil, mas manteremos o mock por enquanto para o feed

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* ==========================================
            BANNER DO CLUBE (Resumo Global)
        ========================================== */}
        <div className="relative mb-8 flex flex-col items-center justify-between overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:p-8 gap-6">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

          <div className="z-10 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-3xl font-black text-gray-400">
              {club.name.charAt(0)}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-center gap-3 md:justify-start">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                  {club.name}
                </h1>
                {userRole === 'OWNER' && (
                  <Link
                    href={`/${club.slug}/settings`}
                    className="rounded-lg bg-gray-50 p-1.5 text-gray-400 transition-colors hover:text-gray-900"
                    title="Configurações do Clube"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
              </div>
              <p className="mb-3 max-w-2xl text-sm font-medium text-gray-500 line-clamp-2">
                {club.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-gray-500 md:justify-start">
                <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" /> {club.location}
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                  <Users className="h-3.5 w-3.5 text-gray-400" />{' '}
                  {club.membersCount} Membros
                </span>
              </div>
            </div>
          </div>

          <div className="z-10 flex shrink-0 flex-col items-center md:items-end">
            <span className="mb-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Distância do Clube (Mês)
            </span>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-black tracking-tight text-orange-500">
                {club.monthlyDistance}
              </span>
              <span className="text-sm font-bold text-orange-400">km</span>
            </div>
            <button
              onClick={() => setIsWorkoutModalOpen(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-95 md:w-auto"
            >
              <Plus className="h-4 w-4" /> Registrar Treino
            </button>
          </div>
        </div>

        {/* ==========================================
            LAYOUT PRINCIPAL (Feed + Sidebar)
        ========================================== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* COLUNA ESQUERDA: Feed de Treinos (70%) */}
          <div className="space-y-6 lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
                <Activity className="h-5 w-5 text-orange-500" /> Atividades
                Recentes
              </h2>
            </div>

            {feed.length > 0 ? (
              feed.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  currentUserId={currentUserId}
                  userRole={userRole}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                <Flame className="mb-4 h-10 w-10 text-gray-300" />
                <h3 className="mb-1 text-lg font-extrabold text-gray-900">
                  O feed está vazio
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  Seja o primeiro a registrar um treino e motivar o pelotão!
                </p>
              </div>
            )}

            <button className="w-full cursor-pointer rounded-xl bg-orange-50 py-4 text-sm font-bold text-orange-500 transition-colors hover:bg-orange-100 hover:text-orange-600">
              Carregar mais atividades
            </button>
          </div>

          {/* COLUNA DIREITA: Sidebar (30%) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Widget: Mini Ranking */}
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Trophy className="h-5 w-5 text-orange-500" /> Top Mensal
                </h3>
                <Link
                  href={`/${club.slug}/ranking`}
                  className="flex items-center text-xs font-bold text-orange-500 hover:text-orange-600"
                >
                  Ver todo <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="relative z-10 space-y-4">
                {ranking.map((athlete, index) => (
                  <div
                    key={athlete.id}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${athlete.isMe ? 'border border-orange-100/50 bg-orange-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div
                      className={`w-5 text-center font-black italic ${index === 0 ? 'text-lg text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}
                    >
                      {index + 1}
                    </div>
                    {athlete.avatarUrl ? (
                      <img
                        src={athlete.avatarUrl}
                        alt={athlete.name}
                        className="h-10 w-10 rounded-full border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 font-bold text-gray-400">
                        {athlete.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold ${athlete.isMe ? 'text-orange-600' : 'text-gray-900'}`}
                      >
                        {athlete.name}{' '}
                        {athlete.isMe && (
                          <span className="font-normal">(Você)</span>
                        )}
                      </p>
                      <p className="font-mono text-xs font-bold text-gray-500">
                        {athlete.distance.toFixed(1)} km
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget: Status Pessoal (Upsell/Engajamento) */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 p-6 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
              <h3 className="relative z-10 text-lg font-extrabold mb-2">
                Sua Meta Pessoal
              </h3>
              <p className="relative z-10 mb-6 text-sm font-medium text-gray-400">
                Você está a 15km de bater seu recorde do mês passado. Continue
                acelerando!
              </p>

              <div className="relative z-10 mb-2 h-2 w-full rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: '85%' }}
                ></div>
              </div>
              <div className="relative z-10 flex justify-between text-xs font-bold text-gray-400">
                <span>85 km</span>
                <span>Meta: 100 km</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE TREINO */}
      <CreateWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSuccess={(newWorkout) => {
          setFeed([newWorkout, ...feed])
          setIsWorkoutModalOpen(false)
        }}
      />
    </div>
  )
}
