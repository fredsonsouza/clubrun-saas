'use client'

import { getWorkoutsAction, requestJoinClubAction } from '@/app/private-actions'
import { CompleteWorkoutModal } from '@/components/complete-workout-modal'
import { Header } from '@/components/header'
import { JoinFeedbackModal } from '@/components/join-feedback-modal'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  TYPE_CONFIG,
  type Workout,
  WorkoutCard,
  type WorkoutType,
} from '@/components/workout-card'
import { CreateWorkoutModal } from '@/components/workout-modal'
import { setCookie } from 'cookies-next'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronRight,
  Flame,
  Loader2,
  MapPin,
  Plus,
  Settings,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useRef, useState } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { deleteWorkoutAction } from './actions'

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
  initialTotalPages: number
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
  myPlannedWorkouts?: Workout[]
  myCompletedWorkouts?: Workout[]
  isStravaConnected?: boolean
}

export function DashboardClient({
  user,
  club,
  userRole,
  isMember,
  initialFeed,
  initialTotalPages,
  ranking,
  members,
  typeStats,
  myPlannedWorkouts = [],
  myCompletedWorkouts = [],
  isStravaConnected = false,
}: DashboardClientProps) {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [feed, setFeed] = useState<Workout[]>(initialFeed)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(1 < initialTotalPages)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreControllerRef = useRef<AbortController | null>(null)
  const feedGenerationRef = useRef(0)
  const activeFeedSlugRef = useRef(club.slug)

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    loadMoreControllerRef.current?.abort()
    const controller = new AbortController()
    const generation = feedGenerationRef.current
    const requestedSlug = club.slug
    loadMoreControllerRef.current = controller
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const result = await getWorkoutsAction({
        slug: requestedSlug,
        page: nextPage,
        limit: 10,
      })

      if (
        controller.signal.aborted ||
        generation !== feedGenerationRef.current ||
        requestedSlug !== activeFeedSlugRef.current
      ) {
        return
      }

      const newWorkoutsFormatted = result.workouts.map((w: any) => ({
        id: w.id,
        title:
          w.title || (w.type === 'EASY' ? 'Rodagem Leve' : 'Treino de Corrida'),
        description: w.notes || '',
        distance: w.distance,
        durationInSeconds: w.duration || 0,
        type: w.type as any,
        visibility: w.visibility as 'PUBLIC' | 'COACH_ONLY' | 'PRIVATE',
        status: w.status as any,
        assignmentMode: w.assignmentMode as any,
        createdAt:
          typeof w.date === 'string' ? w.date : new Date(w.date).toISOString(),
        targetDistance: w.targetDistance,
        targetDuration: w.targetDuration,
        syncSource: w.syncSource,
        stravaActivityId: w.stravaActivityId,
        routeData: w.routeData,
        reactions: w.reactions || [],
        currentUserReaction: w.currentUserReaction,
        author: {
          id: w.athlete.id,
          name: w.athlete.name || 'Atleta',
          avatarUrl: w.athlete.avatarUrl,
        },
        club: {
          name: club.name || '',
          slug: club.slug,
          avatarUrl: club.avatarUrl || null,
        },
      }))

      setFeed((prev) => [...prev, ...newWorkoutsFormatted])
      setPage(nextPage)
      setHasMore(nextPage < result.meta.totalPages)
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('Erro ao carregar mais atividades:', error)
        toast.error('Não foi possível carregar mais atividades.')
      }
    } finally {
      if (loadMoreControllerRef.current === controller) {
        loadMoreControllerRef.current = null
        setIsLoadingMore(false)
      }
    }
  }
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Tab & Calendar States
  const [activeTab, setActiveTab] = useState<'feed' | 'agenda'>('feed')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate()

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Days from previous month to fill the first week row
    const prevMonthTotalDays = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Days from next month to pad the grid (multiple of 7)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentMonth])

  const workoutsByDay = useMemo(() => {
    const map: Record<string, { planned: Workout[]; completed: Workout[] }> = {}

    const allUserWorkouts = [
      ...(myPlannedWorkouts || []),
      ...(myCompletedWorkouts || []),
    ]

    allUserWorkouts.forEach((w) => {
      const dateStr = w.date || w.createdAt
      if (!dateStr) return
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) {
        map[key] = { planned: [], completed: [] }
      }
      if (w.status === 'PLANNED') {
        map[key].planned.push(w)
      } else {
        map[key].completed.push(w)
      }
    })

    return map
  }, [myPlannedWorkouts, myCompletedWorkouts])

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>(
    'success'
  )
  const [isPendingState, setIsPendingState] = useState(false)

  const handleJoinRequest = async () => {
    try {
      await requestJoinClubAction(club.slug)
      setIsPendingState(true)
      setFeedbackType('success')
      setIsFeedbackOpen(true)
    } catch (err) {
      console.error(err)
      setFeedbackType('error')
      setIsFeedbackOpen(true)
    }
  }

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

  useEffect(() => {
    activeFeedSlugRef.current = club.slug
    feedGenerationRef.current += 1
    loadMoreControllerRef.current?.abort()
    loadMoreControllerRef.current = null
    setFeed(initialFeed)
    setPage(1)
    setHasMore(initialTotalPages > 1)
    setIsLoadingMore(false)

    return () => loadMoreControllerRef.current?.abort()
  }, [club.slug, initialFeed, initialTotalPages])

  const _currentUserId = 'usr-1'

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* VOLTAR PARA EXPLORAR (Breadcrumb/Action) */}
        <div className="mb-6">
          <Link
            href="/explore"
            className="group flex w-fit items-center gap-2 font-bold text-gray-400 text-xs transition-colors hover:text-orange-500"
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
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-gray-200/50 shadow-xl">
          {/* Banner de Fundo */}
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            {club.bannerUrl ? (
              <img
                src={club.bannerUrl}
                alt="Banner do Clube"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-r from-orange-400 via-orange-500 to-orange-600">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

            {/* Overlay de Info no Banner (Mobile Friendly) */}
            <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between md:right-10 md:bottom-8 md:left-48">
              <div className="flex flex-col gap-1">
                <span className="font-black text-[10px] text-orange-400 uppercase tracking-[0.2em] drop-shadow-sm">
                  PELOTÃO OFICIAL
                </span>
                <h1 className="font-black text-3xl text-white tracking-tight drop-shadow-md md:text-5xl">
                  {club.name}
                </h1>
              </div>

              {/* Stats Rápidas no Banner */}
              <div className="hidden items-center gap-6 md:flex">
                <div className="text-right">
                  <p className="font-bold text-[10px] text-white/70 uppercase tracking-wider">
                    Membros
                  </p>
                  <p className="font-black text-white text-xl">
                    {club.membersCount}
                  </p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-right">
                  <p className="font-bold text-[10px] text-white/70 uppercase tracking-wider">
                    Distância (Mês)
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-orange-400 text-xl">
                      {club.monthlyDistance % 1 === 0
                        ? club.monthlyDistance.toFixed(0)
                        : club.monthlyDistance.toFixed(1).replace('.', ',')}
                    </span>
                    <span className="font-bold text-[10px] text-white/70">
                      km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Ações Inferior */}
          <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-10">
            {/* Logo do Clube (Sobreposto) */}
            <div className="-top-12 -translate-x-1/2 absolute left-1/2 md:left-10 md:translate-x-0">
              <div className="group relative">
                <div className="h-24 w-24 overflow-hidden rounded-[1.5rem] border-4 border-white bg-white shadow-2xl transition-transform duration-300 group-hover:scale-105 md:h-32 md:w-32">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage
                      src={club.avatarUrl || ''}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none bg-orange-50 font-black text-2xl text-orange-500 md:text-4xl">
                      {club.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="-right-2 -bottom-2 absolute flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-lg">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="mt-12 flex-1 pt-2 text-center md:mt-0 md:pl-38 md:text-left">
              <p className="max-w-2xl font-medium text-gray-500 text-sm leading-relaxed">
                {club.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 font-black text-[10px] text-gray-400 uppercase tracking-widest md:justify-start">
                <span className="flex items-center gap-1.5 transition-colors hover:text-orange-500">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />{' '}
                  {club.location}
                </span>
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1.5 transition-colors hover:text-orange-500">
                  <Activity className="h-3.5 w-3.5 text-orange-500" /> Ativo
                  Recentemente
                </span>
                {isMember &&
                  (userRole === 'OWNER' ||
                    userRole === 'ADMIN' ||
                    userRole === 'MANAGER' ||
                    userRole === 'COACH') && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-gray-300" />
                      <Link
                        href={`/${club.slug}/dashboard/reports`}
                        className="flex items-center gap-1.5 font-black text-orange-500 transition-colors hover:text-orange-600"
                      >
                        <BarChart3 className="h-3.5 w-3.5" /> RELATÓRIOS DE
                        PERFORMANCE
                      </Link>
                    </>
                  )}
                {isMember &&
                  (userRole === 'OWNER' ||
                    userRole === 'ADMIN' ||
                    userRole === 'MANAGER') && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-gray-300" />
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
                  type="submit"
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 font-black text-sm text-white shadow-gray-900/10 shadow-xl transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-95"
                >
                  <Plus className="h-5 w-5" /> REGISTRAR TREINO
                </button>
              ) : isPendingState ? (
                <button
                  type="submit"
                  disabled
                  className="flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-orange-50 px-8 py-4 font-black text-orange-500 text-sm"
                >
                  <Loader2 className="h-5 w-5 animate-spin" /> SOLICITAÇÃO
                  PENDENTE
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleJoinRequest}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 font-black text-sm text-white shadow-orange-500/20 shadow-xl transition-all hover:bg-orange-600 active:scale-95"
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
          {/* COLUNA ESQUERDA: Feed de Treinos ou Agenda (70%) */}
          <div className="space-y-6 lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-2xl bg-gray-100 p-1">
                <button
                  type="submit"
                  onClick={() => setActiveTab('feed')}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-black text-sm transition-all ${activeTab === 'feed' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Users className="h-4 w-4" /> PELOTÃO
                </button>
                <button
                  type="submit"
                  onClick={() => setActiveTab('agenda')}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-black text-sm transition-all ${activeTab === 'agenda' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Calendar className="h-4 w-4" /> MINHA AGENDA
                </button>
              </div>
            </div>

            {activeTab === 'feed' ? (
              <>
                {feed.filter((w) => w.status === 'COMPLETED').length > 0 ? (
                  feed
                    .filter((w) => w.status === 'COMPLETED')
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
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 border-dashed bg-white px-4 py-16 text-center">
                    <Flame className="mb-4 h-10 w-10 text-gray-300" />
                    <h3 className="mb-1 font-extrabold text-gray-900 text-lg">
                      O feed está vazio
                    </h3>
                    <p className="font-medium text-gray-500 text-sm">
                      Seja o primeiro a registrar um treino e motivar o pelotão!
                    </p>
                  </div>
                )}

                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-50 py-4 font-bold text-orange-500 text-sm transition-colors hover:bg-orange-100 hover:text-orange-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar mais atividades'
                    )}
                  </button>
                )}

                {!hasMore &&
                  feed.filter((w) => w.status === 'COMPLETED').length > 0 && (
                    <p className="py-6 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">
                      Você chegou ao fim das atividades do pelotão! 🏁
                    </p>
                  )}
              </>
            ) : (
              <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm">
                {/* Calendar Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-black text-gray-900 text-lg capitalize">
                    {currentMonth.toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      onClick={handlePrevMonth}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 font-bold text-gray-600 text-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                    >
                      ◀
                    </button>
                    <button
                      type="submit"
                      onClick={handleNextMonth}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 font-bold text-gray-600 text-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                  {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(
                    (day) => (
                      <span
                        key={day}
                        className="font-black text-[10px] text-gray-400 uppercase"
                      >
                        {day}
                      </span>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map(({ date, isCurrentMonth }, idx) => {
                    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                    const dayData = workoutsByDay[dayKey] || {
                      planned: [],
                      completed: [],
                    }
                    const hasPlanned = dayData.planned.length > 0
                    const hasCompleted = dayData.completed.length > 0
                    const isSelected =
                      selectedDay &&
                      selectedDay.getDate() === date.getDate() &&
                      selectedDay.getMonth() === date.getMonth() &&
                      selectedDay.getFullYear() === date.getFullYear()

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(date)}
                        className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border transition-all active:scale-95 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/30 text-orange-600 ring-2 ring-orange-500/25'
                            : isCurrentMonth
                              ? 'border-gray-50 bg-gray-50/30 text-gray-800 hover:bg-gray-50'
                              : 'border-transparent text-gray-300 hover:bg-gray-50/20'
                        }`}
                      >
                        <span className="font-extrabold text-sm">
                          {date.getDate()}
                        </span>

                        {/* Indicators */}
                        <div className="absolute bottom-1.5 flex gap-1">
                          {hasCompleted && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-emerald-500/30 shadow-sm" />
                          )}
                          {hasPlanned && (
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-orange-500/30 shadow-sm" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Selected Day Details */}
                {selectedDay && (
                  <div className="mt-8 border-gray-100 border-t pt-6">
                    <h4 className="mb-4 font-black text-gray-400 text-xs uppercase tracking-wider">
                      Agenda para{' '}
                      {selectedDay.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h4>
                    {(() => {
                      const dayKey = `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`
                      const dayData = workoutsByDay[dayKey] || {
                        planned: [],
                        completed: [],
                      }
                      const totalWorkouts =
                        dayData.planned.length + dayData.completed.length

                      if (totalWorkouts === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 border-dashed bg-gray-50/30 py-6">
                            <p className="mb-4 font-semibold text-gray-400 text-xs italic">
                              Nenhum treino agendado ou realizado para este dia.
                            </p>
                            <button
                              onClick={() => setIsWorkoutModalOpen(true)}
                              className="flex cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-black text-white text-xs shadow-sm transition-all hover:bg-orange-600 active:scale-95"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {userRole === 'COACH' ||
                              userRole === 'OWNER' ||
                              userRole === 'ADMIN'
                                ? 'PRESCREVER TREINO'
                                : 'REGISTRAR TREINO'}
                            </button>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-4">
                          {dayData.planned.map((w) => (
                            <div
                              key={w.id}
                              className="relative rounded-2xl border border-orange-200 bg-orange-50/20 p-4"
                            >
                              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-orange-500 px-2 py-0.5 font-black text-[9px] text-white uppercase shadow-sm">
                                Meta Planejada
                              </div>
                              <h5 className="pr-20 font-extrabold text-gray-900">
                                {w.title}
                              </h5>
                              <p className="mt-1 font-medium text-gray-500 text-xs">
                                {w.description}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex gap-4 font-bold text-gray-600 text-xs">
                                  <span>Distância: {w.distance} km</span>
                                  {w.durationInSeconds > 0 && (
                                    <span>
                                      Tempo:{' '}
                                      {Math.floor(w.durationInSeconds / 60)} min
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedWorkout(w)
                                    setIsCompleteModalOpen(true)
                                  }}
                                  className="rounded-xl bg-orange-500 px-4 py-2 font-black text-white text-xs transition-all hover:bg-orange-600 active:scale-95"
                                >
                                  FINALIZAR
                                </button>
                              </div>
                            </div>
                          ))}

                          {dayData.completed.map((w) => (
                            <WorkoutCard
                              key={w.id}
                              workout={w}
                              currentUserId={user.id}
                              userRole={userRole}
                              onDelete={(id) => setWorkoutToDelete(id)}
                            />
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: Sidebar (30%) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Widget: Resumo de Atividades por Tipo */}
            <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />
              <h3 className="relative z-10 mb-6 flex items-center gap-2 font-extrabold text-gray-900">
                <BarChart3 className="h-5 w-5 text-orange-500" /> Resumo do
                Clube
              </h3>
              <div className="relative z-10 grid grid-cols-2 gap-3">
                {typeStats.map((stat) => {
                  const config =
                    TYPE_CONFIG[stat.type as WorkoutType] || TYPE_CONFIG.EASY
                  return (
                    <div
                      key={stat.type}
                      className={`rounded-2xl border p-4 transition-all hover:scale-[1.02] ${config.borderColor} ${config.bgColor}`}
                    >
                      <span
                        className={`block font-black text-[10px] uppercase tracking-wider ${config.color} mb-1`}
                      >
                        {config.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-black text-2xl ${config.color}`}>
                          {stat.count}
                        </span>
                        <span
                          className={`font-bold text-[10px] ${config.color} opacity-70`}
                        >
                          TREINOS
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Widget: Lista de Membros */}
            <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
              <div className="relative z-10 mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Users className="h-5 w-5 text-orange-500" /> Membros do Clube
                </h3>
                <span className="font-black text-[10px] text-gray-400 uppercase tracking-wider">
                  {club.membersCount} TOTAL
                </span>
              </div>
              <div className="relative z-10 space-y-3">
                {members.slice(0, 5).map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.userId}`}
                    className="group/member flex cursor-pointer items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-gray-100 transition-transform group-hover/member:scale-105">
                        <AvatarImage src={member.avatarUrl || ''} />
                        <AvatarFallback className="font-bold text-gray-400 text-xs">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="line-clamp-1 font-bold text-gray-900 text-sm transition-colors group-hover/member:text-orange-500">
                          {member.name}
                        </span>
                        <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                          {member.role === 'OWNER'
                            ? 'Fundador'
                            : member.role === 'MANAGER'
                              ? 'Gestor'
                              : 'Atleta'}
                        </span>
                      </div>
                    </div>
                    {member.role === 'OWNER' && (
                      <Flame
                        className="h-4 w-4 text-orange-500"
                        fill="currentColor"
                      />
                    )}
                  </Link>
                ))}
                {members.length > 5 && (
                  <button className="mt-2 w-full cursor-pointer py-2 font-bold text-gray-400 text-xs transition-colors hover:text-gray-600">
                    Ver todos os membros
                  </button>
                )}
              </div>
            </div>

            {/* Widget: Mini Ranking */}
            <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Trophy className="h-5 w-5 text-orange-500" /> Top Mensal
                </h3>
                <Link
                  href={`/${club.slug}/ranking`}
                  className="flex cursor-pointer items-center font-bold text-orange-500 text-xs hover:text-orange-600"
                >
                  Ver todo <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="relative z-10 space-y-4">
                {ranking.map((athlete, index) => (
                  <Link
                    key={athlete.id}
                    href={`/profile/${athlete.id}`}
                    className={`group/ranking flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${athlete.isMe ? 'border border-orange-100/50 bg-orange-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div
                      className={`w-5 text-center font-black italic ${index === 0 ? 'text-amber-500 text-lg' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}
                    >
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 border border-gray-200 bg-white transition-transform group-hover/ranking:scale-105">
                      <AvatarImage src={athlete.avatarUrl || ''} />
                      <AvatarFallback className="font-bold text-gray-400 text-xs">
                        {athlete.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-bold text-sm transition-colors group-hover/ranking:text-orange-500 ${athlete.isMe ? 'text-orange-600' : 'text-gray-900'}`}
                      >
                        {athlete.name}{' '}
                        {athlete.isMe && (
                          <span className="font-normal">(Você)</span>
                        )}
                      </p>
                      <p className="font-bold font-mono text-gray-500 text-xs">
                        {athlete.distance % 1 === 0
                          ? athlete.distance.toFixed(0)
                          : athlete.distance.toFixed(1).replace('.', ',')}{' '}
                        km
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
        defaultDate={
          activeTab === 'agenda' && selectedDay ? selectedDay : undefined
        }
        onClose={() => setIsWorkoutModalOpen(false)}
        onSuccess={() => {
          setIsWorkoutModalOpen(false)
        }}
      />
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE TREINO */}
      <Dialog
        open={!!workoutToDelete}
        onOpenChange={(open) => !open && setWorkoutToDelete(null)}
      >
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
            <p className="mt-2 font-medium text-gray-500 text-sm leading-relaxed">
              Esta ação é irreversível e os pontos gerados por esta atividade
              serão removidos do ranking mensal do clube.
            </p>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3">
            <button
              onClick={() => setWorkoutToDelete(null)}
              className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white px-6 py-4 font-bold text-gray-600 text-sm transition-all hover:bg-gray-50 active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteWorkout}
              disabled={isDeleting}
              className="flex-[1.5] cursor-pointer rounded-2xl bg-red-600 px-6 py-4 font-black text-sm text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
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

      <JoinFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        type={feedbackType}
        clubName={club.name}
      />

      <CompleteWorkoutModal
        isOpen={isCompleteModalOpen}
        workout={selectedWorkout}
        isStravaConnected={isStravaConnected}
        onClose={() => setIsCompleteModalOpen(false)}
        onSuccess={() => {
          // Re-load of dashboard values handles refresh automatically via Next Server Actions
        }}
      />
    </div>
  )
}
