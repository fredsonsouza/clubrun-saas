'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Flame,
  Compass,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { ProfileButton } from '@/components/profile-button' // Assumindo que este já está criado

// --- TIPOS E MOCKS (INLINE PARA O PREVIEW) ---
interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  membersCount: number
  location?: string
  membershipStatus: 'NONE' | 'PENDING' | 'MEMBER' | 'OWNER'
}

const MOCK_EXPLORE_CLUBS: Club[] = [
  {
    id: '1',
    name: 'Macuxi Runner',
    slug: 'macuxi-runner',
    description:
      'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
    membersCount: 84,
    location: 'Boa Vista, RR',
    membershipStatus: 'MEMBER',
  },
  {
    id: '2',
    name: 'Elite Pace',
    slug: 'elite-pace',
    description:
      'Assessoria esportiva para quem busca quebrar recordes pessoais. Planilhas semanais personalizadas.',
    membersCount: 120,
    location: 'São Paulo, SP',
    membershipStatus: 'NONE',
  },
  {
    id: '3',
    name: 'Trail Runners',
    slug: 'trail-runners',
    description:
      'Nossa paixão é a montanha e a terra. Grupo focado em ultramaratonas de trail.',
    membersCount: 45,
    location: 'Global',
    membershipStatus: 'PENDING',
  },
  {
    id: '4',
    name: 'Pista & Asfalto',
    slug: 'pista-asfalto',
    description: 'Treinos intervalados de terça e quinta. Longão no domingo.',
    membersCount: 32,
    location: 'Curitiba, PR',
    membershipStatus: 'NONE',
  },
  {
    id: '5',
    name: 'Iron Club',
    slug: 'iron-club',
    description: 'Preparação exclusiva para triathlon e provas de ferro.',
    membersCount: 15,
    location: 'Florianópolis, PR',
    membershipStatus: 'NONE',
  },
]

interface ClubProps {
  user: string
}

// --- COMPONENTE: CLUB CARD (INLINE) ---
function ClubCardPreview({
  club,
  onJoinRequest,
}: {
  club: Club
  onJoinRequest: (id: string) => void
}) {
  const renderActionButton = () => {
    switch (club.membershipStatus) {
      case 'OWNER':
      case 'MEMBER':
        return (
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white transition-colors hover:bg-gray-800">
            Acessar Painel <ArrowRight className="h-4 w-4" />
          </button>
        )
      case 'PENDING':
        return (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-orange-50 py-3 font-bold text-orange-500"
          >
            <Clock className="h-4 w-4" /> Solicitação Pendente
          </button>
        )
      case 'NONE':
      default:
        return (
          <button
            onClick={() => onJoinRequest(club.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-bold text-white shadow-sm transition-colors hover:bg-orange-600 active:scale-95"
          >
            Pedir para Participar <ArrowRight className="h-4 w-4" />
          </button>
        )
    }
  }

  return (
    <div className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-black text-gray-400 transition-colors group-hover:bg-orange-50 group-hover:text-orange-500">
          {club.name.charAt(0)}
        </div>
        {club.membershipStatus === 'MEMBER' && (
          <span className="flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-green-600 uppercase">
            <CheckCircle2 className="h-3 w-3" /> Inscrito
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="mb-2 truncate text-xl font-extrabold text-gray-900">
          {club.name}
        </h3>
        <p className="mb-6 line-clamp-2 text-sm font-medium text-gray-500">
          {club.description}
        </p>
      </div>
      <div className="mt-auto space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
          <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
            <Users className="h-3.5 w-3.5 text-gray-400" /> {club.membersCount}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />{' '}
            {club.location || 'Global'}
          </span>
        </div>
        {renderActionButton()}
      </div>
    </div>
  )
}

// --- PÁGINA PRINCIPAL DO PREVIEW ---
export default function ExploreClubsPreviewPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [clubs, setClubs] = useState<Club[]>(MOCK_EXPLORE_CLUBS)

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location &&
        c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleJoinRequest = (clubId: string) => {
    setClubs(
      clubs.map((c) =>
        c.id === clubId ? { ...c, membershipStatus: 'PENDING' } : c
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* HEADER SIMULADO */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-7 w-7 text-orange-500" fill="currentColor" />
              <span className="hidden text-xl font-extrabold tracking-tight text-gray-900 sm:block">
                Club<span className="text-orange-500">Run</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-500">
            <span className="flex h-16 items-center border-b-2 border-orange-500 text-orange-600">
              Explorar
            </span>
            <span className="cursor-pointer transition-colors hover:text-gray-900">
              Meus Treinos
            </span>
          </div>
        </div>
      </nav>

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-10 duration-500 sm:px-6 lg:px-8">
        {/* HERO DE BUSCA */}
        <div className="relative mb-12 flex flex-col items-center overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Compass className="h-8 w-8" />
          </div>

          <h1 className="relative z-10 mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Encontre o seu pelotão
          </h1>
          <p className="relative z-10 mb-8 max-w-2xl text-lg font-medium text-gray-500">
            Pesquise por assessorias esportivas ou grupos de corrida na sua
            região e eleve o nível do seu treino.
          </p>

          <div className="relative z-10 w-full max-w-xl">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome do clube ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-4 pl-12 text-lg font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* LISTAGEM */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
            <Flame className="h-5 w-5 text-orange-500" /> Clubes em destaque
          </h2>
          <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-400">
            {filteredClubs.length} resultados
          </span>
        </div>

        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClubs.map((club) => (
              <ClubCardPreview
                key={club.id}
                club={club}
                onJoinRequest={handleJoinRequest}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-100 bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="mb-1 text-lg font-extrabold text-gray-900">
              Nenhum clube encontrado
            </h3>
            <p className="text-sm font-medium text-gray-500">
              Tente ajustar os termos da sua pesquisa.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
