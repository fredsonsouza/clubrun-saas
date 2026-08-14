'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Check,
  Flame,
  MapPin,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface InviteClientProps {
  invite: {
    id: string
    club: {
      name: string
      description: string | null
      location: string
      membersCount: number
      avatarUrl?: string | null
    }
    inviter: {
      name: string
      avatarUrl: string | null
    }
    role: string
    status: string
  }
}

export function InviteClient({ invite }: InviteClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [inviteStatus, setInviteStatus] = useState(invite.status)

  const handleAccept = () => {
    setIsLoading(true)
    // API Call: POST /invites/:id/accept
    setTimeout(() => {
      setIsLoading(false)
      setInviteStatus('ACCEPTED')
      router.push(
        `/${invite.club.name.toLowerCase().replace(/\s+/g, '-')}/dashboard`
      )
    }, 1500)
  }

  const handleReject = () => {
    setIsLoading(true)
    // API Call: POST /invites/:id/reject
    setTimeout(() => {
      setIsLoading(false)
      setInviteStatus('REJECTED')
      router.push('/explore')
    }, 1000)
  }

  if (inviteStatus === 'REVOKED' || inviteStatus === 'REJECTED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="zoom-in-95 w-full max-w-md animate-in rounded-[2.5rem] border border-gray-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="mb-2 font-extrabold text-2xl text-gray-900">
            Convite Indisponível
          </h2>
          <p className="mb-8 font-medium text-gray-500 text-sm leading-relaxed">
            Este convite expirou, foi revogado pelo administrador ou já foi
            processado anteriormente.
          </p>
          <button
            type="button"
            onClick={() => router.push('/explore')}
            className="w-full cursor-pointer rounded-2xl bg-gray-900 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
          >
            Explorar outros clubes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-4 font-sans selection:bg-orange-500 selection:text-white sm:p-6">
      {/* Background Decorativo Dinâmico */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[1000px] w-[1000px] rounded-full bg-orange-500/3 blur-[120px]" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/2 blur-[100px]" />
      </div>

      {/* Header Minimalista */}
      <header className="absolute top-0 left-0 flex w-full justify-center p-8 sm:justify-start">
        <div className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <Flame className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <span className="font-black text-2xl text-gray-900 tracking-tighter">
            Club<span className="text-orange-500">Run</span>
          </span>
        </div>
      </header>

      <div className="fade-in slide-in-from-bottom-8 relative z-10 w-full max-w-lg animate-in duration-700">
        {/* Avatar Flutuante do Convidante */}
        <div className="-mb-12 relative z-20 flex justify-center">
          <div className="group relative">
            <div className="-inset-1 absolute rounded-full bg-linear-to-tr from-orange-500 to-amber-400 opacity-75 blur-sm transition duration-500 group-hover:opacity-100" />
            <Avatar className="relative h-24 w-24 border-4 border-white bg-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
              <AvatarImage
                src={invite.inviter.avatarUrl || ''}
                className="object-cover"
              />
              <AvatarFallback className="font-bold text-2xl text-gray-400">
                {invite.inviter.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="-right-1 -bottom-1 absolute flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg">
              <UserPlus className="h-3.5 w-3.5" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Card Principal */}
        <div className="relative overflow-hidden rounded-[3rem] border border-gray-100 bg-white px-6 pt-20 pb-10 text-center shadow-2xl sm:px-12">
          <div className="pointer-events-none absolute top-0 left-0 h-32 w-full bg-linear-to-b from-gray-50 to-transparent" />

          <div className="relative z-10">
            <h1 className="mb-2 font-black text-3xl text-gray-900 tracking-tight">
              {invite.inviter.name.split(' ')[0]} convidou você!
            </h1>
            <p className="mb-10 font-medium text-gray-500 text-sm leading-relaxed">
              Prepare seus tênis! Você recebeu um convite exclusivo para ser{' '}
              <span className="rounded-lg bg-orange-50 px-2.5 py-1 font-black text-orange-600">
                {invite.role === 'MANAGER' ? 'Gestor' : 'Atleta'}
              </span>{' '}
              neste clube.
            </p>

            {/* Widget do Clube */}
            <div className="group/club mb-10 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/50 p-6 text-left transition-all hover:border-orange-200 hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white font-black text-2xl text-gray-300 shadow-sm ring-1 ring-gray-100 transition-transform group-hover/club:scale-105 group-hover/club:text-orange-500">
                  {invite.club.avatarUrl ? (
                    <img
                      src={invite.club.avatarUrl}
                      alt={invite.club.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    invite.club.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black text-gray-900 text-xl">
                    {invite.club.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-orange-500" />{' '}
                      {invite.club.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-orange-500" />{' '}
                      {invite.club.membersCount} MEMBROS
                    </span>
                  </div>
                </div>
              </div>
              {invite.club.description && (
                <p className="mt-5 line-clamp-2 font-medium text-gray-500 text-xs leading-relaxed">
                  {invite.club.description}
                </p>
              )}
            </div>

            {/* Ações de Decisão */}
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAccept}
                disabled={isLoading}
                className="order-last flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70 sm:order-first"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Check className="h-5 w-5" strokeWidth={3} /> ACEITAR
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={isLoading}
                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 font-bold text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-70"
              >
                <X className="h-5 w-5" /> RECUSAR
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 font-black text-[10px] text-gray-400 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 text-orange-400" /> Junte-se à
            comunidade
          </div>
          <p className="max-w-[280px] text-center font-medium text-[10px] text-gray-400 leading-relaxed">
            Ao aceitar, você concorda em compartilhar seu histórico de treinos
            com os membros do clube.
          </p>
        </div>
      </div>
    </div>
  )
}
