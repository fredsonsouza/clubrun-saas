'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toJpeg } from 'html-to-image'
import {
  Check,
  Copy,
  Crown,
  Download,
  Flame,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface BirthdayCardModalProps {
  isOpen: boolean
  onClose: () => void
  athleteName: string
  avatarUrl: string | null
  clubName: string
}

export function BirthdayCardModal({
  isOpen,
  onClose,
  athleteName,
  avatarUrl,
  clubName,
}: BirthdayCardModalProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopyLink = () => {
    const text = `Parabéns, *${athleteName}*! 🎉\nO clube *${clubName}* te deseja um feliz aniversário com muitos quilômetros rodados e paces extraordinários! 🏃‍♂️💨\n\nGeramos um card comemorativo exclusivo para você compartilhar, confira no seu painel do ClubRun!`

    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success('Mensagem de parabéns copiada para a área de transferência!')

    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = () => {
    setIsDownloading(true)
    toast.info('Renderizando imagem de alta definição (HD)...')

    const cardNode = document.getElementById('birthday-stories-card')

    if (!cardNode) {
      toast.error('Erro ao carregar o card para download.')
      setIsDownloading(false)
      return
    }

    // Renderiza o DOM do Stories em JPEG real de alta definição (escala 2x para nitidez)
    toJpeg(cardNode, {
      quality: 0.98,
      pixelRatio: 2,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    })
      .then((dataUrl) => {
        setIsDownloading(false)
        toast.success(
          'Card de Aniversário gerado com sucesso! Pronto para postar no Instagram Stories.'
        )

        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `parabens-${athleteName.toLowerCase().replace(/\s+/g, '-')}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        console.error('Erro ao exportar imagem:', error)
        setIsDownloading(false)
        toast.error('Erro ao gerar imagem de alta definição. Tente novamente!')
      })
  }

  // Abre link rápido de WhatsApp pré-preenchido
  const handleShareWhatsApp = () => {
    const text = `Parabéns, *${athleteName}*! 🎉\nO clube *${clubName}* te deseja um feliz aniversário com muitos quilômetros rodados e paces extraordinários! 🏃‍♂️💨\n\nPreparei um card especial para você!`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-md bg-gray-50 shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 bg-white border-b border-gray-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Crown className="h-4.5 w-4.5 animate-bounce" />
            </div>
            Card de Aniversário
          </DialogTitle>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </DialogHeader>

        {/* CONTAINER DO CARD STORIES (9:16 ASPECT RATIO) */}
        <div className="p-6 flex justify-center bg-gray-100/50">
          <div
            id="birthday-stories-card"
            className="relative w-[280px] h-[497px] overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-950 via-orange-950 to-orange-900 text-white shadow-2xl flex flex-col justify-between p-8 text-center"
          >
            {/* Efeitos Visuais de Fundo */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-orange-600/10 blur-3xl" />

            {/* Margens de grid atlético */}
            <div className="absolute inset-4 border border-white/5 rounded-[2rem] pointer-events-none" />

            {/* Topo do Card */}
            <div className="relative z-10 space-y-2 mt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-[9px] font-black tracking-widest text-orange-400 uppercase">
                <Sparkles className="h-3 w-3 inline" /> Parabéns, Corredor!
              </span>
              <h4 className="text-xs font-black tracking-widest uppercase text-white/50">
                {clubName}
              </h4>
            </div>

            {/* Centro: Foto de Perfil do Atleta e Nome */}
            <div className="relative z-10 flex flex-col items-center my-auto space-y-5">
              <div className="relative">
                {/* Efeito de anel dourado */}
                <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 animate-spin duration-3000" />
                <div className="relative h-28 w-28 rounded-full border-4 border-gray-950 overflow-hidden shadow-2xl bg-gray-900">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={avatarUrl || ''}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-black bg-orange-500 text-white">
                      {athleteName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                  <Flame className="h-4.5 w-4.5" fill="currentColor" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight leading-tight uppercase">
                  {athleteName}
                </h3>
                <p className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">
                  Pelotão de Elite
                </p>
              </div>
            </div>

            {/* Rodapé do Card: Mensagem e Logo */}
            <div className="relative z-10 space-y-6 mb-4">
              <p className="text-xs font-bold leading-relaxed text-gray-300 px-2 italic">
                "Correndo rumo a mais um ano repleto de kms e grandes
                conquistas! Que seu pace seja forte e sua saúde inabalável."
              </p>

              <div className="flex items-center justify-center gap-1.5 opacity-40">
                <Flame className="h-4 w-4 text-white" fill="currentColor" />
                <span className="text-[8px] font-black tracking-widest uppercase">
                  ClubRun
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLES DO CARD */}
        <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-3 gap-3">
          <button
            onClick={handleCopyLink}
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-95"
          >
            {isCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-gray-500 hover:text-orange-500" />
            )}
            <span className="text-[9px] font-black tracking-wider uppercase">
              Copiar Text
            </span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-emerald-50 hover:text-emerald-500 active:scale-95"
          >
            <Share2 className="h-5 w-5 text-gray-500 hover:text-emerald-500" />
            <span className="text-[9px] font-black tracking-wider uppercase">
              WhatsApp
            </span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-orange-500 py-3.5 text-center text-white transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-75"
          >
            {isDownloading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span className="text-[9px] font-black tracking-wider uppercase">
              Baixar Card
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
