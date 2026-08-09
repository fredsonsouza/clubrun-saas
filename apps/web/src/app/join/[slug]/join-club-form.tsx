'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { joinClub } from '@/http/join-club'
import { ArrowRight, CheckCircle2, Flame, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface JoinClubFormProps {
  club: {
    name: string
    slug: string
    avatarUrl: string | null
    description?: string | null
  }
  token: string
  user: {
    name: string | null
    email: string
  }
}

export function JoinClubForm({ club, token, user }: JoinClubFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      await joinClub(club.slug, token)
      setIsSuccess(true)
      toast.success('Solicitação enviada com sucesso!')

      setTimeout(() => {
        router.push('/explore')
      }, 5000)
    } catch (error) {
      toast.error(
        'Falha ao entrar no clube. Verifique o link ou se você já é membro.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="zoom-in-95 w-full max-w-lg animate-in rounded-[2.5rem] border border-gray-100 bg-white p-12 text-center shadow-xl duration-500">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-green-500/10 shadow-xl">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="mb-4 font-black text-3xl text-gray-900 tracking-tight">
          Tudo pronto, Atleta!
        </h2>
        <p className="mb-10 font-medium text-gray-500 text-lg">
          Sua solicitação para entrar no{' '}
          <span className="font-bold text-orange-500">{club.name}</span> foi
          enviada. Agora é só aguardar a aprovação dos administradores.
        </p>
        <div className="flex items-center justify-center gap-2 font-black text-gray-400 text-xs uppercase tracking-widest">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecionando...
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in slide-in-from-bottom-8 w-full max-w-lg animate-in overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl duration-700">
      {/* Top Banner */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-orange-500/10 blur-3xl" />
        <Flame
          className="relative z-10 h-12 w-12 text-orange-500"
          fill="currentColor"
        />
      </div>

      <div className="-mt-8 relative z-10 px-8 pt-0 pb-12 text-center">
        <Avatar className="mx-auto mb-6 h-24 w-24 border-4 border-white shadow-xl">
          <AvatarImage src={club.avatarUrl || ''} />
          <AvatarFallback className="bg-orange-500 font-black text-2xl text-white">
            {club.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <h1 className="mb-2 font-black text-3xl text-gray-900 tracking-tight">
          {club.name}
        </h1>
        <p className="mb-6 font-bold text-gray-400 text-sm uppercase tracking-widest">
          Convite para Pelotão
        </p>

        <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left">
          <p className="font-medium text-gray-600 text-sm italic leading-relaxed">
            "
            {club.description ||
              'Este clube ainda não definiu uma descrição, mas com certeza o ritmo é forte!'}
            "
          </p>
        </div>

        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-center gap-3 font-bold text-gray-700 text-sm">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Acesso aos treinos do clube
          </div>
          <div className="flex items-center justify-center gap-3 font-bold text-gray-700 text-sm">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Participação no ranking mensal
          </div>
          <div className="flex items-center justify-center gap-3 font-bold text-gray-700 text-sm">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Comunidade de corredores
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={isLoading}
          className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-orange-500 py-5 font-black text-white shadow-orange-500/20 shadow-xl transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              SOLICITAR PARTICIPAÇÃO
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <p className="mt-8 font-medium text-gray-400 text-xs">
          Logado como{' '}
          <span className="font-bold text-gray-900">{user.email}</span>
        </p>
      </div>
    </div>
  )
}
