'use client'

import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { Header } from '@/components/header'
import { WorkoutCard, Workout } from '@/components/workout-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UpdateProfileModal } from '@/components/update-profile-modal'
import { CompleteWorkoutModal } from '@/components/complete-workout-modal'

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
    instagramUrl: string | null
    stravaUrl: string | null
    isPublic: boolean
  } | null
  workouts: Workout[]
  plannedWorkouts: Workout[]
  isOwnProfile: boolean
}

export function ProfileClient({
  currentUser,
  user,
  athleteProfile,
  workouts,
  plannedWorkouts,
  isOwnProfile,
}: ProfileClientProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [activeTab, setActiveTab] = useState<'activities' | 'planned'>('activities')

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={currentUser} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        
        {/* BARRA DE PROGRESSO DO PERFIL (Apenas se próprio e incompleto) */}
        {isOwnProfile && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${profileProgress === 100 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {profileProgress === 100 ? <CheckCircle2 className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {profileProgress === 100 ? 'Perfil Completo!' : 'Complete seu perfil'}
                  </h4>
                  <p className="text-xs font-medium text-gray-400">
                    {profileProgress === 100 ? 'Sua jornada no Club Run está devidamente documentada.' : 'Preencha seus dados para melhorar sua experiência.'}
                  </p>
                </div>
              </div>
              <span className="text-lg font-black text-orange-500">{profileProgress}%</span>
            </div>
            
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div 
                className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${profileProgress}%` }}
              />
            </div>

            {profileProgress < 100 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!athleteProfile?.bio && <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">Bio pendente</span>}
                {!athleteProfile?.city && <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">Localização pendente</span>}
                {!athleteProfile?.weight && <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">Dados físicos</span>}
              </div>
            )}
          </div>
        )}

        {/* BANNER E CABEÇALHO DO PERFIL */}
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
          {/* Capa Dinâmica */}
          <div className="relative h-40 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 sm:h-48">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

          <div className="relative px-6 pb-8 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="-mt-16 flex flex-col items-center gap-6 md:-mt-20 md:flex-row md:items-end">
                <div className="relative z-10 group">
                  <div className={`relative h-32 w-32 rounded-full border-4 border-white bg-white shadow-xl transition-transform duration-300 group-hover:scale-105 ${isProfileIncomplete ? 'ring-4 ring-orange-400 ring-offset-4 ring-offset-white' : ''}`}>
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatarUrl || ''} className="object-cover" />
                      <AvatarFallback className="text-3xl font-black text-gray-400">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    className="absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-orange-500 shadow-md"
                    title="Atleta Verificado"
                  >
                    <Target className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                
                <div className="pb-1 text-center md:text-left">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight md:text-4xl">
                    {user.name || 'Atleta Sem Nome'}
                  </h1>
                  <p className="mt-1.5 flex items-center justify-center gap-1.5 font-bold text-gray-400 text-xs md:justify-start uppercase tracking-[0.2em]">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" /> {athleteProfile?.city || 'Localização não definida'}
                  </p>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex justify-center md:pb-1">
                  <button 
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="cursor-pointer group flex items-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-95"
                  >
                    <Edit3 className="h-4 w-4 transition-transform group-hover:rotate-12" /> 
                    EDITAR PERFIL
                  </button>
                </div>
              )}
            </div>

            <p className="mt-6 max-w-2xl text-center font-medium leading-relaxed text-gray-600 md:text-left">
              {athleteProfile?.bio || (isOwnProfile ? 'Você ainda não escreveu sua bio. Conte um pouco sobre sua jornada no atletismo!' : 'Este atleta ainda não escreveu uma biografia.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* COLUNA ESQUERDA: Estatísticas e Links */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* Informações Físicas */}
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                <Activity className="h-5 w-5 text-orange-500" /> Perfil Físico
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Peso</span>
                  <p className="text-xl font-black text-gray-900">{athleteProfile?.weight || '--'} <span className="text-xs font-bold text-gray-400">kg</span></p>
                </div>
                <div className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Altura</span>
                  <p className="text-xl font-black text-gray-900">{athleteProfile?.height || '--'} <span className="text-xs font-bold text-gray-400">cm</span></p>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                <LinkIcon className="h-5 w-5 text-gray-400" /> Conexões
              </h2>
              <div className="space-y-3">
                {athleteProfile?.instagramUrl && (
                  <a
                    href={athleteProfile.instagramUrl}
                    target="_blank"
                    className="cursor-pointer group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-pink-100 hover:bg-pink-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 transition-colors group-hover:bg-pink-200">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Instagram</p>
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
                    className="cursor-pointer group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-orange-100 hover:bg-orange-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-200">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Strava</p>
                      <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-orange-700">
                        Perfil Strava
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-300" />
                  </a>
                )}
                {!athleteProfile?.instagramUrl && !athleteProfile?.stravaUrl && (
                  <p className="text-xs font-bold text-gray-400 text-center py-4 italic">Nenhuma rede social vinculada.</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Feed Pessoal */}
          <div className="space-y-6 lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'activities' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Calendar className="h-4 w-4" /> ATIVIDADES
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('planned')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'planned' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Target className="h-4 w-4" /> MEUS TREINOS
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'activities' ? (
              <>
                {workouts.length > 0 ? (
                  workouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      currentUserId={currentUser.id}
                      userRole="MEMBER"
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                    <Activity className="mb-4 h-10 w-10 text-gray-300" />
                    <h3 className="mb-1 text-lg font-extrabold text-gray-900">Sem atividades recentes</h3>
                    <p className="text-sm font-medium text-gray-500">
                      {isOwnProfile ? 'Você ainda não registrou nenhum treino. Vamos começar?' : 'Este atleta ainda não registrou atividades no clube.'}
                    </p>
                  </div>
                )}

                {workouts.length > 0 && (
                  <button className="cursor-pointer w-full rounded-xl bg-orange-50 py-4 text-sm font-bold text-orange-500 transition-colors hover:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500/50 focus:outline-none">
                    Ver histórico completo
                  </button>
                )}
              </>
            ) : (
              <>
                {plannedWorkouts.length > 0 ? (
                  plannedWorkouts.map((workout) => (
                    <div key={workout.id} className="relative">
                      <div className="absolute -left-2 top-4 bottom-4 w-1 bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                      <WorkoutCard
                        workout={workout}
                        currentUserId={currentUser.id}
                        userRole="MEMBER"
                        onComplete={handleOpenCompleteModal}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                    <Target className="mb-4 h-10 w-10 text-gray-300" />
                    <h3 className="mb-1 text-lg font-extrabold text-gray-900">Nenhum treino prescrito</h3>
                    <p className="text-sm font-medium text-gray-500">
                      Fale com seu treinador para receber planilhas e metas personalizadas.
                    </p>
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
        initialData={athleteProfile}
      />

      <CompleteWorkoutModal
        isOpen={isCompleteModalOpen}
        workout={selectedWorkout}
        onClose={() => setIsCompleteModalOpen(false)}
        onSuccess={() => {
          // Revalidação já é feita na action
        }}
      />
    </div>
  )
}
