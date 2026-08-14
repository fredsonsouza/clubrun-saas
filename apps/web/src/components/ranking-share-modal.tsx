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
  Download,
  Medal,
  Share2,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface AthleteRanking {
  id: string
  name: string
  avatarUrl: string | null
  distance: number
  pace: string
  workoutsCount: number
  points: number
}

function formatKm(km: number): string {
  const formatted = km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)
  return formatted.replace('.', ',')
}

interface RankingShareModalProps {
  isOpen: boolean
  onClose: () => void
  clubName: string
  clubSlug: string
  period: 'week' | 'month' | 'year'
  topAthletes: AthleteRanking[]
}

export function RankingShareModal({
  isOpen,
  onClose,
  clubName,
  clubSlug,
  period,
  topAthletes,
}: RankingShareModalProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const top1 = topAthletes[0]
  const top2 = topAthletes[1]
  const top3 = topAthletes[2]

  const periodLabel =
    period === 'week'
      ? 'Ranking Semanal'
      : period === 'month'
        ? 'Ranking Mensal'
        : 'Ranking Anual'

  const formattedPeriodLabel =
    period === 'week'
      ? 'esta semana'
      : period === 'month'
        ? 'este mês'
        : 'este ano'

  const handleCopyText = () => {
    let text = `*🏆 QUADRO DE LÍDERES - ${clubName.toUpperCase()}* 🎉\n`
    text += `Confira quem dominou o asfalto ${formattedPeriodLabel}:\n\n`

    if (top1) {
      text += `🥇 *1º Lugar:* ${top1.name} - ${formatKm(top1.distance)} km (Pace: ${top1.pace}/km)\n`
    }
    if (top2) {
      text += `🥈 *2º Lugar:* ${top2.name} - ${formatKm(top2.distance)} km (Pace: ${top2.pace}/km)\n`
    }
    if (top3) {
      text += `🥉 *3º Lugar:* ${top3.name} - ${formatKm(top3.distance)} km (Pace: ${top3.pace}/km)\n`
    }

    text += `\n🏃‍♂️💨 Bons treinos e continue acelerando!\nVeja o ranking completo em: clubrun.com/${clubSlug}`

    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success('Mensagem do ranking copiada para a área de transferência!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = () => {
    setIsDownloading(true)
    toast.info('Renderizando imagem do pódio em HD...')

    const cardNode = document.getElementById('ranking-stories-card')

    if (!cardNode) {
      toast.error('Erro ao carregar o card do ranking para download.')
      setIsDownloading(false)
      return
    }

    // Renderiza em JPEG real de alta definição
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
          'Card de Líderes gerado com sucesso! Pronto para postar no Instagram.'
        )

        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `ranking-${period}-${clubSlug}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        console.error('Erro ao exportar pódio:', error)
        setIsDownloading(false)
        toast.error('Erro ao gerar imagem. Tente novamente!')
      })
  }

  const handleShareWhatsApp = () => {
    let text = `*🏆 QUADRO DE LÍDERES - ${clubName.toUpperCase()}*\n`
    text += `Pódio de performance de corrida ${formattedPeriodLabel}:\n\n`

    if (top1) text += `🥇 *1º* ${top1.name} - ${formatKm(top1.distance)} km\n`
    if (top2) text += `🥈 *2º* ${top2.name} - ${formatKm(top2.distance)} km\n`
    if (top3) text += `🥉 *3º* ${top3.name} - ${formatKm(top3.distance)} km\n`

    text += '\nVeja o pódio completo e fotos no site!'
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-3xl border-none bg-gray-50 p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-gray-100 border-b bg-white p-6">
          <DialogTitle className="flex items-center gap-2 font-black text-gray-900 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Trophy className="h-4.5 w-4.5 animate-pulse" />
            </div>
            Compartilhar Pódio
          </DialogTitle>
          <button
            type="button"
            aria-label="Fechar compartilhamento do pódio"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </DialogHeader>

        {/* CONTAINER DO STORIES DE RANKING */}
        <div className="flex justify-center bg-gray-100/50 p-6">
          <div
            id="ranking-stories-card"
            className="relative flex h-[497px] w-[280px] flex-col justify-between overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-950 via-gray-900 to-orange-950 p-6 text-center text-white shadow-2xl"
          >
            {/* Efeitos de Fundo */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
            <div className="-top-12 -right-12 absolute h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="-bottom-12 -left-12 absolute h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-white/5" />

            {/* Cabeçalho do Card */}
            <div className="relative z-10 mt-2 space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 font-black text-[8px] text-orange-400 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> {periodLabel}
              </span>
              <h4 className="font-black text-[10px] text-white/50 uppercase leading-tight tracking-widest">
                {clubName}
              </h4>
            </div>

            {/* Top 1 Vencedor */}
            {top1 ? (
              <div className="relative z-10 my-auto flex flex-col items-center py-1">
                <div className="relative">
                  {/* Glow do Vencedor */}
                  <div className="-m-1.5 absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 opacity-80 duration-3000" />
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-gray-950 bg-gray-900 shadow-2xl">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={top1.avatarUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-amber-500 font-black text-2xl text-white">
                        {top1.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-950 bg-amber-500 text-white shadow-md">
                    <Trophy className="h-3 w-3" fill="currentColor" />
                  </div>
                </div>
                <h3 className="mt-3 max-w-[200px] truncate font-black text-sm uppercase leading-tight tracking-tight">
                  {top1.name}
                </h3>
                <p className="mt-1 font-black font-mono text-2xl text-amber-400 leading-none">
                  {formatKm(top1.distance)}
                  <span className="font-bold text-white/90 text-xs"> km</span>
                </p>
                <p className="mt-1 font-bold text-[8px] text-gray-400 uppercase tracking-wider">
                  Pace: {top1.pace} /km • {top1.workoutsCount} treinos
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">
                Nenhum treino registrado.
              </p>
            )}

            {/* Demais colocados */}
            <div className="relative z-10 mb-2 space-y-2">
              {/* 2º Colocado */}
              {top2 && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-2 text-left">
                  <div className="relative">
                    <div className="-m-0.5 absolute inset-0 rounded-full bg-gray-400" />
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-gray-950 bg-gray-900">
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={top2.avatarUrl || ''}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gray-400 font-black text-sm text-white">
                          {top2.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="-top-1 -right-1 absolute flex h-4.5 w-4.5 items-center justify-center rounded-full border border-gray-950 bg-gray-400 font-black text-[8px] text-white">
                      2º
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-white text-xs uppercase leading-tight">
                      {top2.name}
                    </p>
                    <p className="font-bold text-[8px] text-gray-400 uppercase">
                      Pace: {top2.pace} /km
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black font-mono text-gray-300 text-sm">
                      {formatKm(top2.distance)}{' '}
                      <span className="font-bold text-[8px]">km</span>
                    </p>
                  </div>
                </div>
              )}

              {/* 3º Colocado */}
              {top3 && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-2 text-left">
                  <div className="relative">
                    <div className="-m-0.5 absolute inset-0 rounded-full bg-amber-700" />
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-gray-950 bg-gray-900">
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={top3.avatarUrl || ''}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-amber-700 font-black text-sm text-white">
                          {top3.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="-top-1 -right-1 absolute flex h-4.5 w-4.5 items-center justify-center rounded-full border border-gray-950 bg-amber-700 font-black text-[8px] text-white">
                      3º
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-white text-xs uppercase leading-tight">
                      {top3.name}
                    </p>
                    <p className="font-bold text-[8px] text-gray-400 uppercase">
                      Pace: {top3.pace} /km
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black font-mono text-amber-600 text-sm">
                      {formatKm(top3.distance)}{' '}
                      <span className="font-bold text-[8px]">km</span>
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Rodapé */}
              <div className="flex items-center justify-center pt-2 opacity-35">
                <span className="font-black text-[6.5px] uppercase tracking-widest">
                  Junte-se em clubrun.com/{clubSlug}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLES DO CARD */}
        <div className="grid grid-cols-3 gap-3 border-gray-100 border-t bg-white p-6">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-95"
          >
            {isCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-gray-500 hover:text-orange-500" />
            )}
            <span className="font-black text-[9px] uppercase tracking-wider">
              Copiar Texto
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
