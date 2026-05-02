'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Shield,
  ShieldAlert,
  Trash2,
  Search,
  ArrowUpDown,
  Zap,
  Loader2,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Activity,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { updateMemberAction, removeMemberAction } from './actions'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

interface MembersClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    isSystemAdmin?: boolean
  }
  club: {
    name: string
    slug: string
    description?: string | null
  }
  initialMembers: Member[]
  currentUserRole: string
}

import { MemberGrid } from './member-grid'

export function MembersClient({
  user,
  club,
  initialMembers,
  currentUserRole,
}: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'overdue' | 'athletes' | 'coaches'>('all')
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const isRestrictedRole = currentUserRole === 'ATHLETE' || currentUserRole === 'COACH'

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (tab === 'active') return matchesSearch && !m.overdue
    if (tab === 'overdue') return matchesSearch && m.overdue
    if (tab === 'athletes') return matchesSearch && m.role === 'ATHLETE'
    if (tab === 'coaches') return matchesSearch && m.role === 'COACH'
    return matchesSearch
  })

  const handleUpdateRole = async (memberId: string, newRole: Member['role']) => {
    const result = await updateMemberAction({
      slug: club.slug,
      memberId,
      role: newRole,
    })

    if (result.success) {
      toast.success(result.message)
      setMembers(
        members.map((m) => {
          if (m.id === memberId) return { ...m, role: newRole }
          if (['MANAGER', 'COACH', 'BILLING'].includes(newRole) && m.role === newRole) {
            return { ...m, role: 'ATHLETE' }
          }
          return m
        })
      )
    } else {
      toast.error(result.message)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    setIsRemoving(true)
    const result = await removeMemberAction({
      slug: club.slug,
      memberId: memberToRemove.id,
    })

    if (result.success) {
      toast.success(result.message)
      setMembers(members.filter((m) => m.id !== memberToRemove.id))
      setMemberToRemove(null)
    } else {
      toast.error(result.message)
    }
    setIsRemoving(false)
  }

  const canEdit =
    currentUserRole === 'OWNER' ||
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'MANAGER'

  if (isRestrictedRole) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
        <Header user={user} />
        <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-12 duration-700 sm:px-6 lg:px-8">
          <MemberGrid 
            members={members}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            tab={tab === 'athletes' || tab === 'coaches' ? tab : 'all'}
            onTabChange={(newTab) => setTab(newTab)}
            club={club}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        {/* CABEÇALHO DA PÁGINA (ADMIN) */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-orange-500 text-white shadow-xl shadow-orange-500/20">
              <Users className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">
              Pelotão do Clube
            </h1>
            <p className="mt-2 text-base font-medium text-gray-500">
              Gerencie os atletas, cargos e verifique o status de cada membro do <span className="text-orange-500 font-bold">{club.name}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-2xl bg-gray-100 p-1">
              <button
                onClick={() => setTab('all')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${tab === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setTab('active')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${tab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Adimplentes
              </button>
              <button
                onClick={() => setTab('overdue')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${tab === 'overdue' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Inadimplentes
              </button>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar membro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-100 bg-white pl-11 pr-4 text-sm font-bold shadow-sm transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none md:w-72"
              />
            </div>
          </div>
        </div>

        {/* LISTA DE MEMBROS */}
        <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
          <div className="hidden grid-cols-12 border-b border-gray-50 bg-gray-50/50 px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 md:grid">
            <div className="col-span-5 flex items-center gap-2">
              Atleta <ArrowUpDown className="h-3 w-3" />
            </div>
            <div className="col-span-2">Cargo</div>
            <div className="col-span-2">Pagamento</div>
            <div className="col-span-2">Membro desde</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="group grid grid-cols-1 items-center gap-4 p-6 transition-colors hover:bg-gray-50/50 md:grid-cols-12 md:px-8"
                >
                  {/* Atleta Info */}
                  <div className="col-span-5 flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-gray-100 shadow-sm transition-transform group-hover:scale-105">
                      <AvatarImage src={member.avatarUrl || ''} />
                      <AvatarFallback className="font-bold text-gray-400">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link 
                        href={`/profile/${member.userId}`}
                        className="truncate text-base font-black text-gray-900 hover:text-orange-500 transition-colors"
                      >
                        {member.name}
                      </Link>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <Mail className="h-3 w-3" /> {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="col-span-2">
                    <div className="flex md:block">
                      <span className="mr-2 text-[10px] font-black uppercase tracking-widest text-gray-300 md:hidden">Cargo:</span>
                      {member.role === 'OWNER' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">
                          <ShieldAlert className="h-3.5 w-3.5" /> Fundador
                        </span>
                      ) : member.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                          <ShieldCheck className="h-3.5 w-3.5" /> Administrador
                        </span>
                      ) : member.role === 'MANAGER' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                          <Shield className="h-3.5 w-3.5" /> Gestor
                        </span>
                      ) : member.role === 'COACH' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                          <Activity className="h-3.5 w-3.5" /> Coach
                        </span>
                      ) : member.role === 'BILLING' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                          <Zap className="h-3.5 w-3.5" /> Financeiro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <Users className="h-3.5 w-3.5" /> Atleta
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status de Pagamento */}
                  <div className="col-span-2">
                    <div className="flex md:block">
                      <span className="mr-2 text-[10px] font-black uppercase tracking-widest text-gray-300 md:hidden">Pagamento:</span>
                      {!member.overdue ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          <CheckCircle2 className="h-4 w-4" /> Em dia
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500">
                          <AlertCircle className="h-4 w-4" /> Inadimplente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Data */}
                  <div className="col-span-2">
                    <div className="flex md:block">
                      <span className="mr-2 text-[10px] font-black uppercase tracking-widest text-gray-300 md:hidden">Membro desde:</span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-300" /> {member.joinedAt}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="col-span-1 flex justify-end">
                    {canEdit && member.role !== 'OWNER' && member.id !== user.id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-sm ring-1 ring-transparent hover:ring-gray-100 transition-all focus:outline-none">
                          <MoreHorizontal className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="w-56 rounded-2xl border-gray-100 bg-white/95 p-2 shadow-2xl backdrop-blur-md"
                        >
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Gerenciar Membro</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-50" />
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.id, 'MANAGER')}
                            className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:bg-orange-50 focus:text-orange-600 transition-colors"
                          >
                            <Shield className="h-4 w-4 text-indigo-500" /> Tornar Gestor
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.id, 'COACH')}
                            className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:bg-orange-50 focus:text-orange-600 transition-colors"
                          >
                            <Activity className="h-4 w-4 text-emerald-500" /> Tornar Treinador
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.id, 'BILLING')}
                            className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:bg-orange-50 focus:text-orange-600 transition-colors"
                          >
                            <Zap className="h-4 w-4 text-amber-500" /> Tornar Financeiro
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.id, 'ATHLETE')}
                            className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:bg-orange-50 focus:text-orange-600 transition-colors"
                          >
                            <Users className="h-4 w-4 text-gray-400" /> Tornar Atleta
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-50" />
                           <DropdownMenuItem 
                            onClick={() => setMemberToRemove(member)}
                            className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Remover do Clube
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-200">
                        <Zap className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="mb-4 h-12 w-12 text-gray-200" />
                <h3 className="text-xl font-black text-gray-900">Nenhum atleta encontrado</h3>
                <p className="mt-2 text-sm font-medium text-gray-500">Tente ajustar os termos da sua busca.</p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE REMOÇÃO */}
        <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="h-6 w-6" />
                </div>
                Remover Membro
              </DialogTitle>
              <DialogDescription className="pt-4 text-base">
                Tem certeza que deseja remover <span className="font-black text-gray-900">{memberToRemove?.name}</span> do pelotão?
              </DialogDescription>
              <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">
                O atleta perderá acesso imediato aos treinos privados, rankings mensais e histórico de atividades do clube. Esta ação pode ser revertida apenas com um novo convite.
              </p>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-3">
              <button
                onClick={() => setMemberToRemove(null)}
                className="cursor-pointer flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="cursor-pointer flex-[1.5] rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isRemoving ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    REMOVENDO...
                  </div>
                ) : (
                  'CONFIRMAR REMOÇÃO'
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
