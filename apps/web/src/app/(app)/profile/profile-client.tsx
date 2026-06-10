'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  MapPin,
  Calendar,
  Activity,
  Timer,
  Edit3,
  Link as LinkIcon,
  Instagram,
  Target,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Navigation,
  Crown,
  Lock,
  Flame,
  Watch,
  QrCode,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Header } from '@/components/header'
import { WorkoutCard, Workout } from '@/components/workout-card'
import { ShoeIcon } from '@/components/shoe-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UpdateProfileModal } from '@/components/update-profile-modal'
import { ProfileShareModal } from '@/components/profile-share-modal'
import { CompleteWorkoutModal } from '@/components/complete-workout-modal'
import { RescheduleWorkoutModal } from '@/components/reschedule-workout-modal'
import {
  deleteWorkoutAction,
  connectStravaAction,
  disconnectStravaAction,
} from './actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ProfileClientProps {
  currentUser: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  athleteProfile: {
    bio: string | null
    city: string | null
    weight: number | null
    height: number | null
    gender: string | null
    birthDate: string
    instagramUrl: string | null
    stravaUrl: string | null
    coverUrl: string | null
    shoes?: string | null
    shoesMaxDistance?: number | null
    shoesRemainingDistance?: number | null
    watch?: string | null
    hasMedicalConditions?: boolean
    medicalConditions?: string | null
    isPublic?: boolean
    isStravaConnected?: boolean
    isPremium?: boolean
  } | null
  stats: {
    avgPace: number
    totalDistance: number
    totalWorkouts: number
  }
  workouts: Workout[]
  plannedWorkouts: Workout[]
  isOwnProfile: boolean
  token?: string
}

