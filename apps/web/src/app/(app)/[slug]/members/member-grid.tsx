'use client'

import React from 'react'
import Link from 'next/link'
import {
  Mail,
  ArrowRight,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Zap,
  Users,
  Search,
  Timer,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-orange-700 uppercase">
            Fundador
          </span>
        )
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-blue-700 uppercase">
            Admin
          </span>
        )
      case 'COACH':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-emerald-700 uppercase">
            Treinador
          </span>
        )
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-indigo-700 uppercase">
            Gestor
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-gray-600 uppercase">
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            {club.name}
          </h1>
          <p className="mt-3 text-lg leading-relaxed font-medium text-gray-500">
            {club.description ||
              `Conheça os atletas e treinadores que fazem parte do ${club.name}.`}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex rounded-2xl bg-gray-100 p-1">
            <button
              onClick={() => onTabChange('all')}
              className={`rounded-xl px-5 py-2.5 text-[11px] font-black tracking-wider uppercase transition-all ${tab === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => onTabChange('athletes')}
              className={`rounded-xl px-5 py-2.5 text-[11px] font-black tracking-wider uppercase transition-all ${tab === 'athletes' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Atletas
            </button>
            <button
              onClick={() => onTabChange('coaches')}
              className={`rounded-xl px-5 py-2.5 text-[11px] font-black tracking-wider uppercase transition-all ${tab === 'coaches' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Treinadores
            </button>
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar membro..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-100 bg-white pr-4 pl-11 text-sm font-bold shadow-sm transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none md:w-64"
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
              className="group relative flex flex-col rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5"
            >
              {/* Badge no canto superior direito */}
              <div className="absolute top-8 right-8">
                {getRoleBadge(member.role)}
              </div>

              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-gray-50 shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={member.avatarUrl || ''} />
                  <AvatarFallback className="bg-gray-50 text-lg font-black text-gray-400">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-black text-gray-900 transition-colors group-hover:text-orange-500">
                    {member.name}
                  </h3>
                  <p className="flex items-center gap-1.5 truncate text-[11px] font-bold text-gray-400">
                    <Mail className="h-3 w-3" /> {member.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-gray-300 uppercase">
                    Pace Médio
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      <Timer className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-black text-gray-900">
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
                  className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-[11px] font-black tracking-wider text-gray-500 uppercase transition-all hover:bg-orange-500 hover:text-white"
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
            <h3 className="text-2xl font-black text-gray-900">
              Nenhum membro encontrado
            </h3>
            <p className="mt-2 font-medium text-gray-500">
              Tente ajustar os filtros ou o termo da sua busca.
            </p>
            <button
              onClick={() => {
                onSearchChange('')
                onTabChange('all')
              }}
              className="mt-6 text-sm font-black text-orange-500 hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
