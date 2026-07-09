'use client'

import { AddResultModal } from '@/components/add-result-modal'
import { CreateRaceModal } from '@/components/create-race-modal'
import { DeleteRaceModal } from '@/components/delete-race-modal'
import { Header } from '@/components/header'
import { PaymentIncentiveModal } from '@/components/payment-incentive-modal'
import { UpdateRaceModal } from '@/components/update-race-modal'
import { deleteRace } from '@/http/delete-race'
import { toggleRaceRegistration } from '@/http/toggle-race-registration'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  Flag,
  Loader2,
  MapPin,
  Medal,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { deleteRaceAction } from './actions'

interface Race {
  id: string
  name: string
  distance: number
  date: string
  time: string
  rawDate: string
  location: string
  distances: string[]
  registeredCount: number
  status: 'UPCOMING' | 'COMPLETED'
  clubAvatar?: string | null
  isRegistered: boolean
  participants: {
    avatarUrl: string | null
  }[]
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
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isToggling, setIsToggling] = useState<string | null>(null)

  const [isIncentiveOpen, setIsIncentiveOpen] = useState(false)
  const [incentiveRace, setIncentiveRace] = useState<{
    id: string
    name: string
  } | null>(null)

  const [selectedRace, setSelectedRace] = useState<{
    id: string
    name: string
    distance: number
  } | null>(null)

  const commonDistances = ['5km', '10km', '21km', '42km']

  const displayedRaces = (
    activeTab === 'upcoming' ? upcomingRaces : pastRaces
  ).filter((race) => {
    const matchesSearch = race.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDistance =
      !selectedDistance || race.distances.includes(selectedDistance)
    return matchesSearch && matchesDistance
  })

  const canManage = userRole === 'OWNER' || userRole === 'MANAGER'

  const handleToggleRegistration = async (
    raceId: string,
    isClosed: boolean,
    isRegistered: boolean,
    name: string
  ) => {
    if (isClosed) {
      toast.error('Inscrições encerradas para esta corrida.')
      return
    }

    if (!isRegistered) {
      setIncentiveRace({ id: raceId, name })
      setIsIncentiveOpen(true)
      return
    }

    await executeToggle(raceId)
  }

  const executeToggle = async (raceId: string) => {
    setIsToggling(raceId)
    try {
      const result = await toggleRaceRegistration(club.slug, raceId)
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      const message =
        error?.response?.json?.message || 'Erro ao processar inscrição.'
      toast.error(message)
    } finally {
      setIsToggling(null)
    }
  }

  const isRegistrationClosed = (rawDate: string) => {
    const raceDate = new Date(rawDate)
    const now = new Date()
    const oneHourBefore = new Date(raceDate.getTime() - 60 * 60 * 1000)
    return now >= oneHourBefore
  }

  const handleDeleteRace = async () => {
    if (!selectedRace) return

    const formData = new FormData()
    formData.append('slug', club.slug)
    formData.append('raceId', selectedRace.id)

    const result = await deleteRaceAction(formData)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
      throw new Error(result.message)
    }
  }

  const getDistanceColor = (dist: string) => {
    const d = dist.toLowerCase()
    if (d.includes('5k')) return 'bg-emerald-500 shadow-emerald-500/20'
    if (d.includes('10k')) return 'bg-blue-500 shadow-blue-500/20'
    if (d.includes('21k')) return 'bg-purple-500 shadow-purple-500/20'
    if (d.includes('42k')) return 'bg-amber-600 shadow-amber-600/20'
    return 'bg-gray-900 shadow-gray-900/10'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* CABEÇALHO */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-500 uppercase">
              <Activity className="h-4 w-4" /> Planejamento de Corridas
            </div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Calendário de <span className="text-orange-500">Corridas</span>
            </h1>
            <p className="max-w-md text-sm font-medium text-gray-500">
              Acompanhe os eventos onde o{' '}
              <strong className="text-gray-900">{club.name}</strong> estará
              presente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManage && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
              >
                <Plus className="h-5 w-5" /> Adicionar Corrida
              </button>
            )}
          </div>
        </div>

        {/* CONTROLES (Busca e Abas) */}
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 rounded-[1.25rem] border border-gray-100 bg-white p-1.5 shadow-sm md:w-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 cursor-pointer rounded-xl px-6 py-3 text-xs font-black tracking-wider uppercase transition-all md:flex-none ${activeTab === 'upcoming' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:text-gray-900'}`}
              >
                Próximas Corridas
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 cursor-pointer rounded-xl px-6 py-3 text-xs font-black tracking-wider uppercase transition-all md:flex-none ${activeTab === 'past' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:text-gray-900'}`}
              >
                Resultados
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar corrida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-white py-3.5 pr-4 pl-11 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
              />
            </div>
          </div>

          {/* DISTANCE FILTERS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDistance(null)}
              className={`cursor-pointer rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${!selectedDistance ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}
            >
              Todas
            </button>
            {commonDistances.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistance(dist)}
                className={`cursor-pointer rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedDistance === dist ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* GRID DE PROVAS */}
        {displayedRaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {displayedRaces.map((race) => {
              const registrationClosed = isRegistrationClosed(race.rawDate)

              return (
                <Link
                  key={race.id}
                  href={`/${club.slug}/races/${race.id}`}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-1 transition-all hover:border-orange-200 hover:shadow-2xl"
                >
                  <div
                    className={`flex h-full flex-col rounded-4xl bg-white p-6 sm:p-8 transition-all duration-500 ${registrationClosed && activeTab === 'upcoming' ? 'group-hover:blur-[2px] group-hover:opacity-40' : ''}`}
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex gap-2">
                        {/* Data Badge */}
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100 transition-transform group-hover:scale-110">
                          <span className="mb-1 text-[8px] leading-none font-black tracking-widest uppercase">
                            {race.date.split(' de ')[1] ||
                              race.date.split(' ')[1]}
                          </span>
                          <span className="text-2xl leading-none font-black">
                            {race.date.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canManage && (
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setSelectedRace({
                                  id: race.id,
                                  name: race.name,
                                  distance: race.distance,
                                })
                                setIsUpdateModalOpen(true)
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-500"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setSelectedRace({
                                  id: race.id,
                                  name: race.name,
                                  distance: race.distance,
                                })
                                setIsDeleteDialogOpen(true)
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-2xl font-black tracking-tight text-gray-900 transition-colors group-hover:text-orange-500">
                          {race.name}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-lg italic ${getDistanceColor(race.distances[0])}`}
                        >
                          {race.distances[0]}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                          <MapPin className="h-4 w-4 text-orange-500" />{' '}
                          {race.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                          <Clock className="h-4 w-4 text-orange-500" />{' '}
                          {race.time}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-3">
                            {race.participants.map((participant, i) => (
                              <div
                                key={i}
                                className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden"
                              >
                                {participant.avatarUrl ? (
                                  <img
                                    src={participant.avatarUrl}
                                    className="h-full w-full object-cover"
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-orange-100 text-[10px] font-black text-orange-500">
                                    <Users className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {race.registeredCount > 5 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-[8px] font-black text-white">
                                +{race.registeredCount - 5}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-black tracking-widest text-gray-400 uppercase">
                            {race.registeredCount} Atletas
                          </span>
                        </div>

                        {activeTab === 'upcoming' ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleToggleRegistration(
                                race.id,
                                registrationClosed,
                                race.isRegistered,
                                race.name
                              )
                            }}
                            disabled={
                              isToggling === race.id ||
                              (registrationClosed && !race.isRegistered)
                            }
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50 ${
                              race.isRegistered
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                : registrationClosed
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600'
                            }`}
                          >
                            {isToggling === race.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : race.isRegistered ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />{' '}
                                Inscrito
                              </>
                            ) : registrationClosed ? (
                              'Encerrado'
                            ) : (
                              'Inscrever-se'
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedRace({
                                id: race.id,
                                name: race.name,
                                distance: race.distance,
                              })
                              setIsResultModalOpen(true)
                            }}
                            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-amber-600 uppercase transition-colors hover:bg-amber-100"
                          >
                            <Trophy className="h-3.5 w-3.5" /> Registrar Tempo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* OVERLAY FOR CLOSED REGISTRATION */}
                  {registrationClosed && activeTab === 'upcoming' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                      <div className="flex flex-col items-center gap-2 rounded-3xl bg-gray-900/80 p-6 text-center backdrop-blur-md">
                        <AlertCircle className="h-8 w-8 text-orange-500" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">
                          Inscrições Encerradas
                        </h4>
                        <p className="text-[10px] font-medium text-gray-300 max-w-[180px]">
                          O prazo de inscrição terminou uma hora antes da
                          largada.
                        </p>
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-white py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-300">
              <CalendarDays className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-gray-900">
              {searchQuery
                ? 'Nenhuma corrida encontrada para sua busca'
                : 'O horizonte está livre'}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed font-medium text-gray-500">
              {activeTab === 'upcoming'
                ? 'Ainda não foram definidas corridas-alvo. Que tal sugerir uma ao treinador?'
                : 'Ainda não temos resultados registrados no histórico deste clube.'}
            </p>
            {canManage && !searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-8 flex cursor-pointer items-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
              >
                <Plus className="h-5 w-5" /> Cadastrar Primeira Corrida
              </button>
            )}
          </div>
        )}
      </main>

      <CreateRaceModal
        isOpen={isCreateModalOpen}
        slug={club.slug}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedRace && (
        <>
          <AddResultModal
            isOpen={isResultModalOpen}
            slug={club.slug}
            raceId={selectedRace.id}
            raceName={selectedRace.name}
            raceDistance={selectedRace.distance}
            onClose={() => {
              setIsResultModalOpen(false)
              setSelectedRace(null)
            }}
          />
          <DeleteRaceModal
            isOpen={isDeleteDialogOpen}
            raceName={selectedRace.name}
            onClose={() => {
              setIsDeleteDialogOpen(false)
              setSelectedRace(null)
            }}
            onConfirm={handleDeleteRace}
          />
          <UpdateRaceModal
            isOpen={isUpdateModalOpen}
            slug={club.slug}
            raceId={selectedRace.id}
            onClose={() => {
              setIsUpdateModalOpen(false)
              setSelectedRace(null)
            }}
          />
        </>
      )}

      <PaymentIncentiveModal
        isOpen={isIncentiveOpen}
        onClose={() => {
          setIsIncentiveOpen(false)
          setIncentiveRace(null)
        }}
        onConfirm={() => {
          if (incentiveRace) executeToggle(incentiveRace.id)
        }}
        raceName={incentiveRace?.name || ''}
      />
    </div>
  )
}
