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
  UserPlus,
  BarChart3,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Header } from '@/components/header'
import { WorkoutCard, Workout, TYPE_CONFIG, WorkoutType } from '@/components/workout-card'
import { CreateWorkoutModal } from '@/components/workout-modal'
import { setCookie } from 'cookies-next'
import { useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { deleteWorkoutAction } from './actions'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DashboardClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  club: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    bannerUrl: string | null
    description: string | null
    membersCount: number
    location: string
    monthlyDistance: number
  }
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  isMember: boolean
  initialFeed: Workout[]
  ranking: Array<{
    id: string
    name: string
    avatarUrl: string | null
    distance: number
    isMe?: boolean
  }>
  members: Array<{
    id: string
    userId: string
    name: string
    avatarUrl: string | null
    role: string
  }>
  typeStats: Array<{
    type: string
    count: number
  }>
}

export function DashboardClient({
  user,
  club,
  userRole,
  isMember,
  initialFeed,
  ranking,
  members,
  typeStats,
}: DashboardClientProps) {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [feed, setFeed] = useState<Workout[]>(initialFeed)
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return

    setIsDeleting(true)
    const result = await deleteWorkoutAction({
      slug: club.slug,
      workoutId: workoutToDelete,
    })

    if (result.success) {
      toast.success(result.message)
      setFeed(feed.filter((w) => w.id !== workoutToDelete))
      setWorkoutToDelete(null)
    } else {
      toast.error(result.message)
    }
    setIsDeleting(false)
  }

  useEffect(() => {
    // Sincroniza o cookie de clube ativo com o clube atual do dashboard
    setCookie('club', club.slug)
  }, [club.slug])

  const currentUserId = 'usr-1'

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        
        {/* VOLTAR PARA EXPLORAR (Breadcrumb/Action) */}
        <div className="mb-6">
          <Link 
            href="/explore" 
            className="group flex w-fit items-center gap-2 text-xs font-bold text-gray-400 transition-colors hover:text-orange-500"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors group-hover:border-orange-200 group-hover:bg-orange-50">
              <ArrowLeft className="h-3 w-3" />
            </div>
            VOLTAR PARA EXPLORAR CLUBES
          </Link>
        </div>

        {/* ==========================================
            CABEÇALHO PREMIUM DO CLUBE
        ========================================== */}
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
          {/* Banner de Fundo */}
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            {club.bannerUrl ? (
              <img 
                src={club.bannerUrl} 
                alt="Banner do Clube" 
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Overlay de Info no Banner (Mobile Friendly) */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between md:bottom-8 md:left-48 md:right-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 drop-shadow-sm">
                  PELOTÃO OFICIAL
                </span>
                <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl drop-shadow-md">
                  {club.name}
                </h1>
              </div>
              
              {/* Stats Rápidas no Banner */}
              <div className="hidden items-center gap-6 md:flex">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Membros</p>
                  <p className="text-xl font-black text-white">{club.membersCount}</p>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Distância (Mês)</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-orange-400">{club.monthlyDistance.toFixed(1)}</span>
                    <span className="text-[10px] font-bold text-white/70">km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Ações Inferior */}
          <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-10">
            {/* Logo do Clube (Sobreposto) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
              <div className="relative group">
                <div className="h-24 w-24 overflow-hidden rounded-[1.5rem] border-4 border-white bg-white shadow-2xl transition-transform duration-300 group-hover:scale-105 md:h-32 md:w-32">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={club.avatarUrl || ''} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-orange-50 text-2xl font-black text-orange-500 md:text-4xl">
                      {club.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-lg">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="mt-12 flex-1 pt-2 text-center md:mt-0 md:pl-38 md:text-left">
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
                {club.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 md:justify-start">
                <span className="flex items-center gap-1.5 transition-colors hover:text-orange-500">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" /> {club.location}
                </span>
                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                <span className="flex items-center gap-1.5 transition-colors hover:text-orange-500">
                  <Activity className="h-3.5 w-3.5 text-orange-500" /> Ativo Recentemente
                </span>
                {isMember && (userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'COACH') && (
                  <>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <Link
                      href={`/${club.slug}/dashboard/reports`}
                      className="flex items-center gap-1.5 text-orange-500 font-black transition-colors hover:text-orange-600"
                    >
                      <BarChart3 className="h-3.5 w-3.5" /> RELATÓRIOS DE PERFORMANCE
                    </Link>
                  </>
                )}
                {isMember && (userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MANAGER') && (
                  <>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <Link
                      href={`/${club.slug}/settings`}
                      className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-900"
                    >
                      <Settings className="h-3.5 w-3.5" /> GERENCIAR CLUBE
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 md:w-auto md:flex-row">
              {isMember ? (
                <button
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-black text-white shadow-xl shadow-gray-900/10 transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-95"
                >
                  <Plus className="h-5 w-5" /> REGISTRAR TREINO
                </button>
              ) : (
                <button
                  className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
                >
                  <UserPlus className="h-5 w-5" /> PARTICIPAR DO CLUBE
                </button>
              )}
            </div>
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

            {feed.filter(w => w.status === 'COMPLETED').length > 0 ? (
              feed
                .filter(w => w.status === 'COMPLETED')
                .map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    currentUserId={user.id}
                    userRole={userRole}
                    onDelete={(id) => setWorkoutToDelete(id)}
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
            
            {/* Widget: Resumo de Atividades por Tipo */}
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />
              <h3 className="relative z-10 mb-6 flex items-center gap-2 font-extrabold text-gray-900">
                <BarChart3 className="h-5 w-5 text-orange-500" /> Resumo do Clube
              </h3>
              <div className="relative z-10 grid grid-cols-2 gap-3">
                {typeStats.map((stat) => {
                  const config = TYPE_CONFIG[stat.type as WorkoutType] || TYPE_CONFIG.EASY
                  return (
                    <div key={stat.type} className={`rounded-2xl border p-4 transition-all hover:scale-[1.02] ${config.borderColor} ${config.bgColor}`}>
                      <span className={`block text-[10px] font-black uppercase tracking-wider ${config.color} mb-1`}>
                        {config.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${config.color}`}>{stat.count}</span>
                        <span className={`text-[10px] font-bold ${config.color} opacity-70`}>TREINOS</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Widget: Lista de Membros */}
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
              <div className="relative z-10 mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Users className="h-5 w-5 text-orange-500" /> Membros do Clube
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {club.membersCount} TOTAL
                </span>
              </div>
              <div className="relative z-10 space-y-3">
                {members.slice(0, 5).map((member) => (
                  <Link 
                    key={member.id} 
                    href={`/profile/${member.userId}`}
                    className="cursor-pointer group/member flex items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-gray-100 transition-transform group-hover/member:scale-105">
                        <AvatarImage src={member.avatarUrl || ''} />
                        <AvatarFallback className="text-xs font-bold text-gray-400">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 line-clamp-1 group-hover/member:text-orange-500 transition-colors">{member.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {member.role === 'OWNER' ? 'Fundador' : member.role === 'MANAGER' ? 'Gestor' : 'Atleta'}
                        </span>
                      </div>
                    </div>
                    {member.role === 'OWNER' && (
                      <Flame className="h-4 w-4 text-orange-500" fill="currentColor" />
                    )}
                  </Link>
                ))}
                {members.length > 5 && (
                  <button className="cursor-pointer w-full mt-2 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    Ver todos os membros
                  </button>
                )}
              </div>
            </div>

            {/* Widget: Mini Ranking */}
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Trophy className="h-5 w-5 text-orange-500" /> Top Mensal
                </h3>
                <Link
                  href={`/${club.slug}/ranking`}
                  className="cursor-pointer flex items-center text-xs font-bold text-orange-500 hover:text-orange-600"
                >
                  Ver todo <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="relative z-10 space-y-4">
                {ranking.map((athlete, index) => (
                  <Link
                    key={athlete.id}
                    href={`/profile/${athlete.id}`}
                    className={`cursor-pointer group/ranking flex items-center gap-3 rounded-xl p-3 transition-colors ${athlete.isMe ? 'border border-orange-100/50 bg-orange-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div
                      className={`w-5 text-center font-black italic ${index === 0 ? 'text-lg text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}
                    >
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 border border-gray-200 bg-white transition-transform group-hover/ranking:scale-105">
                      <AvatarImage src={athlete.avatarUrl || ''} />
                      <AvatarFallback className="text-xs font-bold text-gray-400">
                        {athlete.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold group-hover/ranking:text-orange-500 transition-colors ${athlete.isMe ? 'text-orange-600' : 'text-gray-900'}`}
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
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* MODAL DE TREINO */}
      <CreateWorkoutModal
        isOpen={isWorkoutModalOpen}
        slug={club.slug}
        userRole={userRole}
        members={members}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSuccess={() => {
          setIsWorkoutModalOpen(false)
        }}
      />
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE TREINO */}
      <Dialog open={!!workoutToDelete} onOpenChange={(open) => !open && setWorkoutToDelete(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="pt-4 text-base">
                Tem certeza que deseja remover este treino?
              </DialogDescription>
              <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">
                Esta ação é irreversível e os pontos gerados por esta atividade serão removidos do ranking mensal do clube.
              </p>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-3">
              <button
                onClick={() => setWorkoutToDelete(null)}
                className="cursor-pointer flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteWorkout}
                disabled={isDeleting}
                className="cursor-pointer flex-[1.5] rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    EXCLUINDO...
                  </div>
                ) : (
                  'CONFIRMAR EXCLUSÃO'
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
