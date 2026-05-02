'use client'

import React from 'react'
import {
  Users,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutDashboard,
} from 'lucide-react'
import Link from 'next/link'

export interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  membersCount: number
  location: string | null
  // Estados mockados para a UI saber como o usuário interage com este clube
  membershipStatus: 'NONE' | 'PENDING' | 'ATHLETE' | 'OWNER'
}

interface ClubCardProps {
  club: Club
  onJoinRequest?: (clubId: string) => void
}

export function ClubCard({ club, onJoinRequest }: ClubCardProps) {
  // Define o visual das ações baseado no status do usuário
  const renderActions = () => {
    const isMember =
      club.membershipStatus === 'ATHLETE' || club.membershipStatus === 'OWNER'
    const isPending = club.membershipStatus === 'PENDING'

    if (isMember) {
      return (
        <Link
          href={`/${club.slug}/dashboard`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Acessar Painel
        </Link>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        {/* Botão de Status / Solicitação */}
        {isPending ? (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-orange-50 py-3 text-sm font-bold text-orange-500"
          >
            <Clock className="h-4 w-4" /> Solicitação Pendente
          </button>
        ) : (
          <button
            onClick={() => onJoinRequest?.(club.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Pedir para Participar <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* Botão secundário de Acesso (Novo) */}
        <Link
          href={`/${club.slug}/dashboard`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 py-3 text-sm font-bold text-gray-600 transition-all hover:border-gray-200 hover:bg-white hover:text-gray-900 active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Acessar Painel
        </Link>
      </div>
    )
  }

  return (
    <div className="group flex h-full flex-col rounded-4xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5">
      {/* Header do Cartão */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-black text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-orange-50 group-hover:text-orange-500">
          {club.name.charAt(0)}
        </div>
        {club.membershipStatus === 'ATHLETE' && (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold tracking-wider text-green-600 uppercase">
            <CheckCircle2 className="h-3 w-3" /> Inscrito
          </span>
        )}
        {club.membershipStatus === 'OWNER' && (
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold tracking-wider text-orange-600 uppercase">
            Dono
          </span>
        )}
      </div>

      {/* Info do Clube */}
      <div className="flex-1">
        <h3
          className="mb-2 truncate text-xl font-extrabold text-gray-900"
          title={club.name}
        >
          {club.name}
        </h3>
        <p className="mb-6 line-clamp-2 text-sm leading-relaxed font-medium text-gray-500">
          {club.description || 'Nenhuma descrição fornecida pela equipe.'}
        </p>
      </div>

      {/* Metadados e Ação */}
      <div className="mt-auto space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-400">
          <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 transition-colors group-hover:border-gray-200">
            <Users className="h-3.5 w-3.5 text-gray-400" /> {club.membersCount}{' '}
            MEMBROS
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 transition-colors group-hover:border-gray-200">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />{' '}
            {club.location?.toUpperCase() || 'GLOBAL'}
          </span>
        </div>

        {renderActions()}
      </div>
    </div>
  )
}
