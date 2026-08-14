'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity,
  ArrowRight,
  Mail,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  joinedAt: string
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'TRIAL'
  overdue: boolean
  paceAvg?: number | null
}

interface MemberGridProps {
  members: Member[]
  searchTerm: string
  onSearchChange: (value: string) => void
  tab: 'all' | 'athletes' | 'coaches'
  onTabChange: (tab: 'all' | 'athletes' | 'coaches') => void
  club: {
    name: string
    description?: string | null
  }
}

export function MemberGrid({
  members,
  searchTerm,
  onSearchChange,
  tab,
  onTabChange,
  club,
}: MemberGridProps) {
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())

    if (tab === 'athletes') return matchesSearch && m.role === 'ATHLETE'
    if (tab === 'coaches') return matchesSearch && m.role === 'COACH'
    return matchesSearch
  })

  function getRoleBadge(role: Member['role']) {
    switch (role) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 font-black text-[9px] text-orange-700 uppercase tracking-wider">
            Fundador
          </span>
        )
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 font-black text-[9px] text-blue-700 uppercase tracking-wider">
            Admin
          </span>
        )
      case 'COACH':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-black text-[9px] text-emerald-700 uppercase tracking-wider">
            Treinador
          </span>
        )
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 font-black text-[9px] text-indigo-700 uppercase tracking-wider">
            Gestor
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 font-black text-[9px] text-gray-600 uppercase tracking-wider">
            Atleta
          </span>
        )
    }
  }

  return (
    <div className="space-y-10">
      {/* HEADER EXCLUSIVO PARA MEMBROS */}
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-orange-500/20 shadow-xl">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="font-black text-4xl text-gray-900 tracking-tight">
            {club.name}
          </h1>
          <p className="mt-3 font-medium text-gray-500 text-lg leading-relaxed">
            {club.description ||
              `Conheça os atletas e treinadores que fazem parte do ${club.name}.`}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex rounded-2xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => onTabChange('all')}
              className={`rounded-xl px-5 py-2.5 font-black text-[11px] uppercase tracking-wider transition-all ${tab === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => onTabChange('athletes')}
              className={`rounded-xl px-5 py-2.5 font-black text-[11px] uppercase tracking-wider transition-all ${tab === 'athletes' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Atletas
            </button>
            <button
              type="button"
              onClick={() => onTabChange('coaches')}
              className={`rounded-xl px-5 py-2.5 font-black text-[11px] uppercase tracking-wider transition-all ${tab === 'coaches' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Treinadores
            </button>
          </div>

          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar membro..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-100 bg-white pr-4 pl-11 font-bold text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 md:w-64"
            />
          </div>
        </div>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="group hover:-translate-y-1 relative flex flex-col rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-orange-500/5 hover:shadow-xl"
            >
              {/* Badge no canto superior direito */}
              <div className="absolute top-8 right-8">
                {getRoleBadge(member.role)}
              </div>

              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-gray-50 shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={member.avatarUrl || ''} />
                  <AvatarFallback className="bg-gray-50 font-black text-gray-400 text-lg">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black text-gray-900 text-lg transition-colors group-hover:text-orange-500">
                    {member.name}
                  </h3>
                  <p className="flex items-center gap-1.5 truncate font-bold text-[11px] text-gray-400">
                    <Mail className="h-3 w-3" /> {member.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <span className="font-black text-[10px] text-gray-300 uppercase tracking-widest">
                    Pace Médio
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      <Timer className="h-4 w-4" />
                    </div>
                    <span className="font-black text-gray-900 text-xl">
                      {member.paceAvg
                        ? member.paceAvg.toFixed(2).replace('.', ':')
                        : '--:--'}
                      <span className="ml-1 text-[10px] text-gray-400">
                        min/km
                      </span>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/profile/${member.userId}`}
                  className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 font-black text-[11px] text-gray-500 uppercase tracking-wider transition-all hover:bg-orange-500 hover:text-white"
                >
                  Visitar perfil
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-4xl bg-gray-50 text-gray-200">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="font-black text-2xl text-gray-900">
              Nenhum membro encontrado
            </h3>
            <p className="mt-2 font-medium text-gray-500">
              Tente ajustar os filtros ou o termo da sua busca.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('')
                onTabChange('all')
              }}
              className="mt-6 font-black text-orange-500 text-sm hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
