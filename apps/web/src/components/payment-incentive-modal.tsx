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
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Flame,
  ShieldAlert,
} from 'lucide-react'
import React from 'react'

interface PaymentIncentiveModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  raceName: string
}

export function PaymentIncentiveModal({
  isOpen,
  onClose,
  onConfirm,
  raceName,
}: PaymentIncentiveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-md bg-white shadow-2xl rounded-3xl">
        {/* Header Premium com tom de Alerta (Dourado/Laranja) */}
        <div className="relative h-40 w-full bg-gradient-to-br from-gray-950 via-orange-950 to-amber-700 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />

          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-orange-600/15 blur-2xl" />

          <div className="relative flex flex-col items-center text-center px-4">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20">
              <AlertCircle className="h-8 w-8 animate-pulse" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
              Aviso de Inscrição
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 pt-6 pb-8">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl font-black text-gray-900 leading-tight">
              Inscrição Pré-Registrada!
            </DialogTitle>
            <DialogDescription className="mt-2 text-xs font-semibold text-gray-400 max-w-sm">
              Você está prestes a entrar no pelotão de{' '}
              <span className="text-orange-500 font-extrabold">
                "{raceName}"
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {/* Informativo de Condição */}
          <div className="mt-5 rounded-2xl bg-amber-50/70 border border-amber-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                Regra de Confirmação:
              </span>
            </div>

            <p className="text-xs font-bold leading-relaxed text-gray-600">
              Para oficializar sua vaga, você deve realizar o acerto financeiro
              da taxa diretamente com os administradores do clube.
              <span className="block mt-2 text-[11px] text-amber-700 font-black">
                ⚠️ Importante: Você só conseguirá registrar seu tempo e pace no
                painel após a confirmação do pagamento.
              </span>
            </p>
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-stretch">
            <button
              onClick={onClose}
              className="w-full sm:w-1/3 order-2 sm:order-1 cursor-pointer h-12 rounded-xl font-bold text-xs tracking-widest uppercase text-gray-400 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="w-full sm:w-2/3 order-1 sm:order-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 font-black text-xs tracking-widest uppercase text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:scale-[1.01] active:scale-95 text-center cursor-pointer"
            >
              Ciente, Inscrever-me
              <ArrowRight className="h-4 w-4" />
            </button>
          </DialogFooter>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-gray-400 opacity-40">
            <Flame className="h-3 w-3" fill="currentColor" />
            <span className="text-[8px] font-black tracking-widest uppercase">
              ClubRun
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
