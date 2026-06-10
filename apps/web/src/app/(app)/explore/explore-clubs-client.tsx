'use client'

import React, { useState, useEffect } from 'react'
import { Search, Flame, Compass } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { ClubCard, Club } from '@/components/club-card'
import { requestJoinClub } from '@/http/request-join-club'
import { JoinFeedbackModal } from '@/components/join-feedback-modal'
import { SubscriptionIncentiveModal } from '@/components/subscription-incentive-modal'

interface ExploreClubsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  initialClubs: Club[]
}

export function ExploreClubsClient({ user, initialClubs }: ExploreClubsClientProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [clubs, setClubs] = useState<Club[]>(initialClubs)
  
  // Estados do Modal de Feedback
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [selectedClubName, setSelectedClubName] = useState('')

  // Assinatura do Atleta
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isIncentiveOpen, setIsIncentiveOpen] = useState(false)
  const [incentiveClubName, setIncentiveClubName] = useState('')
  const [incentiveClubSlug, setIncentiveClubSlug] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSubscribed(localStorage.getItem('clubrun:athlete_subscribed') === 'true')
    }
  }, [])

  useEffect(() => {
    const checkoutComplete = searchParams.get('checkoutComplete')
    const joinedClubName = searchParams.get('joinedClubName')
    if (checkoutComplete === 'true') {
      if (joinedClubName) {
        setSelectedClubName(decodeURIComponent(joinedClubName))
        setModalType('success')
        setIsModalOpen(true)
      }
      
      // Atualiza o estado local de assinatura
      setIsSubscribed(true)

      // Limpa os parâmetros da URL para uma navegação limpa
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location &&
        c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleJoinRequest = async (clubId: string, slug: string, name: string) => {
    // Se o usuário não for assinante premium, abre o modal de incentivo
    if (!isSubscribed) {
      setIncentiveClubName(name)
      setIncentiveClubSlug(slug)
      setIsIncentiveOpen(true)
      return
    }

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

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-10 duration-500 sm:px-6 lg:px-8">
        {/* HERO DA BUSCA */}
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

        {/* GRID DE CLUBES */}
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
              <ClubCard
                key={club.id}
                club={club}
                onJoinRequest={() => handleJoinRequest(club.id, club.slug, club.name)}
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

      <JoinFeedbackModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        clubName={selectedClubName}
      />

      <SubscriptionIncentiveModal
        isOpen={isIncentiveOpen}
        onClose={() => setIsIncentiveOpen(false)}
        clubName={incentiveClubName}
        clubSlug={incentiveClubSlug}
      />
    </div>
  )
}
