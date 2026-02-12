'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { RankingFilters } from '@/components/ranking-filters'
import { RankingPodium } from '@/components/ranking-podium'
import { RankingTable } from './ranking-table'

// ========================================
// MOCK DATA - Substituir por API real
// ========================================

const MOCK_RANKINGS = [
  {
    position: 1,
    athlete: {
      id: '1',
      name: 'João Silva',
      avatarUrl: null,
    },
    metric: {
      value: 156,
      label: '156 km',
    },
    stats: {
      totalWorkouts: 12,
      averagePace: '5:20',
    },
  },
  {
    position: 2,
    athlete: {
      id: '2',
      name: 'Maria Santos',
      avatarUrl: null,
    },
    metric: {
      value: 138,
      label: '138 km',
    },
    stats: {
      totalWorkouts: 10,
      averagePace: '5:45',
    },
  },
  {
    position: 3,
    athlete: {
      id: '3',
      name: 'Pedro Alves',
      avatarUrl: null,
    },
    metric: {
      value: 125,
      label: '125 km',
    },
    stats: {
      totalWorkouts: 9,
      averagePace: '5:55',
    },
  },
  {
    position: 4,
    athlete: {
      id: '4',
      name: 'Ana Costa',
      avatarUrl: null,
    },
    metric: {
      value: 102,
      label: '102 km',
    },
    stats: {
      totalWorkouts: 8,
      averagePace: '6:10',
    },
  },
  {
    position: 5,
    athlete: {
      id: '5',
      name: 'Carlos Lima',
      avatarUrl: null,
    },
    metric: {
      value: 95,
      label: '95 km',
    },
    stats: {
      totalWorkouts: 7,
      averagePace: '5:50',
    },
  },
  {
    position: 6,
    athlete: {
      id: '6',
      name: 'Beatriz Oliveira',
      avatarUrl: null,
    },
    metric: {
      value: 88,
      label: '88 km',
    },
    stats: {
      totalWorkouts: 7,
      averagePace: '6:05',
    },
  },
  {
    position: 7,
    athlete: {
      id: '7',
      name: 'Rafael Mendes',
      avatarUrl: null,
    },
    metric: {
      value: 82,
      label: '82 km',
    },
    stats: {
      totalWorkouts: 6,
      averagePace: '5:40',
    },
  },
  {
    position: 8,
    athlete: {
      id: '8',
      name: 'Juliana Souza',
      avatarUrl: null,
    },
    metric: {
      value: 76,
      label: '76 km',
    },
    stats: {
      totalWorkouts: 6,
      averagePace: '6:00',
    },
  },
  {
    position: 9,
    athlete: {
      id: '9',
      name: 'Fernando Costa',
      avatarUrl: null,
    },
    metric: {
      value: 68,
      label: '68 km',
    },
    stats: {
      totalWorkouts: 5,
      averagePace: '6:15',
    },
  },
  {
    position: 10,
    athlete: {
      id: '10',
      name: 'Larissa Martins',
      avatarUrl: null,
    },
    metric: {
      value: 62,
      label: '62 km',
    },
    stats: {
      totalWorkouts: 5,
      averagePace: '6:20',
    },
  },
  {
    position: 11,
    athlete: {
      id: '11',
      name: 'Thiago Rocha',
      avatarUrl: null,
    },
    metric: {
      value: 55,
      label: '55 km',
    },
    stats: {
      totalWorkouts: 4,
      averagePace: '6:10',
    },
  },
  {
    position: 12,
    athlete: {
      id: '12',
      name: 'Você',
      avatarUrl: null,
    },
    metric: {
      value: 45,
      label: '45 km',
    },
    stats: {
      totalWorkouts: 4,
      averagePace: '5:30',
    },
    isCurrentUser: true,
  },
]

// ========================================
// COMPONENT
// ========================================

export default function RankingsPage() {
  const router = useRouter()

  // Configurações (depois virá de auth/context)
  const currentUserId = '12' // MOCK: trocar por auth real

  // Estado dos filtros
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [selectedMetric, setSelectedMetric] = useState<string>('distance')

  // Filtrar rankings (mock - depois vem da API)
  // Por enquanto usa os dados mockados, mas depois seria um fetch com filtros
  const filteredRankings = MOCK_RANKINGS

  // Top 3 para o podium
  const podiumData = {
    first: filteredRankings[0]
      ? {
          id: filteredRankings[0].athlete.id,
          name: filteredRankings[0].athlete.name,
          avatarUrl: filteredRankings[0].athlete.avatarUrl,
          metricValue: filteredRankings[0].metric.value.toString(),
          metricLabel: selectedMetric === 'distance' ? 'km' : 'treinos',
        }
      : undefined,
    second: filteredRankings[1]
      ? {
          id: filteredRankings[1].athlete.id,
          name: filteredRankings[1].athlete.name,
          avatarUrl: filteredRankings[1].athlete.avatarUrl,
          metricValue: filteredRankings[1].metric.value.toString(),
          metricLabel: selectedMetric === 'distance' ? 'km' : 'treinos',
        }
      : undefined,
    third: filteredRankings[2]
      ? {
          id: filteredRankings[2].athlete.id,
          name: filteredRankings[2].athlete.name,
          avatarUrl: filteredRankings[2].athlete.avatarUrl,
          metricValue: filteredRankings[2].metric.value.toString(),
          metricLabel: selectedMetric === 'distance' ? 'km' : 'treinos',
        }
      : undefined,
  }

  const handleAthleteClick = (athleteId: string) => {
    router.push(`/athletes/${athleteId}`)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    // TODO: Fetch rankings com novo período
    console.log('Period changed:', period)
  }

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric)
    // TODO: Fetch rankings com nova métrica
    console.log('Metric changed:', metric)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10">
              <Trophy className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-white">
                Rankings do Clube
              </h1>
              <p className="mt-2 text-zinc-400">
                Competição saudável e evolução coletiva
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <RankingFilters
            onPeriodChange={handlePeriodChange}
            onMetricChange={handleMetricChange}
          />
        </div>

        {/* Podium */}
        <div className="mb-8">
          <RankingPodium
            first={podiumData.first}
            second={podiumData.second}
            third={podiumData.third}
            onAthleteClick={handleAthleteClick}
          />
        </div>

        {/* Full Ranking Table */}
        <RankingTable
          rankings={filteredRankings}
          onAthleteClick={handleAthleteClick}
        />
      </div>
    </div>
  )
}
