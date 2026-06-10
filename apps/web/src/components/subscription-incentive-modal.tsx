'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Crown, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react'
import Link from 'next/link'

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
    clubSlug ? `&clubSlug=${clubSlug}&clubName=${encodeURIComponent(clubName || '')}` : ''
  }`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-lg bg-white shadow-2xl rounded-3xl">
        {/* Cabeçalho Visual Premium com Gradiente */}
        <div className="relative h-44 w-full bg-gradient-to-br from-gray-900 via-orange-950 to-orange-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
          
          {/* Luzes decorativas */}
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />

          <div className="relative flex flex-col items-center text-center px-4">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/30 animate-pulse">
              <Crown className="h-9 w-9" fill="currentColor" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-500/20">
              Assinatura Requerida
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-8 pt-8 pb-10">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl font-black text-gray-900 leading-tight">
              Só mais um passo e você se tornará membro do clube <span className="text-orange-500">"{clubName}"</span>
            </DialogTitle>
            <DialogDescription className="mt-3 text-sm font-medium text-gray-500 max-w-sm">
              Para participar de clubes e acessar treinos, rankings e planilhas, ative o seu plano Atleta Premium.
            </DialogDescription>
          </DialogHeader>

          {/* Benefícios */}
          <div className="mt-6 rounded-2xl bg-orange-50/50 border border-orange-100/50 p-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-orange-800">
                Benefícios do Atleta Premium:
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-start gap-2.5 text-xs font-bold text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Participar de clubes esportivos ilimitados</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs font-bold text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Enviar treinos, sincronizar fotos e postar suas metas</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs font-bold text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Desbloquear perfil completo (Bio, Banner, Strava, Instagram, etc)</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-stretch">
            <button
              onClick={onClose}
              className="w-full sm:w-1/3 order-2 sm:order-1 cursor-pointer h-14 rounded-2xl font-black text-xs tracking-widest uppercase text-gray-500 transition-colors hover:bg-gray-100"
            >
              Depois
            </button>
            <Link
              href={checkoutUrl}
              onClick={onClose}
              className="w-full sm:w-2/3 order-1 sm:order-2 flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-black text-xs tracking-widest uppercase text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-95 text-center"
            >
              Preencher dados do cartão
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </DialogFooter>

          <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
            <div className="flex items-center gap-1 opacity-55">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Ambiente 100% Seguro</span>
            </div>
            <div className="flex items-center gap-1 opacity-45">
              <Flame className="h-3.5 w-3.5 text-gray-500" fill="currentColor" />
              <span className="text-[9px] font-bold tracking-wider uppercase">ClubRun</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