function formatPace(pace: number): string {
  if (!pace || pace === 0) return '0:00'
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters.toFixed(0)} m`
}

export function ProfileClient({
  currentUser,
  user,
  athleteProfile,
  workouts,
  plannedWorkouts,
  stats,
  isOwnProfile,
  token,
}: ProfileClientProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'activities' | 'planned' | 'evolution'
  >('activities')

  const [isOAuthDialogOpen, setIsOAuthDialogOpen] = useState(false)
  const [isStravaActionLoading, setIsStravaActionLoading] = useState(false)

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const apiPremium = athleteProfile?.isPremium || false
    const storedSubscribed =
      localStorage.getItem('clubrun:athlete_subscribed') === 'true'
    setIsSubscribed(apiPremium || storedSubscribed)
  }, [athleteProfile])

  // Gráficos de Evolução Pessoal
  const evolutionData = useMemo(() => {
    // Ordenar treinos concluídos por data crescente
    const completed = [...workouts]
      .filter((w) => w.status === 'COMPLETED')
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

    return completed
      .map((w, idx) => {
        // Calcular pace do treino em formato decimal (minutos por km)
        const durMin = (w.durationInSeconds ?? 0) / 60
        const dist = w.distance || 1
        const paceDecimal = durMin / dist

        const dateStr = w.createdAt
          ? new Date(w.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })
          : ''

        return {
          name: `T${idx + 1}`,
          pace: Number(paceDecimal.toFixed(2)),
          distancia: Number(w.distance.toFixed(1)),
          data: dateStr,
        }
      })
      .slice(-10) // Mostrar últimos 10 treinos reais
  }, [workouts])

  // Recordes pessoais (Calculados dos treinos reais do atleta)
  const personalRecords = useMemo(() => {
    const completed = workouts.filter((w) => w.status === 'COMPLETED')
    if (completed.length === 0) {
      return {
        maxDistance: '0.0 km',
        bestPace: '0:00 /km',
        totalVolume: '0.0 km',
      }
    }

    let maxDist = 0
    let bestPaceDecimal = Infinity
    let totalKm = 0

    completed.forEach((w) => {
      totalKm += w.distance
      if (w.distance > maxDist) maxDist = w.distance

      const durMin = (w.durationInSeconds ?? 0) / 60
      const dist = w.distance || 1
      const paceDecimal = durMin / dist
      if (paceDecimal > 0 && paceDecimal < bestPaceDecimal) {
        bestPaceDecimal = paceDecimal
      }
    })

    const mins = Math.floor(bestPaceDecimal)
    const secs = Math.round((bestPaceDecimal - mins) * 60)
    const bestPaceStr =
      bestPaceDecimal !== Infinity
        ? `${mins}:${String(secs).padStart(2, '0')}`
        : '0:00'

    return {
      maxDistance: `${maxDist.toFixed(1)} km`,
      bestPace: `${bestPaceStr} /km`,
      totalVolume: `${totalKm.toFixed(1)} km`,
    }
  }, [workouts])

  const handleConnectStrava = () => {
    setIsOAuthDialogOpen(true)
  }

  const handleConfirmOAuth = async () => {
    setIsOAuthDialogOpen(false)
    setIsStravaActionLoading(true)
    const result = await connectStravaAction()
    if (result.success) {
      toast.success(
        'Strava conectado com sucesso! Agora você pode importar seus treinos.'
      )
    } else {
      toast.error(result.message || 'Erro ao conectar ao Strava.')
    }
    setIsStravaActionLoading(false)
  }

  const handleDisconnectStrava = async () => {
    setIsStravaActionLoading(true)
    const result = await disconnectStravaAction()
    if (result.success) {
      toast.success('Strava desconectado.')
    } else {
      toast.error(result.message || 'Erro ao desconectar do Strava.')
    }
    setIsStravaActionLoading(false)
  }

  // Cálculo de Progresso do Perfil
  const profileProgress = useMemo(() => {
    if (!athleteProfile) return 0
    let score = 0
    if (user.name) score += 15
    if (user.avatarUrl) score += 15
    if (athleteProfile.bio) score += 20
    if (athleteProfile.city) score += 15
    if (athleteProfile.weight) score += 10
    if (athleteProfile.height) score += 10
    if (athleteProfile.instagramUrl || athleteProfile.stravaUrl) score += 15
    return Math.min(score, 100)
  }, [user, athleteProfile])

  const isProfileIncomplete = isOwnProfile && profileProgress < 100

  const handleOpenCompleteModal = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsCompleteModalOpen(true)
  }

  const handleOpenRescheduleModal = (workoutId: string) => {
    const workout = plannedWorkouts.find((w) => w.id === workoutId)
    if (workout) {
      setSelectedWorkout(workout)
      setIsRescheduleModalOpen(true)
    }
  }

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return
    setIsDeleting(true)
    const result = await deleteWorkoutAction({
      slug: workoutToDelete.club.slug,
      workoutId: workoutToDelete.id,
    })

    if (result.success) {
      toast.success(result.message)
      setWorkoutToDelete(null)
    } else {
      toast.error(result.message)
    }
    setIsDeleting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={currentUser} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* BARRA DE PROGRESSO DO PERFIL (Apenas se próprio e incompleto) */}
        {isOwnProfile && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${profileProgress === 100 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
                >
                  {profileProgress === 100 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Activity className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {profileProgress === 100
                      ? 'Perfil Completo!'
                      : 'Complete seu perfil'}
                  </h4>
                  <p className="text-xs font-medium text-gray-400">
                    {profileProgress === 100
                      ? 'Sua jornada no Club Run está devidamente documentada.'
                      : 'Preencha seus dados para melhorar sua experiência.'}
                  </p>
                </div>
              </div>
              <span className="text-lg font-black text-orange-500">
                {profileProgress}%
              </span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${profileProgress}%` }}
              />
            </div>

            {profileProgress < 100 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!athleteProfile?.bio && (
                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                    Bio pendente
                  </span>
                )}
                {!athleteProfile?.city && (
                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                    Localização pendente
                  </span>
                )}
                {!athleteProfile?.weight && (
                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                    Dados físicos
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* BANNER E CABEÇALHO DO PERFIL */}
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
          {/* Capa Dinâmica */}
          <div
            className="relative h-48 bg-linear-to-r from-orange-400 via-orange-500 to-orange-600 sm:h-64"
            style={
              athleteProfile?.coverUrl
                ? {
                    backgroundImage: `url(${athleteProfile.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

          <div className="relative px-6 pb-8 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="-mt-20 flex flex-col items-center gap-6 md:-mt-24 md:flex-row md:items-end">
                <div className="group relative z-10">
                  <div
                    className={`relative h-36 w-36 rounded-full border-4 border-white bg-white shadow-2xl transition-transform duration-300 group-hover:scale-105 ${isProfileIncomplete ? 'ring-4 ring-orange-400 ring-offset-4 ring-offset-white' : ''}`}
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={user.avatarUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl font-black text-gray-400">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-500 shadow-md"
                    title="Atleta Verificado"
                  >
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="pb-2 text-center md:text-left">
                  <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
                    {user.name || 'Atleta Sem Nome'}
                  </h1>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase md:justify-start">
                    <MapPin className="h-3 w-3 text-orange-500" />{' '}
                    {athleteProfile?.city || 'Localização não definida'}
                  </p>
                </div>
              </div>

              {/* STATS BAR (Last 30 days) */}
              <div className="flex items-center justify-center gap-4 border-t border-gray-50 pt-6 md:border-t-0 md:pt-0">
                <div className="flex items-center gap-8 rounded-3xl bg-gray-50/80 px-8 py-4 backdrop-blur-sm">
                  <div className="text-center">
                    <span className="mb-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">
                      <Timer className="h-3 w-3 text-orange-500" /> Pace{' '}
                      <span className="text-[7px] text-gray-300">(30d)</span>
                    </span>
                    <p className="text-lg font-black text-gray-900">
                      {formatPace(stats.avgPace)}{' '}
                      <span className="text-[10px] font-bold text-gray-400">
                        /km
                      </span>
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <span className="mb-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">
                      <TrendingUp className="h-3 w-3 text-green-500" /> KM{' '}
                      <span className="text-[7px] text-gray-300">(30d)</span>
                    </span>
                    <p className="text-lg font-black text-gray-900">
                      {formatDistance(stats.totalDistance)}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <span className="mb-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">
                      <Activity className="h-3 w-3 text-blue-500" /> Treinos
                    </span>
                    <p className="text-lg font-black text-gray-900">
                      {stats.totalWorkouts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap justify-center gap-3 md:pb-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="group flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-xs font-black text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-orange-500 active:scale-95"
                >
                  <QrCode className="h-4 w-4 text-gray-500 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
                  COMPARTILHAR
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="group flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-xs font-black text-white shadow-xl shadow-gray-900/10 transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-95"
                  >
                    <Edit3 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                    EDITAR PERFIL
                  </button>
                )}
              </div>
            </div>

            <p className="mt-8 max-w-3xl text-center text-sm leading-relaxed font-medium text-gray-500 md:text-left">
              {athleteProfile?.bio ||
                (isOwnProfile
                  ? 'Você ainda não escreveu sua bio. Conte um pouco sobre sua jornada no atletismo!'
                  : 'Este atleta ainda não escreveu uma biografia.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* COLUNA ESQUERDA: Estatísticas e Links */}
          <div className="space-y-6 lg:col-span-4">
            {/* Informações Físicas */}
            <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                <Activity className="h-5 w-5 text-orange-500" /> Perfil Físico
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
                  <span className="block text-[10px] font-black tracking-wider text-gray-400 uppercase">
                    Peso
                  </span>
                  <p className="text-xl font-black text-gray-900">
                    {athleteProfile?.weight || '--'}{' '}
                    <span className="text-xs font-bold text-gray-400">kg</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
                  <span className="block text-[10px] font-black tracking-wider text-gray-400 uppercase">
                    Altura
                  </span>
                  <p className="text-xl font-black text-gray-900">
                    {athleteProfile?.height || '--'}{' '}
                    <span className="text-xs font-bold text-gray-400">cm</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                <LinkIcon className="h-5 w-5 text-gray-400" /> Conexões
              </h2>
              <div className="space-y-3">
                {athleteProfile?.instagramUrl && (
                  <a
                    href={athleteProfile.instagramUrl}
                    target="_blank"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-pink-100 hover:bg-pink-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 transition-colors group-hover:bg-pink-200">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Instagram
                      </p>
                      <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-pink-700">
                        @{athleteProfile.instagramUrl.split('/').pop()}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-300" />
                  </a>
                )}
                {athleteProfile?.stravaUrl && (
                  <a
                    href={athleteProfile.stravaUrl}
                    target="_blank"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-orange-100 hover:bg-orange-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-200">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Strava
                      </p>
                      <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-orange-700">
                        Perfil Strava
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-300" />
                  </a>
                )}
                {!athleteProfile?.instagramUrl &&
                  !athleteProfile?.stravaUrl && (
                    <p className="py-4 text-center text-xs font-bold text-gray-400 italic">
                      Nenhuma rede social vinculada.
                    </p>
                  )}

                {isOwnProfile && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex flex-col gap-3 rounded-2xl border border-orange-100/50 bg-orange-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                          <svg
                            className="h-5 w-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-3.828L8.375 6.056 6.287 10.172H9.333m5.549-4.116L12.06 0l-5.12 10.172h3.066" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black tracking-wider text-orange-600 uppercase">
                            Integração Strava
                          </p>
                          <p className="truncate text-sm font-extrabold text-gray-800">
                            {athleteProfile?.isStravaConnected
                              ? 'Sincronização Ativa'
                              : 'Não conectado'}
                          </p>
                        </div>
                      </div>

                      {athleteProfile?.isStravaConnected ? (
                        <button
                          onClick={handleDisconnectStrava}
                          disabled={isStravaActionLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white py-2.5 text-xs font-black text-red-600 shadow-sm transition-all hover:bg-red-50 hover:text-red-700 active:scale-98 disabled:opacity-50"
                        >
                          {isStravaActionLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'DESCONECTAR STRAVA'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleConnectStrava}
                          disabled={isStravaActionLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-98 disabled:opacity-50"
                        >
                          {isStravaActionLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'CONECTAR DISPOSITIVO'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Equipamentos & Vestíveis */}
            {(athleteProfile?.shoes || athleteProfile?.watch) && (
              <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                  <Activity className="h-5 w-5 text-gray-400" /> Equipamentos
                </h2>
                <div className="space-y-3">
                  {athleteProfile?.shoes && (
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          <ShoeIcon className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
                            Tênis de Treino
                          </p>
                          <p
                            className="truncate text-sm font-bold text-gray-800"
                            title={athleteProfile.shoes}
                          >
                            {athleteProfile.shoes}
                          </p>
                        </div>
                      </div>
                      {athleteProfile.shoesMaxDistance !== undefined &&
                        athleteProfile.shoesMaxDistance !== null && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                              <span>Vida útil restante</span>
                              <span
                                className={
                                  athleteProfile.shoesRemainingDistance !==
                                    undefined &&
                                  athleteProfile.shoesRemainingDistance !==
                                    null &&
                                  athleteProfile.shoesRemainingDistance <= 42
                                    ? 'font-bold text-red-500'
                                    : 'text-gray-700'
                                }
                              >
                                {athleteProfile.shoesRemainingDistance !==
                                  undefined &&
                                athleteProfile.shoesRemainingDistance !== null
                                  ? `${athleteProfile.shoesRemainingDistance.toFixed(1)} km / ${athleteProfile.shoesMaxDistance.toFixed(1)} km`
                                  : `0.0 km / ${athleteProfile.shoesMaxDistance.toFixed(1)} km`}
                              </span>
                            </div>
                            {athleteProfile.shoesRemainingDistance !==
                              undefined &&
                              athleteProfile.shoesRemainingDistance !==
                                null && (
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                      athleteProfile.shoesRemainingDistance <=
                                      42
                                        ? 'bg-red-500'
                                        : athleteProfile.shoesRemainingDistance <=
                                            100
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500'
                                    }`}
                                    style={{
                                      width: `${Math.max(0, Math.min(100, (athleteProfile.shoesRemainingDistance / athleteProfile.shoesMaxDistance) * 100))}%`,
                                    }}
                                  />
                                </div>
                              )}
                            {athleteProfile.shoesRemainingDistance !==
                              undefined &&
                              athleteProfile.shoesRemainingDistance !== null &&
                              athleteProfile.shoesRemainingDistance <= 42 && (
                                <div className="mt-1 flex animate-pulse items-center gap-1 text-[10px] font-bold text-red-500">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span>
                                    Vida útil próxima do fim! Recomendamos a
                                    troca.
                                  </span>
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                  )}
                  {athleteProfile?.watch && (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <Watch className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
                          Smartwatch
                        </p>
                        <p
                          className="truncate text-sm font-bold text-gray-800"
                          title={athleteProfile.watch}
                        >
                          {athleteProfile.watch}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: Feed Pessoal */}
          <div className="space-y-6 lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-gray-100 p-1">
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all ${activeTab === 'activities' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Calendar className="h-4 w-4" /> ATIVIDADES
                </button>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => setActiveTab('planned')}
                      className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all ${activeTab === 'planned' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Target className="h-4 w-4" /> MEUS TREINOS
                    </button>
                    <button
                      onClick={() => setActiveTab('evolution')}
                      className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all ${activeTab === 'evolution' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <TrendingUp className="h-4 w-4" /> EVOLUÇÃO
                      {!isSubscribed && (
                        <span className="ml-1 text-[10px] text-orange-500">
                          👑
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {activeTab === 'activities' && (
              <>
                {workouts.length > 0 ? (
                  workouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      currentUserId={currentUser.id}
                      userRole="ATHLETE"
                      onDelete={(id) => {
                        const w = workouts.find((x) => x.id === id)
                        if (w) setWorkoutToDelete(w)
                      }}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                    <Activity className="mb-4 h-10 w-10 text-gray-300" />
                    <h3 className="mb-1 text-lg font-extrabold text-gray-900">
                      Sem atividades recentes
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      {isOwnProfile
                        ? 'Você ainda não registrou nenhum treino. Vamos começar?'
                        : 'Este atleta ainda não registrou atividades no clube.'}
                    </p>
                  </div>
                )}

                {workouts.length > 0 && (
                  <button className="w-full cursor-pointer rounded-xl bg-orange-50 py-4 text-sm font-bold text-orange-500 transition-colors hover:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500/50 focus:outline-none">
                    Ver histórico completo
                  </button>
                )}
              </>
            )}

            {activeTab === 'planned' && (
              <>
                {plannedWorkouts.length > 0 ? (
                  plannedWorkouts.map((workout) => (
                    <div key={workout.id} className="relative">
                      <div className="absolute top-4 bottom-4 -left-2 w-1 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                      <WorkoutCard
                        workout={workout}
                        currentUserId={currentUser.id}
                        userRole="ATHLETE"
                        onComplete={handleOpenCompleteModal}
                        onEdit={handleOpenRescheduleModal}
                        onDelete={(id) => {
                          const w = plannedWorkouts.find((x) => x.id === id)
                          if (w) setWorkoutToDelete(w)
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                    <Target className="mb-4 h-10 w-10 text-gray-300" />
                    <h3 className="mb-1 text-lg font-extrabold text-gray-900">
                      Nenhum treino prescrito
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      Fale com seu treinador para receber planilhas e metas
                      personalizadas.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'evolution' && (
              <>
                {!isSubscribed ? (
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-gray-950 p-8 text-white shadow-2xl md:p-12">
                    {/* Background Gradients */}
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

                    <div className="relative flex flex-col items-center text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
                        <Crown className="h-8 w-8 animate-pulse" />
                      </div>

                      <h3 className="max-w-md text-2xl font-black tracking-tight text-white md:text-3xl">
                        Estatísticas e Gráficos de Evolução
                      </h3>

                      <p className="mt-3 max-w-sm text-sm font-medium text-gray-400">
                        Monitore seu progresso e ritmo de corrida com análises
                        detalhadas no painel premium.
                      </p>

                      {/* Mocked blurry chart visual */}
                      <div className="my-8 w-full max-w-md rounded-2xl border border-white/5 bg-white/5 p-4 opacity-25 blur-xs">
                        <div className="flex h-28 w-full items-center justify-center rounded-lg bg-white/5">
                          <span className="text-xs font-black tracking-wider text-gray-400 uppercase">
                            Painel de Evolução Desbloqueado
                          </span>
                        </div>
                      </div>

                      <div className="mb-8 w-full max-w-xs space-y-3 text-left">
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                            ✓
                          </span>
                          Curva histórica de Pace (min/km)
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                            ✓
                          </span>
                          Volume semanal acumulado (Km)
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                            ✓
                          </span>
                          Métricas avançadas e recordes pessoais
                        </div>
                      </div>

                      <a
                        href="/checkout?plan=athlete"
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-102 hover:shadow-orange-500/35 focus:ring-2 focus:ring-orange-500/50"
                      >
                        Quero ser Atleta Premium <Crown className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Recordes Pessoais */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          <Trophy className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                          Maior Distância
                        </span>
                        <p className="mt-1 font-mono text-lg font-black text-gray-900">
                          {personalRecords.maxDistance}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
                          <Flame className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                          Melhor Pace
                        </span>
                        <p className="mt-1 font-mono text-lg font-black text-gray-900">
                          {personalRecords.bestPace}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                          <Activity className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                          Volume Total
                        </span>
                        <p className="mt-1 font-mono text-lg font-black text-gray-900">
                          {personalRecords.totalVolume}
                        </p>
                      </div>
                    </div>

                    {/* Gráficos Recharts */}
                    {isMounted ? (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Gráfico de Pace */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                          <h4 className="mb-4 flex items-center gap-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                            <Activity className="h-4 w-4 text-purple-500" />{' '}
                            Histórico de Ritmo (Pace)
                          </h4>
                          <div className="h-48 w-full">
                            {evolutionData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={evolutionData}
                                  margin={{
                                    top: 5,
                                    right: 5,
                                    left: -25,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f3f4f6"
                                  />
                                  <XAxis
                                    dataKey="data"
                                    stroke="#9ca3af"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis
                                    stroke="#9ca3af"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    reversed
                                    domain={['auto', 'auto']}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#111827',
                                      borderRadius: '1rem',
                                      border: 'none',
                                      color: '#fff',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                    }}
                                    formatter={(value) => [
                                      `${value} min/km`,
                                      'Pace',
                                    ]}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="pace"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{
                                      stroke: '#8b5cf6',
                                      strokeWidth: 1.5,
                                      r: 3,
                                      fill: '#fff',
                                    }}
                                    activeDot={{ r: 6 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                                <Activity className="mb-2 h-8 w-8 text-gray-300" />
                                <p className="text-xs font-bold text-gray-400">
                                  Nenhum treino concluído ainda
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gráfico de Volume (Distância) */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                          <h4 className="mb-4 flex items-center gap-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                            <TrendingUp className="h-4 w-4 text-orange-500" />{' '}
                            Volume por Treino (Km)
                          </h4>
                          <div className="h-48 w-full">
                            {evolutionData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={evolutionData}
                                  margin={{
                                    top: 5,
                                    right: 5,
                                    left: -25,
                                    bottom: 5,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="colorDist"
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
                                    dataKey="data"
                                    stroke="#9ca3af"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis
                                    stroke="#9ca3af"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#111827',
                                      borderRadius: '1rem',
                                      border: 'none',
                                      color: '#fff',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                    }}
                                    formatter={(value) => [
                                      `${value} km`,
                                      'Distância',
                                    ]}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="distancia"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDist)"
                                    dot={{
                                      stroke: '#f97316',
                                      strokeWidth: 1.5,
                                      r: 3,
                                      fill: '#fff',
                                    }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                                <TrendingUp className="mb-2 h-8 w-8 text-gray-300" />
                                <p className="text-xs font-bold text-gray-400">
                                  Registre treinos para ver a evolução
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded-3xl border border-gray-100 bg-white">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* MODAIS */}
      <UpdateProfileModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        user={user}
        athleteProfile={athleteProfile}
        token={token}
      />

      <ProfileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={user}
        athleteProfile={athleteProfile}
        stats={stats}
      />

      <CompleteWorkoutModal
        isOpen={isCompleteModalOpen}
        workout={selectedWorkout}
        isStravaConnected={!!athleteProfile?.isStravaConnected}
        onClose={() => setIsCompleteModalOpen(false)}
        onSuccess={() => {
          // Revalidação já é feita na action
        }}
      />

      <RescheduleWorkoutModal
        isOpen={isRescheduleModalOpen}
        workout={selectedWorkout}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSuccess={() => {
          // Revalidação já é feita na action
        }}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
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
            {workoutToDelete?.status === 'COMPLETED' && (
              <p className="mt-2 text-sm leading-relaxed font-medium text-gray-500">
                Esta ação é irreversível e os pontos gerados por esta atividade
                serão removidos do ranking mensal do clube.
              </p>
            )}
            {workoutToDelete?.status === 'PLANNED' && (
              <p className="mt-2 text-sm leading-relaxed font-medium text-gray-500">
                Este treino planejado será removido da sua agenda.
              </p>
            )}
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3">
            <button
              onClick={() => setWorkoutToDelete(null)}
              className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteWorkout}
              disabled={isDeleting}
              className="flex-[1.5] cursor-pointer rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
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

      {/* DIALOG DE SIMULAÇÃO STRAVA OAUTH */}
      <Dialog open={isOAuthDialogOpen} onOpenChange={setIsOAuthDialogOpen}>
        <DialogContent className="overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-[420px]">
          <div className="relative bg-orange-500 px-6 py-8 text-center text-white">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-orange-500 shadow-lg">
              <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-3.828L8.375 6.056 6.287 10.172H9.333m5.549-4.116L12.06 0l-5.12 10.172h3.066" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-white">
              Autorização Strava
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs font-medium text-orange-100">
              Sandbox Integration (Localhost)
            </DialogDescription>
          </div>

          <div className="p-6">
            <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Permissões Solicitadas:
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-xs font-bold text-gray-600">
                  <span className="shrink-0 text-green-500">✓</span>
                  <span>Visualizar seu perfil público e dados de atleta</span>
                </li>
                <li className="flex items-start gap-2 text-xs font-bold text-gray-600">
                  <span className="shrink-0 text-green-500">✓</span>
                  <span>
                    Importar suas atividades de corrida e treinos recentes
                  </span>
                </li>
              </ul>
            </div>

            <p className="mb-6 text-center text-xs leading-relaxed font-medium text-gray-400">
              Ao autorizar, o ClubRun receberá chaves de acesso simuladas para
              sincronizar dados diretamente das suas atividades do Strava.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirmOAuth}
                className="w-full cursor-pointer rounded-2xl bg-orange-500 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-98"
              >
                AUTORIZAR ACESSO
              </button>
              <button
                onClick={() => setIsOAuthDialogOpen(false)}
                className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50 active:scale-98"
              >
                Cancelar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
