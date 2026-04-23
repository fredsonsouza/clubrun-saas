'use client'

import React, { useState } from 'react'
import { Check, X, Flame, Users, MapPin, ShieldAlert } from 'lucide-react'

export default function AcceptInvitePreviewPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [inviteStatus, setInviteStatus] = useState('PENDING') // PENDING, ACCEPTED, REJECTED, REVOKED

  const MOCK_INVITE_DETAILS = {
    club: {
      name: 'Macuxi Runner',
      description:
        'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
      location: 'Boa Vista, RR',
      membersCount: 84,
    },
    inviter: {
      name: 'Fredson Souza',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
    role: 'MEMBER',
  }

  const handleAccept = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setInviteStatus('ACCEPTED')
      alert('Convite Aceite! Redirecionando para o Dashboard...')
    }, 1500)
  }

  const handleReject = () => {
    if (confirm('Tem a certeza que deseja recusar este convite?')) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setInviteStatus('REJECTED')
      }, 1000)
    }
  }

  if (inviteStatus === 'REVOKED' || inviteStatus === 'REJECTED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans selection:bg-orange-500 selection:text-white">
        <div className="animate-in zoom-in-95 w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-gray-900">
            Convite Inválido
          </h2>
          <p className="mb-6 text-sm font-medium text-gray-500">
            Este convite expirou, foi revogado pelo administrador ou já foi
            recusado.
          </p>
          <button
            onClick={() => setInviteStatus('PENDING')}
            className="w-full rounded-xl bg-gray-900 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-800"
          >
            Voltar (Reset Simulação)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-4 font-sans selection:bg-orange-500 selection:text-white sm:p-6">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[100px]" />

      <div className="absolute top-0 left-0 flex w-full justify-center p-6 sm:justify-start">
        <div className="flex items-center gap-2">
          <Flame className="h-8 w-8 text-orange-500" fill="currentColor" />
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            Club<span className="text-orange-500">Run</span>
          </span>
        </div>
      </div>

      <div className="animate-in zoom-in-95 relative z-10 w-full max-w-lg duration-500">
        <div className="relative z-20 -mb-10 flex justify-center">
          <div className="relative transition-transform hover:-translate-y-1">
            <img
              src={MOCK_INVITE_DETAILS.inviter.avatarUrl}
              alt={MOCK_INVITE_DETAILS.inviter.name}
              className="h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-lg"
            />
            <div className="absolute -right-2 -bottom-2 rounded-full bg-white p-1 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                <Flame className="h-3 w-3" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white px-6 pt-16 pb-8 text-center shadow-xl sm:px-10">
          <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
            {MOCK_INVITE_DETAILS.inviter.name} convidou-te!
          </h1>

          <p className="mb-8 text-sm font-medium text-gray-500">
            Foste convidado para te juntares à equipa como{' '}
            <strong className="text-gray-900">
              {MOCK_INVITE_DETAILS.role === 'MANAGER'
                ? 'Administrador'
                : 'Atleta'}
            </strong>
            .
          </p>

          <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-xl font-black text-gray-400 shadow-sm">
                {MOCK_INVITE_DETAILS.club.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900">
                  {MOCK_INVITE_DETAILS.club.name}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{' '}
                    {MOCK_INVITE_DETAILS.club.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />{' '}
                    {MOCK_INVITE_DETAILS.club.membersCount}
                  </span>
                </div>
              </div>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed font-medium text-gray-500">
              {MOCK_INVITE_DETAILS.club.description}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Check className="h-5 w-5" /> Aceitar Convite
                </>
              )}
            </button>

            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 font-bold text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-70"
            >
              <X className="h-5 w-5" /> Recusar
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-bold tracking-widest text-gray-400 uppercase">
          O teu perfil será associado a este clube
        </p>
      </div>
    </div>
  )
}
