'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Sparkles, UserCheck } from 'lucide-react'
import { acceptInvite } from '@/http/accept-invite'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface AcceptInviteFormProps {
  invite: {
    id: string
    role: string
    club: {
      name: string
    }
    author: {
      name: string | null
      avatarUrl: string | null
    } | null
  }
  user: {
    name: string | null
    email: string
  }
}

export function AcceptInviteForm({ invite, user }: AcceptInviteFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptInvite(invite.id)
      setIsSuccess(true)
      toast.success('Convite aceito! Bem-vindo ao clube.')

      setTimeout(() => {
        // Redireciona para o dashboard do clube
        // Nota: Precisamos do slug do clube aqui, mas o invite só traz o name.
        // Vou assumir que o slug está na URL ou passar via prop se necessário.
        router.refresh()
      }, 2000)
    } catch (error) {
      toast.error('Falha ao aceitar convite. Ele pode ter expirado.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="animate-in zoom-in-95 w-full max-w-lg rounded-[2.5rem] border border-gray-100 bg-white p-12 text-center shadow-xl duration-500">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-xl shadow-orange-500/10">
          <Sparkles className="h-12 w-12" />
        </div>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900">
          Convite Aceito!
        </h2>
        <p className="mb-10 text-lg font-medium text-gray-500">
          Agora você é oficialmente parte do{' '}
          <span className="font-bold text-orange-500">{invite.club.name}</span>.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs font-black tracking-widest text-gray-400 uppercase">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparando seu dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl duration-700">
      <div className="relative p-12 text-center">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/5 to-transparent" />
        
        <div className="relative z-10">
          <div className="mb-8 flex justify-center -space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg ring-1 ring-gray-100">
              <AvatarImage src={invite.author?.avatarUrl || ''} />
              <AvatarFallback className="bg-gray-100 text-gray-400 font-bold">
                {invite.author?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="z-20 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg">
              <UserCheck className="h-8 w-8" />
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-black tracking-tight text-gray-900">
            Você foi convidado!
          </h1>
          
          <p className="mb-8 text-lg font-medium text-gray-500 leading-relaxed">
            <span className="font-bold text-gray-900">{invite.author?.name || 'Um administrador'}</span> te convidou para ser{' '}
            <span className="font-bold text-orange-500">{invite.role === 'ADMIN' ? 'Administrador' : invite.role === 'COACH' ? 'Treinador' : 'Atleta'}</span> no{' '}
            <span className="font-bold text-gray-900">{invite.club.name}</span>.
          </p>

          <div className="mb-10 rounded-2xl bg-orange-50/50 p-6 border border-orange-100">
            <p className="text-sm font-bold text-orange-800">
              Ao aceitar, você terá acesso imediato aos treinos e métricas do clube.
            </p>
          </div>

          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="h-16 w-full rounded-2xl bg-orange-500 text-lg font-black text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              'ACEITAR E ENTRAR NO CLUBE'
            )}
          </Button>

          <p className="mt-8 text-xs font-medium text-gray-400">
            Conectado como <span className="font-bold text-gray-900">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
