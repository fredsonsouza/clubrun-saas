'use client'

import { AdminHeader } from '@/components/admin-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowUpDown,
  Building2,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

interface Club {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  createdAt: string
  owner: {
    name: string | null
    email: string
  }
  _count: {
    members: number
  }
}

interface AdminClubsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  initialClubs: Club[]
}

export function AdminClubsClient({
  user,
  initialClubs,
}: AdminClubsClientProps) {
  const [search, setSearch] = useState('')

  const filteredClubs = initialClubs.filter(
    (club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.slug.toLowerCase().includes(search.toLowerCase()) ||
      club.owner.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <AdminHeader user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gray-900 text-orange-500 shadow-gray-900/20 shadow-xl">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="font-black text-4xl text-gray-900 tracking-tight">
              Gestão de Clubes
            </h1>
            <p className="mt-2 font-medium text-base text-gray-500">
              Gerencie todos os pelotões registrados na plataforma.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, slug ou dono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-white py-4 pr-4 pl-12 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* CLUBS TABLE */}
        <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-gray-50 border-b bg-gray-50/50">
                  <th className="px-8 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Clube
                  </th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Proprietário
                  </th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Membros
                  </th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Criado em
                  </th>
                  <th className="px-8 py-6 text-right font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClubs.length > 0 ? (
                  filteredClubs.map((club) => (
                    <tr
                      key={club.id}
                      className="group transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-2xl border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                            <AvatarImage
                              src={club.avatarUrl || ''}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-orange-50 font-black text-orange-500">
                              {club.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-base text-gray-900">
                              {club.name}
                            </p>
                            <p className="font-bold text-gray-400 text-xs">
                              /{club.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-900 text-sm">
                          {club.owner.name || 'Sem nome'}
                        </p>
                        <p className="font-medium text-gray-400 text-xs">
                          {club.owner.email}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="font-black text-gray-700 text-sm">
                            {club._count.members}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 text-gray-300" />
                          {new Date(club.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/${club.slug}/dashboard`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all hover:bg-gray-900 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                          <Search className="h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="font-black text-gray-900 text-xl">
                        Nenhum clube encontrado
                      </h3>
                      <p className="font-medium text-gray-400 text-sm">
                        Tente buscar por outros termos ou verifique se há
                        pelotões registrados.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
