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
      <DialogContent className="overflow-hidden rounded-3xl border-none bg-gray-50 p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-gray-100 border-b bg-white p-6">
          <DialogTitle className="flex items-center gap-2 font-black text-gray-900 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Crown className="h-4.5 w-4.5 animate-bounce" />
            </div>
            Card de Aniversário
          </DialogTitle>
          <button
            type="button"
            aria-label="Fechar card de aniversário"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </DialogHeader>

        {/* CONTAINER DO CARD STORIES (9:16 ASPECT RATIO) */}
        <div className="flex justify-center bg-gray-100/50 p-6">
          <div
            id="birthday-stories-card"
            className="relative flex h-[497px] w-[280px] flex-col justify-between overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-950 via-orange-950 to-orange-900 p-8 text-center text-white shadow-2xl"
          >
            {/* Efeitos Visuais de Fundo */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
            <div className="-top-12 -right-12 absolute h-40 w-40 animate-pulse rounded-full bg-orange-500/10 blur-3xl" />
            <div className="-bottom-12 -left-12 absolute h-40 w-40 rounded-full bg-orange-600/10 blur-3xl" />

            {/* Margens de grid atlético */}
            <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-white/5" />

            {/* Topo do Card */}
            <div className="relative z-10 mt-4 space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-black text-[9px] text-orange-400 uppercase tracking-widest">
                <Sparkles className="inline h-3 w-3" /> Parabéns, Corredor!
              </span>
              <h4 className="font-black text-white/50 text-xs uppercase tracking-widest">
                {clubName}
              </h4>
            </div>

            {/* Centro: Foto de Perfil do Atleta e Nome */}
            <div className="relative z-10 my-auto flex flex-col items-center space-y-5">
              <div className="relative">
                {/* Efeito de anel dourado */}
                <div className="-m-1.5 absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 duration-3000" />
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-gray-950 bg-gray-900 shadow-2xl">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={avatarUrl || ''}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-orange-500 font-black text-3xl text-white">
                      {athleteName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="-bottom-2 -right-2 absolute flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                  <Flame className="h-4.5 w-4.5" fill="currentColor" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-xl uppercase leading-tight tracking-tight">
                  {athleteName}
                </h3>
                <p className="font-bold text-[10px] text-orange-400 uppercase tracking-widest">
                  Pelotão de Elite
                </p>
              </div>
            </div>

            {/* Rodapé do Card: Mensagem e Logo */}
            <div className="relative z-10 mb-4 space-y-6">
              <p className="px-2 font-bold text-gray-300 text-xs italic leading-relaxed">
                "Correndo rumo a mais um ano repleto de kms e grandes
                conquistas! Que seu pace seja forte e sua saúde inabalável."
              </p>

              <div className="flex items-center justify-center gap-1.5 opacity-40">
                <Flame className="h-4 w-4 text-white" fill="currentColor" />
                <span className="font-black text-[8px] uppercase tracking-widest">
                  ClubRun
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLES DO CARD */}
        <div className="grid grid-cols-3 gap-3 border-gray-100 border-t bg-white p-6">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-95"
          >
            {isCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-gray-500 hover:text-orange-500" />
            )}
            <span className="font-black text-[9px] uppercase tracking-wider">
              Copiar Text
            </span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-emerald-50 hover:text-emerald-500 active:scale-95"
          >
            <Share2 className="h-5 w-5 text-gray-500 hover:text-emerald-500" />
            <span className="font-black text-[9px] uppercase tracking-wider">
              WhatsApp
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-orange-500 py-3.5 text-center text-white transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-75"
          >
            {isDownloading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span className="font-black text-[9px] uppercase tracking-wider">
              Baixar Card
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
