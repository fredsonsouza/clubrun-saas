'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkoutStatsBar } from '@/components/workout-stats-bar'
import { WorkoutFilters } from '@/components/workout-filters'
import { WorkoutList } from '@/components/workout-list'
import { CreateWorkoutModal } from '@/components/create-workout-modal'

// ========================================
// MOCK DATA - Substituir por API real
// ========================================

const MOCK_WORKOUTS = [
  {
    id: '1',
    type: 'interval' as const,
    distance: 10,
    pace: '5:20',
    duration: '53:20',
    date: 'há 1 dia',
    athleteName: 'João Silva',
    athleteInitials: 'JS',
  },
  {
    id: '2',
    type: 'long-run' as const,
    distance: 21,
    pace: '5:45',
    duration: '2:00:45',
    date: 'há 2 dias',
    athleteName: 'Maria Santos',
    athleteInitials: 'MS',
  },
  {
    id: '3',
    type: 'recovery' as const,
    distance: 8,
    pace: '6:10',
    duration: '49:20',
    date: 'há 3 dias',
    athleteName: 'Pedro Alves',
    athleteInitials: 'PA',
  },
  {
    id: '4',
    type: 'run' as const,
    distance: 12,
    pace: '5:30',
    duration: '1:06:00',
    date: 'há 4 dias',
    athleteName: 'Ana Costa',
    athleteInitials: 'AC',
  },
  {
    id: '5',
    type: 'tempo' as const,
    distance: 15,
    pace: '5:15',
    duration: '1:18:45',
    date: 'há 5 dias',
    athleteName: 'Carlos Lima',
    athleteInitials: 'CL',
  },
  {
    id: '6',
    type: 'interval' as const,
    distance: 8,
    pace: '5:10',
    duration: '41:20',
    date: 'há 6 dias',
    athleteName: 'João Silva',
    athleteInitials: 'JS',
  },
  {
    id: '7',
    type: 'recovery' as const,
    distance: 6,
    pace: '6:20',
    duration: '38:00',
    date: 'há 7 dias',
    athleteName: 'Maria Santos',
    athleteInitials: 'MS',
  },
  {
    id: '8',
    type: 'long-run' as const,
    distance: 25,
    pace: '5:50',
    duration: '2:25:50',
    date: 'há 8 dias',
    athleteName: 'Pedro Alves',
    athleteInitials: 'PA',
  },
]

const MOCK_STATS = {
  total: 45,
  thisWeek: 12,
  totalDistance: 156,
  averagePace: '5:35',
}

// ========================================
// COMPONENT
// ========================================

export default function WorkoutsPage() {
  // Configurações (depois virá de auth/context)
  const userRole: 'owner' | 'member' = 'owner' // MOCK: trocar por auth real
  const isManager = userRole === 'owner'

  // Estado do modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Estado dos filtros
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAthlete, setSelectedAthlete] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtrar workouts (mock - depois vem da API)
  const filteredWorkouts = MOCK_WORKOUTS.filter((workout) => {
    // Filtro por tipo
    if (selectedType !== 'all' && workout.type !== selectedType) return false

    // Filtro por atleta (apenas para managers)
    if (
      isManager &&
      selectedAthlete !== 'all' &&
      workout.athleteName !== selectedAthlete
    )
      return false

    // Filtro por busca
    if (
      searchTerm &&
      !workout.athleteName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false

    return true
  })

  const handleCreateWorkout = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-white">
              {isManager ? 'Treinos do Clube' : 'Meus Treinos'}
            </h1>
            <p className="mt-2 text-zinc-400">
              {isManager
                ? 'Gerencie e acompanhe todos os treinos do clube'
                : 'Acompanhe seu histórico de treinos e evolução'}
            </p>
          </div>
          <Button
            onClick={handleCreateWorkout}
            className="bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            <Plus className="mr-2 h-5 w-5" />
            {isManager ? 'Novo Treino' : 'Registrar Treino'}
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="mb-6">
          <WorkoutStatsBar
            total={MOCK_STATS.total}
            thisWeek={MOCK_STATS.thisWeek}
            totalDistance={MOCK_STATS.totalDistance}
            averagePace={MOCK_STATS.averagePace}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <WorkoutFilters
            onTypeChange={setSelectedType}
            onAthleteChange={setSelectedAthlete}
            onPeriodChange={setSelectedPeriod}
            onSearchChange={setSearchTerm}
            showAthleteFilter={isManager}
          />
        </div>

        {/* Workouts List */}
        <WorkoutList workouts={filteredWorkouts} showAthlete={isManager} />

        {/* Pagination (mock - depois vem da API) */}
        {filteredWorkouts.length > 0 && (
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
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                3
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

      {/* Create Workout Modal */}
      <CreateWorkoutModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showAthleteSelect={isManager}
      />
    </div>
  )
}
