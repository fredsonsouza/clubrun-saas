'use client'

import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AthleteStatsBar } from '@/components/athlete-stats-bar'
import { AthleteFilters } from '@/components/athlete-filters'
import { AthleteCard } from '@/components/athlete-card'
import { EmptyState } from '@/components/empty-state'

// ========================================
// MOCK DATA - Substituir por API real
// ========================================

const MOCK_ATHLETES = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    avatarUrl: null,
    role: 'MEMBER' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 12,
      totalDistance: 45,
      averagePace: '5:20',
    },
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    avatarUrl: null,
    role: 'COACH' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 10,
      totalDistance: 38,
      averagePace: '5:45',
    },
  },
  {
    id: '3',
    name: 'Pedro Alves',
    email: 'pedro.alves@email.com',
    avatarUrl: null,
    role: 'MEMBER' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 9,
      totalDistance: 35,
      averagePace: '5:55',
    },
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    avatarUrl: null,
    role: 'MEMBER' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 8,
      totalDistance: 32,
      averagePace: '6:10',
    },
  },
  {
    id: '5',
    name: 'Carlos Lima',
    email: 'carlos.lima@email.com',
    avatarUrl: null,
    role: 'ADMIN' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 7,
      totalDistance: 28,
      averagePace: '5:50',
    },
  },
  {
    id: '6',
    name: 'Beatriz Oliveira',
    email: 'beatriz@email.com',
    avatarUrl: null,
    role: 'MEMBER' as const,
    status: 'inactive' as const,
    stats: {
      totalWorkouts: 2,
      totalDistance: 8,
      averagePace: '6:30',
    },
  },
  {
    id: '7',
    name: 'Rafael Mendes',
    email: 'rafael@email.com',
    avatarUrl: null,
    role: 'MEMBER' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 11,
      totalDistance: 42,
      averagePace: '5:25',
    },
  },
  {
    id: '8',
    name: 'Juliana Souza',
    email: 'juliana@email.com',
    avatarUrl: null,
    role: 'BILLING' as const,
    status: 'active' as const,
    stats: {
      totalWorkouts: 6,
      totalDistance: 24,
      averagePace: '6:00',
    },
  },
]

const MOCK_STATS = {
  total: 23,
  active: 20,
  inactive: 3,
}

// ========================================
// COMPONENT
// ========================================

export default function AthletesPage() {
  // Configurações (depois virá de auth/context)
  const userRole: 'owner' | 'member' = 'owner' // MOCK: trocar por auth real
  const isManager = userRole === 'owner'

  // Estado dos filtros
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtrar atletas (mock - depois vem da API)
  const filteredAthletes = MOCK_ATHLETES.filter((athlete) => {
    // Filtro por status
    if (selectedStatus !== 'all' && athlete.status !== selectedStatus)
      return false

    // Filtro por busca
    if (
      searchTerm &&
      !athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !athlete.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false

    return true
  })

  const handleInviteAthlete = () => {
    console.log('Invite athlete')
    // TODO: Abrir modal de convite
  }

  const handleViewProfile = (athleteId: string) => {
    console.log('View athlete profile:', athleteId)
    // TODO: Navegar para /athletes/:id
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto mt-16 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-white">
              Atletas do Clube
            </h1>
            <p className="mt-2 text-zinc-400">
              {isManager
                ? 'Gerencie e acompanhe todos os atletas do clube'
                : 'Conheça os outros atletas do clube'}
            </p>
          </div>
          {isManager && (
            <Button
              onClick={handleInviteAthlete}
              className="cursor-pointer rounded-full bg-orange-500 p-5 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              {/* <Plus className="h-5 w-5" /> */}
              Convidar Atleta
            </Button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mb-6">
          <AthleteStatsBar
            total={MOCK_STATS.total}
            active={MOCK_STATS.active}
            inactive={MOCK_STATS.inactive}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <AthleteFilters
            onStatusChange={setSelectedStatus}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Athletes Grid */}
        {filteredAthletes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                id={athlete.id}
                name={athlete.name}
                email={athlete.email}
                avatarUrl={athlete.avatarUrl}
                role={athlete.role}
                status={athlete.status}
                stats={athlete.stats}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum atleta encontrado"
            description="Não há atletas que correspondam aos filtros selecionados. Tente ajustar os filtros ou convide novos atletas."
          />
        )}

        {/* Pagination (mock - depois vem da API) */}
        {filteredAthletes.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              disabled
            >
              Anterior
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="border-orange-500 bg-orange-500/10 text-orange-500"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                2
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
