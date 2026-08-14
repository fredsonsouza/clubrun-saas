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
      <DialogContent className="overflow-hidden rounded-3xl border-none bg-white p-0 shadow-2xl sm:max-w-md">
        {/* Header Premium com tom de Alerta (Dourado/Laranja) */}
        <div className="relative flex h-40 w-full items-center justify-center bg-gradient-to-br from-gray-950 via-orange-950 to-amber-700">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />

          <div className="-top-10 -right-10 absolute h-28 w-28 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="-bottom-10 -left-10 absolute h-28 w-28 rounded-full bg-orange-600/15 blur-2xl" />

          <div className="relative flex flex-col items-center px-4 text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-amber-500/20 shadow-xl">
              <AlertCircle className="h-8 w-8 animate-pulse" />
            </div>
            <span className="rounded-full border border-amber-500/20 bg-amber-950/60 px-3 py-1 font-black text-[9px] text-amber-400 uppercase tracking-widest">
              Aviso de Inscrição
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 pt-6 pb-8">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="font-black text-gray-900 text-xl leading-tight">
              Inscrição Pré-Registrada!
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-sm font-semibold text-gray-400 text-xs">
              Você está prestes a entrar no pelotão de{' '}
              <span className="font-extrabold text-orange-500">
                "{raceName}"
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {/* Informativo de Condição */}
          <div className="mt-5 space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="font-black text-[10px] text-amber-800 uppercase tracking-widest">
                Regra de Confirmação:
              </span>
            </div>

            <p className="font-bold text-gray-600 text-xs leading-relaxed">
              Para oficializar sua vaga, você deve realizar o acerto financeiro
              da taxa diretamente com os administradores do clube.
              <span className="mt-2 block font-black text-[11px] text-amber-700">
                ⚠️ Importante: Você só conseguirá registrar seu tempo e pace no
                painel após a confirmação do pagamento.
              </span>
            </p>
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-stretch">
            <button
              type="button"
              onClick={onClose}
              className="order-2 h-12 w-full cursor-pointer rounded-xl font-bold text-gray-400 text-xs uppercase tracking-widest transition-colors hover:bg-gray-100 sm:order-1 sm:w-1/3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="order-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 text-center font-black text-white text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] hover:bg-orange-600 active:scale-95 sm:order-2 sm:w-2/3"
            >
              Ciente, Inscrever-me
              <ArrowRight className="h-4 w-4" />
            </button>
          </DialogFooter>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-gray-400 opacity-40">
            <Flame className="h-3 w-3" fill="currentColor" />
            <span className="font-black text-[8px] uppercase tracking-widest">
              ClubRun
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
