'use client'

import { type Club, ClubCard } from '@/components/club-card'
import { Header } from '@/components/header'
import { JoinFeedbackModal } from '@/components/join-feedback-modal'

import { requestJoinClub } from '@/http/request-join-club'
import { Compass, Flame, Search } from 'lucide-react'

import React, { useState } from 'react'

interface ExploreClubsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  initialClubs: Club[]
}

export function ExploreClubsClient({
  user,
  initialClubs,
}: ExploreClubsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [clubs, setClubs] = useState<Club[]>(initialClubs)

  // Estados do Modal de Feedback
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [selectedClubName, setSelectedClubName] = useState('')

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location &&
        c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleJoinRequest = async (
    clubId: string,
    slug: string,
    name: string
  ) => {
    try {
      await requestJoinClub(slug)

      setClubs(
        clubs.map((c) =>
          c.id === clubId ? { ...c, membershipStatus: 'PENDING' } : c
        )
      )

      setSelectedClubName(name)
      setModalType('success')
      setIsModalOpen(true)
    } catch (error) {
      console.error(error)
      setModalType('error')
      setIsModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-10 duration-500 sm:px-6 lg:px-8">
        {/* HERO DA BUSCA */}
        <div className="relative mb-12 flex flex-col items-center overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Compass className="h-8 w-8" />
          </div>

          <h1 className="relative z-10 mb-4 font-extrabold text-3xl text-gray-900 tracking-tight md:text-5xl">
            Encontre o seu pelotão
          </h1>
          <p className="relative z-10 mb-8 max-w-2xl font-medium text-gray-500 text-lg">
            Pesquise por assessorias esportivas ou grupos de corrida na sua
            região e eleve o nível do seu treino.
          </p>

          <div className="relative z-10 w-full max-w-xl">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome do clube ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-4 pl-12 font-medium text-gray-900 text-lg shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* GRID DE CLUBES */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-extrabold text-gray-900 text-xl">
            <Flame className="h-5 w-5 text-orange-500" /> Clubes em destaque
          </h2>
          <span className="rounded-lg bg-gray-100 px-3 py-1 font-bold text-gray-400 text-sm">
            {filteredClubs.length} resultados
          </span>
        </div>

        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onJoinRequest={() =>
                  handleJoinRequest(club.id, club.slug, club.name)
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 border-dashed bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="mb-1 font-extrabold text-gray-900 text-lg">
              Nenhum clube encontrado
            </h3>
            <p className="font-medium text-gray-500 text-sm">
              Tente ajustar os termos da sua pesquisa.
            </p>
          </div>
        )}
      </main>

      <JoinFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        clubName={selectedClubName}
      />
    </div>
  )
}
