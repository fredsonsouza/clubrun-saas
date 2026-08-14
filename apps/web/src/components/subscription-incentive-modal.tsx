'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Flame,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface SubscriptionIncentiveModalProps {
  isOpen: boolean
  onClose: () => void
  clubName?: string
  clubSlug?: string
}

export function SubscriptionIncentiveModal({
  isOpen,
  onClose,
  clubName,
  clubSlug,
}: SubscriptionIncentiveModalProps) {
  const checkoutUrl = `/checkout?plan=athlete${
    clubSlug
      ? `&clubSlug=${clubSlug}&clubName=${encodeURIComponent(clubName || '')}`
      : ''
  }`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-3xl border-none bg-white p-0 shadow-2xl sm:max-w-lg">
        {/* Cabeçalho Visual Premium com Gradiente */}
        <div className="relative flex h-44 w-full items-center justify-center bg-gradient-to-br from-gray-900 via-orange-950 to-orange-600">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />

          {/* Luzes decorativas */}
          <div className="-top-12 -right-12 absolute h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />
          <div className="-bottom-12 -left-12 absolute h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />

          <div className="relative flex flex-col items-center px-4 text-center">
            <div className="mb-3 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-orange-500 text-white shadow-orange-500/30 shadow-xl">
              <Crown className="h-9 w-9" fill="currentColor" />
            </div>
            <span className="rounded-full border border-orange-500/20 bg-orange-950/60 px-3 py-1 font-black text-[10px] text-orange-400 uppercase tracking-widest">
              Assinatura Requerida
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-8 pt-8 pb-10">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="font-black text-2xl text-gray-900 leading-tight">
              Só mais um passo e você se tornará membro do clube{' '}
              <span className="text-orange-500">"{clubName}"</span>
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-sm font-medium text-gray-500 text-sm">
              Para participar de clubes e acessar treinos, rankings e planilhas,
              ative o seu plano Atleta Premium.
            </DialogDescription>
          </DialogHeader>

          {/* Benefícios */}
          <div className="mt-6 space-y-3.5 rounded-2xl border border-orange-100/50 bg-orange-50/50 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4.5 w-4.5 shrink-0 text-orange-500" />
              <span className="font-black text-orange-800 text-xs uppercase tracking-widest">
                Benefícios do Atleta Premium:
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-start gap-2.5 font-bold text-gray-700 text-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>Participar de clubes esportivos ilimitados</span>
              </div>
              <div className="flex items-start gap-2.5 font-bold text-gray-700 text-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>
                  Enviar treinos, sincronizar fotos e postar suas metas
                </span>
              </div>
              <div className="flex items-start gap-2.5 font-bold text-gray-700 text-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>
                  Desbloquear perfil completo (Bio, Banner, Strava, Instagram,
                  etc)
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-stretch">
            <button
              type="button"
              onClick={onClose}
              className="order-2 h-14 w-full cursor-pointer rounded-2xl font-black text-gray-500 text-xs uppercase tracking-widest transition-colors hover:bg-gray-100 sm:order-1 sm:w-1/3"
            >
              Depois
            </button>
            <Link
              href={checkoutUrl}
              onClick={onClose}
              className="order-1 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-center font-black text-white text-xs uppercase tracking-widest shadow-orange-500/20 shadow-xl transition-all hover:scale-[1.02] hover:bg-orange-600 active:scale-95 sm:order-2 sm:w-2/3"
            >
              Preencher dados do cartão
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </DialogFooter>

          <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
            <div className="flex items-center gap-1 opacity-55">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-[9px] uppercase tracking-wider">
                Ambiente 100% Seguro
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-45">
              <Flame
                className="h-3.5 w-3.5 text-gray-500"
                fill="currentColor"
              />
              <span className="font-bold text-[9px] uppercase tracking-wider">
                ClubRun
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
