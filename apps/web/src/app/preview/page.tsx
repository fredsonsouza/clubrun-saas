'use client'

import React, { useState } from 'react'
import {
  Search,
  Filter,
  Shield,
  User,
  Trash2,
  MoreVertical,
  Flame,
  UserPlus,
  ChevronDown,
  Activity,
} from 'lucide-react'

// ==========================================
// MOCKS E TIPOS
// ==========================================
type Role = 'OWNER' | 'MANAGER' | 'MEMBER'

interface ClubMember {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl: string
  joinedAt: string
}

const MOCK_MEMBERS: ClubMember[] = [
  {
    id: 'usr-1',
    name: 'Fredson Souza',
    email: 'fredson@exemplo.com',
    role: 'OWNER',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    joinedAt: '01 Abr 2026',
  },
  {
    id: 'usr-2',
    name: 'Ana Paula',
    email: 'ana.paula@exemplo.com',
    role: 'MANAGER',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    joinedAt: '05 Abr 2026',
  },
  {
    id: 'usr-3',
    name: 'Carlos Silva',
    email: 'carlos@exemplo.com',
    role: 'MEMBER',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    joinedAt: '10 Abr 2026',
  },
  {
    id: 'usr-4',
    name: 'Elena Costa',
    email: 'elena@exemplo.com',
    role: 'MEMBER',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    joinedAt: '12 Abr 2026',
  },
]

export default function MembersPreviewMonolithic() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [members, setMembers] = useState<ClubMember[]>(MOCK_MEMBERS)

  const currentUserId = 'usr-1'
  const currentUserRole: Role = 'OWNER'

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
    setActiveDropdown(null)
  }

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este atleta do clube?')) {
      setMembers(members.filter((m) => m.id !== memberId))
      setActiveDropdown(null)
    }
  }

  const RoleBadge = ({ role }: { role: Role }) => {
    if (role === 'OWNER')
      return (
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-bold tracking-wider text-orange-600 uppercase">
          <Shield className="h-3 w-3" /> Proprietário
        </span>
      )
    if (role === 'MANAGER')
      return (
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
          <User className="h-3 w-3" /> Administrador
        </span>
      )
    return (
      <span className="flex w-fit items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
        Atleta
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* SIMULAÇÃO DO COMPONENTE HEADER */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex cursor-pointer items-center gap-2">
              <Flame className="h-7 w-7 text-orange-500" fill="currentColor" />
              <span className="hidden text-xl font-extrabold tracking-tight text-gray-900 sm:block">
                Club<span className="text-orange-500">Run</span>
              </span>
            </div>
            <div className="hidden h-6 w-px bg-gray-200 md:block"></div>
            <button className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 md:flex">
              Macuxi Runner <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="hidden items-center gap-6 text-sm font-bold text-gray-500 lg:flex">
            <span className="cursor-pointer transition-colors hover:text-gray-900">
              Dashboard
            </span>
            <span className="cursor-pointer transition-colors hover:text-gray-900">
              Ranking
            </span>
            <span className="flex h-16 cursor-pointer items-center border-b-2 border-orange-500 text-orange-600">
              Membros
            </span>
            <span className="cursor-pointer transition-colors hover:text-gray-900">
              Configurações
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 sm:flex">
              <UserPlus className="h-4 w-4" /> Convidar
            </button>
            <div className="h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-gray-200 transition-colors hover:border-orange-500">
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Perfil"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL (Membros) */}
      <main className="animate-in fade-in mx-auto max-w-5xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
              Equipe e Atletas
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Gerencie quem faz parte do seu clube e defina permissões.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm font-medium shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm hover:bg-gray-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 p-4 text-xs font-bold tracking-wider text-gray-400 uppercase md:grid">
            <div className="col-span-5">Atleta</div>
            <div className="col-span-3">Cargo</div>
            <div className="col-span-3">Entrou em</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isMe = member.id === currentUserId
                const canManage =
                  currentUserRole === 'OWNER' ||
                  (currentUserRole === 'MANAGER' && member.role !== 'OWNER')
                return (
                  <div
                    key={member.id}
                    className="relative grid grid-cols-1 items-center gap-4 p-5 transition-colors hover:bg-gray-50 md:grid-cols-12"
                  >
                    <div className="col-span-1 flex items-center gap-3 md:col-span-5">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="h-12 w-12 rounded-full border border-gray-200 bg-white"
                      />
                      <div>
                        <p className="font-bold text-gray-900">
                          {member.name}{' '}
                          {isMe && (
                            <span className="ml-1 text-sm font-normal text-gray-400">
                              (Você)
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-1 mt-2 flex items-center md:col-span-3 md:mt-0">
                      <RoleBadge role={member.role} />
                    </div>
                    <div className="col-span-1 hidden text-sm font-medium text-gray-500 sm:flex md:col-span-3">
                      {member.joinedAt}
                    </div>
                    <div className="absolute top-5 right-5 col-span-1 flex justify-end md:static md:col-span-1">
                      {canManage && !isMe && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === member.id ? null : member.id
                              )
                            }
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {activeDropdown === member.id && (
                            <div className="animate-in fade-in zoom-in-95 absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl duration-100">
                              {currentUserRole === 'OWNER' && (
                                <>
                                  <div className="mb-1 px-3 py-1">
                                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                      Alterar Cargo
                                    </span>
                                  </div>
                                  {member.role !== 'MANAGER' && (
                                    <button
                                      onClick={() =>
                                        handleRoleChange(member.id, 'MANAGER')
                                      }
                                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                      <User className="h-4 w-4 text-blue-500" />{' '}
                                      Tornar Admin
                                    </button>
                                  )}
                                  {member.role !== 'MEMBER' && (
                                    <button
                                      onClick={() =>
                                        handleRoleChange(member.id, 'MEMBER')
                                      }
                                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                      <Activity className="h-4 w-4 text-gray-400" />{' '}
                                      Rebaixar para Atleta
                                    </button>
                                  )}
                                  <div className="my-2 h-px bg-gray-100" />
                                </>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" /> Remover do Clube
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="mb-1 text-lg font-extrabold text-gray-900">
                  Nenhum atleta encontrado
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  Não encontramos ninguém com "{searchQuery}".
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
