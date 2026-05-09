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
import { CheckCircle2, XCircle, Flame, ArrowRight, Clock } from 'lucide-react'

interface JoinFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  clubName?: string
}

export function JoinFeedbackModal({
  isOpen,
  onClose,
  type,
  clubName,
}: JoinFeedbackModalProps) {
  const isSuccess = type === 'success'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-md">
        <div className={`relative h-32 w-full bg-gradient-to-br ${isSuccess ? 'from-orange-500 to-amber-500' : 'from-red-500 to-rose-600'}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className={`flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-2xl ring-4 ring-white`}>
              {isSuccess ? (
                <CheckCircle2 className="h-10 w-10 text-orange-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
          </div>
        </div>

        <div className="px-8 pt-16 pb-10 text-center">
          <DialogHeader className="items-center">
            <DialogTitle className="text-3xl font-black">
              {isSuccess ? 'Solicitação Enviada!' : 'Ops! Algo deu errado'}
            </DialogTitle>
            <DialogDescription className="mt-2 text-lg font-medium">
              {isSuccess ? (
                <>
                  Sua solicitação para o clube <span className="font-bold text-gray-900">{clubName}</span> foi recebida.
                </>
              ) : (
                'Não conseguimos processar o seu pedido de participação neste momento.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-4">
            {isSuccess ? (
              <div className="rounded-2xl bg-orange-50 p-5 text-left">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-bold text-orange-800">Próximos Passos:</span>
                </div>
                <p className="mt-2 text-xs font-medium text-orange-700/80 leading-relaxed">
                  O treinador e os administradores do clube foram notificados. Assim que aprovarem seu perfil, você terá acesso total ao feed e poderá registrar seus treinos.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-red-50 p-5 text-left text-red-800">
                <p className="text-xs font-bold leading-relaxed">
                  Verifique se você já não possui uma solicitação pendente para este clube ou tente novamente em alguns instantes.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 sm:justify-center">
            <button
              onClick={onClose}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                isSuccess
                  ? 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'
                  : 'bg-gray-900 shadow-gray-900/20 hover:bg-gray-800'
              }`}
            >
              {isSuccess ? 'Entendido!' : 'Fechar'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </DialogFooter>

          <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
            <Flame className="h-4 w-4 text-gray-500" fill="currentColor" />
            <span className="text-[10px] font-black tracking-widest uppercase">ClubRun Platform</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
