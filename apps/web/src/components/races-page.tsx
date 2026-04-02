'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RaceTabs } from '@/components/race-tabs'
import { RaceCard } from '@/components/race-card'
import { EmptyState } from '@/components/empty-state'

// ========================================
// MOCK DATA - Substituir por API real
// ========================================

const MOCK_RACES = [
  {
    id: '1',
    name: 'Meia Maratona de Boa Vista',
    date: new Date(2026, 2, 15), // 15 Mar 2026
    time: '06:00',
    location: 'Orla do Rio Branco',
    distance: 21.1,
    distanceLabel: 'Meia Maratona',
    currentParticipants: 23,
    maxParticipants: 100,
    registrationOpen: true,
    registrationDeadline: new Date(2026, 2, 10),
    isUserRegistered: false,
    isPast: false,
  },
  {
    id: '2',
    name: 'Corrida do Clube - 10K',
    date: new Date(2026, 2, 22), // 22 Mar 2026
    time: '06:30',
    location: 'Praça do Centro Cívico',
    distance: 10,
    distanceLabel: '10K',
    currentParticipants: 45,
    maxParticipants: 50,
    registrationOpen: true,
    isUserRegistered: true,
    isPast: false,
  },
  {
    id: '3',
    name: 'Corrida de São João',
    date: new Date(2026, 5, 24), // 24 Jun 2026
    time: '05:30',
    location: 'Centro Histórico',
    distance: 5,
    distanceLabel: '5K',
    currentParticipants: 12,
    maxParticipants: undefined,
    registrationOpen: true,
    isUserRegistered: false,
    isPast: false,
  },
  {
    id: '4',
    name: 'Maratona de Roraima',
    date: new Date(2026, 7, 15), // 15 Ago 2026
    time: '05:00',
    location: 'Parque Anauá',
    distance: 42.2,
    distanceLabel: 'Maratona',
    currentParticipants: 8,
    maxParticipants: 200,
    registrationOpen: true,
    isUserRegistered: false,
    isPast: false,
  },
  // Corridas passadas
  {
    id: '5',
    name: 'Ano Novo Run 2026',
    date: new Date(2026, 0, 1), // 01 Jan 2026
    time: '06:00',
    location: 'Orla do Rio Branco',
    distance: 10,
    distanceLabel: '10K',
    currentParticipants: 67,
    registrationOpen: false,
    isUserRegistered: true,
    isPast: true,
    hasResults: true,
  },
  {
    id: '6',
    name: 'Corrida de Natal 2025',
    date: new Date(2025, 11, 25), // 25 Dez 2025
    time: '06:30',
    location: 'Centro',
    distance: 5,
    distanceLabel: '5K',
    currentParticipants: 42,
    registrationOpen: false,
    isUserRegistered: false,
    isPast: true,
    hasResults: true,
  },
]

// ========================================
// COMPONENT
// ========================================

export default function RacesPage() {
  const router = useRouter()

  // Configurações (depois virá de auth/context)
  const userRole: 'owner' | 'member' = 'owner' // MOCK: trocar por auth real
  const isManager = userRole === 'owner'

  // Estado da tab ativa
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'mine'>(
    'upcoming'
  )

  // Filtrar corridas por tab
  const filteredRaces = MOCK_RACES.filter((race) => {
    if (activeTab === 'upcoming') return !race.isPast
    if (activeTab === 'past') return race.isPast
    if (activeTab === 'mine') return race.isUserRegistered
    return true
  })

  // Contar corridas por tab
  const counts = {
    upcoming: MOCK_RACES.filter((r) => !r.isPast).length,
    past: MOCK_RACES.filter((r) => r.isPast).length,
    mine: MOCK_RACES.filter((r) => r.isUserRegistered).length,
  }

  const handleCreateRace = () => {
    console.log('Create race')
    // TODO: Abrir modal de criar corrida
  }

  const handleViewDetails = (raceId: string) => {
    console.log('View race details:', raceId)
    // TODO: Navegar para /races/:id
    router.push(`/races/${raceId}`)
  }

  const handleRegister = (raceId: string) => {
    console.log('Register for race:', raceId)
    // TODO: Abrir modal de confirmação de inscrição
  }

  const handleViewResults = (raceId: string) => {
    console.log('View results:', raceId)
    // TODO: Navegar para /races/:id/results
    router.push(`/races/${raceId}/results`)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto mt-16 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700">
              <Flag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-white">
                Corridas e Eventos
              </h1>
              <p className="mt-1 text-zinc-400">
                Participe das corridas do clube
              </p>
            </div>
          </div>
          {isManager && (
            <Button
              onClick={handleCreateRace}
              className="cursor-pointer rounded-full bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              Nova Corrida
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <RaceTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
        </div>

        {/* Races Grid */}
        {filteredRaces.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredRaces.map((race) => (
              <RaceCard
                key={race.id}
                id={race.id}
                name={race.name}
                date={race.date}
                time={race.time}
                location={race.location}
                distance={race.distance}
                distanceLabel={race.distanceLabel}
                currentParticipants={race.currentParticipants}
                maxParticipants={race.maxParticipants}
                registrationOpen={race.registrationOpen}
                registrationDeadline={race.registrationDeadline}
                isUserRegistered={race.isUserRegistered}
                isPast={race.isPast}
                hasResults={race.hasResults}
                onViewDetails={handleViewDetails}
                onRegister={handleRegister}
                onViewResults={handleViewResults}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Flag}
            title={
              activeTab === 'upcoming'
                ? 'Nenhuma corrida próxima'
                : activeTab === 'past'
                  ? 'Nenhuma corrida passada'
                  : 'Você não está inscrito em nenhuma corrida'
            }
            description={
              activeTab === 'upcoming'
                ? 'Novas corridas serão adicionadas em breve.'
                : activeTab === 'past'
                  ? 'O histórico de corridas aparecerá aqui.'
                  : 'Inscreva-se nas próximas corridas para participar.'
            }
          />
        )}
      </div>
    </div>
  )
}
