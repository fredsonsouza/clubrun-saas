'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trophy, Download, Share2, Copy, Check, X, Medal, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toJpeg } from 'html-to-image'

interface AthleteRanking {
  id: string
  name: string
  avatarUrl: string | null
  distance: number
  pace: string
  workoutsCount: number
  points: number
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

  const periodLabel = period === 'week' 
    ? 'Ranking Semanal' 
    : period === 'month' 
    ? 'Ranking Mensal' 
    : 'Ranking Anual'

  const formattedPeriodLabel = period === 'week'
    ? 'esta semana'
    : period === 'month'
    ? 'este mês'
    : 'este ano'

  const handleCopyText = () => {
    let text = `*🏆 QUADRO DE LÍDERES - ${clubName.toUpperCase()}* 🎉\n`
    text += `Confira quem dominou o asfalto ${formattedPeriodLabel}:\n\n`
    
    if (top1) {
      text += `🥇 *1º Lugar:* ${top1.name} - ${top1.distance.toFixed(1)} km (Pace: ${top1.pace}/km)\n`
    }
    if (top2) {
      text += `🥈 *2º Lugar:* ${top2.name} - ${top2.distance.toFixed(1)} km (Pace: ${top2.pace}/km)\n`
    }
    if (top3) {
      text += `🥉 *3º Lugar:* ${top3.name} - ${top3.distance.toFixed(1)} km (Pace: ${top3.pace}/km)\n`
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
      }
    })
      .then((dataUrl) => {
        setIsDownloading(false)
        toast.success('Card de Líderes gerado com sucesso! Pronto para postar no Instagram.')
        
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
    
    if (top1) text += `🥇 *1º* ${top1.name} - ${top1.distance.toFixed(1)} km\n`
    if (top2) text += `🥈 *2º* ${top2.name} - ${top2.distance.toFixed(1)} km\n`
    if (top3) text += `🥉 *3º* ${top3.name} - ${top3.distance.toFixed(1)} km\n`
    
    text += `\nVeja o pódio completo e fotos no site!`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-md bg-gray-50 shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 bg-white border-b border-gray-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Trophy className="h-4.5 w-4.5 animate-pulse" />
            </div>
            Compartilhar Pódio
          </DialogTitle>
          <button 
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </DialogHeader>

        {/* CONTAINER DO STORIES DE RANKING */}
        <div className="p-6 flex justify-center bg-gray-100/50">
          <div 
            id="ranking-stories-card"
            className="relative w-[280px] h-[497px] overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-950 via-gray-900 to-orange-950 text-white shadow-2xl flex flex-col justify-between p-6 text-center"
          >
            {/* Efeitos de Fundo */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute inset-4 border border-white/5 rounded-[2rem] pointer-events-none" />

            {/* Cabeçalho do Card */}
            <div className="relative z-10 space-y-1 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-0.5 text-[8px] font-black tracking-widest text-orange-400 uppercase">
                <Sparkles className="h-3.5 w-3.5" /> {periodLabel}
              </span>
              <h4 className="text-[10px] font-black tracking-widest uppercase text-white/50 leading-tight">
                {clubName}
              </h4>
            </div>

            {/* Top 1 Vencedor */}
            {top1 ? (
              <div className="relative z-10 flex flex-col items-center my-auto py-1">
                <div className="relative">
                  {/* Glow do Vencedor */}
                  <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 animate-spin duration-3000 opacity-80" />
                  <div className="relative h-20 w-20 rounded-full border-4 border-gray-950 overflow-hidden bg-gray-900 shadow-2xl">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={top1.avatarUrl || ''} className="object-cover" />
                      <AvatarFallback className="text-2xl font-black bg-amber-500 text-white">
                        {top1.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-md border-2 border-gray-950">
                    <Trophy className="h-3 w-3" fill="currentColor" />
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-black tracking-tight leading-tight uppercase max-w-[200px] truncate">
                  {top1.name}
                </h3>
                <p className="font-mono text-2xl font-black text-amber-400 leading-none mt-1">
                  {top1.distance.toFixed(1)}<span className="text-xs font-bold text-white/90"> km</span>
                </p>
                <p className="text-[8px] font-bold text-gray-400 tracking-wider uppercase mt-1">
                  Pace: {top1.pace} /km • {top1.workoutsCount} treinos
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Nenhum treino registrado.</p>
            )}

            {/* Demais colocados */}
            <div className="relative z-10 space-y-2 mb-2">
              {/* 2º Colocado */}
              {top2 && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-2 text-left">
                  <div className="relative">
                    <div className="absolute inset-0 -m-0.5 rounded-full bg-gray-400" />
                    <div className="relative h-9 w-9 rounded-full border-2 border-gray-950 overflow-hidden bg-gray-900">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={top2.avatarUrl || ''} className="object-cover" />
                        <AvatarFallback className="text-sm font-black bg-gray-400 text-white">
                          {top2.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gray-400 text-[8px] font-black text-white border border-gray-950">2º</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-white leading-tight uppercase">{top2.name}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Pace: {top2.pace} /km</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-black text-gray-300">{top2.distance.toFixed(1)} <span className="text-[8px] font-bold">km</span></p>
                  </div>
                </div>
              )}

              {/* 3º Colocado */}
              {top3 && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-2 text-left">
                  <div className="relative">
                    <div className="absolute inset-0 -m-0.5 rounded-full bg-amber-700" />
                    <div className="relative h-9 w-9 rounded-full border-2 border-gray-950 overflow-hidden bg-gray-900">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={top3.avatarUrl || ''} className="object-cover" />
                        <AvatarFallback className="text-sm font-black bg-amber-700 text-white">
                          {top3.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-700 text-[8px] font-black text-white border border-gray-950">3º</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-white leading-tight uppercase">{top3.name}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Pace: {top3.pace} /km</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-black text-amber-600">{top3.distance.toFixed(1)} <span className="text-[8px] font-bold">km</span></p>
                  </div>
                </div>
              )}

              {/* CTA Rodapé */}
              <div className="flex items-center justify-center pt-2 opacity-35">
                <span className="text-[6.5px] font-black tracking-widest uppercase">Junte-se em clubrun.com/{clubSlug}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLES DO CARD */}
        <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-3 gap-3">
          <button
            onClick={handleCopyText}
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-95"
          >
            {isCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-gray-500 hover:text-orange-500" />
            )}
            <span className="text-[9px] font-black tracking-wider uppercase">Copiar Texto</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3.5 text-center transition-all hover:bg-emerald-50 hover:text-emerald-500 active:scale-95"
          >
            <Share2 className="h-5 w-5 text-gray-500 hover:text-emerald-500" />
            <span className="text-[9px] font-black tracking-wider uppercase">WhatsApp</span>
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
            <span className="text-[9px] font-black tracking-wider uppercase">Baixar Card</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
