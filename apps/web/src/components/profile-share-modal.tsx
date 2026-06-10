'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  Lock, 
  MapPin, 
  Activity, 
  QrCode,
  Flame,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toJpeg } from 'html-to-image'
import Link from 'next/link'

interface ProfileShareModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
  athleteProfile: {
    city: string | null
    isPremium?: boolean
  } | null
  stats: {
    avgPace: number
    totalDistance: number
    totalWorkouts: number
  }
}

type ThemeId = 'classic' | 'gold' | 'cyber' | 'velocity'

interface ThemeConfig {
  id: ThemeId
  name: string
  premium: boolean
  cardBgClass: string
  textColorClass: string
  primaryTextClass: string
  secondaryTextClass: string
  qrColor: string
  accentColor: string
  glowClass: string
  borderGradient: string
}

const THEMES: ThemeConfig[] = [
  {
    id: 'classic',
    name: 'Classic Dark',
    premium: false,
    cardBgClass: 'bg-gradient-to-b from-gray-950 via-gray-900 to-orange-950',
    textColorClass: 'text-white',
    primaryTextClass: 'text-orange-400',
    secondaryTextClass: 'text-white/50',
    qrColor: 'f97316', // Laranja ClubRun
    accentColor: 'text-orange-500',
    glowClass: 'bg-orange-500/10',
    borderGradient: 'from-orange-500/30 via-orange-500/10 to-orange-950/40',
  },
  {
    id: 'gold',
    name: 'Gold Carbon',
    premium: true,
    cardBgClass: 'bg-gradient-to-b from-black via-gray-950 to-amber-950',
    textColorClass: 'text-white',
    primaryTextClass: 'text-amber-400',
    secondaryTextClass: 'text-white/40',
    qrColor: 'fbbf24', // Dourado
    accentColor: 'text-amber-500',
    glowClass: 'bg-amber-500/15',
    borderGradient: 'from-amber-400/50 via-amber-600/20 to-black',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    premium: true,
    cardBgClass: 'bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950',
    textColorClass: 'text-white',
    primaryTextClass: 'text-fuchsia-400',
    secondaryTextClass: 'text-white/40',
    qrColor: 'd946ef', // Fuchsia
    accentColor: 'text-cyan-400',
    glowClass: 'bg-fuchsia-500/15',
    borderGradient: 'from-fuchsia-500/40 via-cyan-500/20 to-purple-950/50',
  },
  {
    id: 'velocity',
    name: 'Velocity Red',
    premium: true,
    cardBgClass: 'bg-gradient-to-b from-red-950 via-gray-950 to-black',
    textColorClass: 'text-white',
    primaryTextClass: 'text-red-500',
    secondaryTextClass: 'text-white/50',
    qrColor: 'ef4444', // Vermelho
    accentColor: 'text-red-500',
    glowClass: 'bg-red-500/15',
    borderGradient: 'from-red-600/40 via-red-950/20 to-black',
  },
]

export function ProfileShareModal({
  isOpen,
  onClose,
  user,
  athleteProfile,
  stats,
}: ProfileShareModalProps) {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('classic')
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')

  const isPremium = athleteProfile?.isPremium || false

  const selectedTheme = useMemo(() => {
    return THEMES.find((t) => t.id === selectedThemeId) || THEMES[0]
  }, [selectedThemeId])

  // Identifica se o tema selecionado está sob paywall para o usuário atual
  const isLockedTheme = selectedTheme.premium && !isPremium

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfileUrl(`${window.location.origin}/profile/${user.id}`)
    }
  }, [user.id])

  // Formata o pace médio
  const formattedPace = useMemo(() => {
    const pace = stats.avgPace
    if (!pace || pace === 0) return '0:00'
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [stats.avgPace])

  // Formata a distância
  const formattedDistance = useMemo(() => {
    const distanceMeters = stats.totalDistance
    const km = distanceMeters / 1000
    return km.toFixed(1)
  }, [stats.totalDistance])

  // Gera o QR Code com a cor e fundo baseados no tema selecionado
  const qrCodeUrl = useMemo(() => {
    if (!profileUrl) return ''
    
    // A API QRServer aceita cores no formato RGB hexadecimal limpo (sem #)
    const color = selectedTheme.qrColor
    const bgcolor = '09090b' // Preto escuro combinando com o fundo do card
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=${color}&bgcolor=${bgcolor}&qzone=1&data=${encodeURIComponent(profileUrl)}`
  }, [profileUrl, selectedTheme])

  const handleCopyLink = () => {
    if (!profileUrl) return
    navigator.clipboard.writeText(profileUrl)
    setIsCopied(true)
    toast.success('Link do perfil copiado para a área de transferência!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    if (!profileUrl) return
    const text = `Confira minhas estatísticas de corrida e meu perfil no ClubRun! 🏃‍♂️💨\nSiga meus treinos aqui: ${profileUrl}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleDownload = () => {
    if (isLockedTheme) {
      toast.warning('Inscreva-se no Premium para baixar cards com temas estilizados!')
      return
    }

    setIsDownloading(true)
    toast.info('Renderizando card de perfil em HD...')

    const cardNode = document.getElementById('profile-stories-card')
    if (!cardNode) {
      toast.error('Erro ao encontrar o card para renderização.')
      setIsDownloading(false)
      return
    }

    // Configuração para exportar JPEG nítido em 2x (densidade do dispositivo ou alta definição)
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
        toast.success('Card de Perfil gerado! Pronto para postar nos Stories.')
        
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `clubrun-${user.name?.toLowerCase().replace(/\s+/g, '-')}-perfil.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        console.error('Erro ao renderizar imagem do card:', error)
        setIsDownloading(false)
        toast.error('Erro ao gerar imagem. Tente novamente!')
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-4xl bg-gray-50 shadow-2xl rounded-3xl max-h-[90vh] flex flex-col md:flex-row">
        
        {/* COLUNA ESQUERDA: Configuração de Temas & Botões (Mobile no topo, Desktop do lado) */}
        <div className="flex-1 p-6 md:p-8 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between overflow-y-auto">
          <div>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <QrCode className="h-4.5 w-4.5" />
                </div>
                Compartilhar Perfil
              </DialogTitle>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Gere um card no formato stories (9:16) com o QR Code do seu perfil para postar no Instagram e atrair novos seguidores.
              </p>
            </DialogHeader>

            {/* SELETOR DE TEMAS */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                Escolha o Tema do Card
              </span>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id
                  const isLocked = theme.premium && !isPremium
                  
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`cursor-pointer relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all active:scale-98 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50/10 text-orange-950 shadow-sm' 
                          : 'border-gray-100 bg-gray-50 hover:bg-gray-100/70 text-gray-600'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-extrabold">{theme.name}</span>
                        {theme.premium && (
                          <span className={`inline-flex items-center justify-center p-1 rounded-md ${isLocked ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
                            <Crown className="h-3 w-3" fill={isLocked ? 'none' : 'currentColor'} />
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 font-semibold">
                        {theme.premium ? 'Tema Premium' : 'Gratuito'}
                      </span>
                      {isSelected && (
                        <div className="absolute right-3 bottom-3 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* AVISO DO PREMIUM (Gatilho de conversão) */}
            {isLockedTheme && (
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-4 space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Crown className="h-4.5 w-4.5 text-amber-600" fill="currentColor" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Recurso Premium
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Desbloqueie todos os temas estilizados exclusivos e mostre seu Pace Médio real no card de compartilhamento assinando o ClubRun Premium!
                </p>
                <Link
                  href="/checkout?plan=athlete"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-center text-[10px] font-black tracking-wider uppercase text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 active:scale-98 transition-all"
                >
                  Fazer Upgrade Premium <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* CONTROLES E AÇÕES */}
          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-3">
            <button
              onClick={handleCopyLink}
              className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3 text-center transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-95"
            >
              {isCopied ? (
                <Check className="h-4.5 w-4.5 text-green-500" />
              ) : (
                <Copy className="h-4.5 w-4.5 text-gray-500 hover:text-orange-500" />
              )}
              <span className="text-[8px] font-black tracking-wider uppercase">Copiar Link</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3 text-center transition-all hover:bg-emerald-50 hover:text-emerald-500 active:scale-95"
            >
              <Share2 className="h-4.5 w-4.5 text-gray-500 hover:text-emerald-500" />
              <span className="text-[8px] font-black tracking-wider uppercase">WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading || isLockedTheme}
              className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-center text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLockedTheme ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/10'
              }`}
            >
              {isDownloading ? (
                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isLockedTheme ? (
                <Lock className="h-4.5 w-4.5" />
              ) : (
                <Download className="h-4.5 w-4.5" />
              )}
              <span className="text-[8px] font-black tracking-wider uppercase">Baixar Card</span>
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: Preview do Card (Centralizado com background cinza e proporções stories) */}
        <div className="p-6 md:pt-16 md:pb-10 md:px-12 md:w-[420px] shrink-0 bg-gray-100/50 flex items-center justify-center relative select-none">
          <div className="relative">
            
            {/* CONTAINER DO STORIES DE PERFIL (280px x 497px) */}
            <div 
              id="profile-stories-card"
              className={`relative w-[280px] h-[497px] overflow-hidden rounded-[2.25rem] text-white shadow-2xl flex flex-col justify-between p-6 text-center transition-all duration-500 ${selectedTheme.cardBgClass}`}
            >
              {/* Efeitos de Fundo */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
              <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-80 ${selectedTheme.glowClass}`} />
              <div className={`absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl opacity-80 ${selectedTheme.glowClass}`} />
              <div className={`absolute inset-3.5 border border-gradient-to-b ${selectedTheme.borderGradient} rounded-[1.75rem] pointer-events-none`} />

              {/* Cabeçalho do Card */}
              <div className="relative z-10 flex flex-col items-center mt-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500 fill-current" />
                  <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white">ClubRun</span>
                </div>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[7px] font-black tracking-wider text-amber-400 uppercase">
                    <Crown className="h-2 w-2" fill="currentColor" /> Membro Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[7px] font-black tracking-wider text-orange-400 uppercase">
                    Pelotão
                  </span>
                )}
              </div>

              {/* Foto de Perfil + Informações Básicas */}
              <div className="relative z-10 flex flex-col items-center my-auto space-y-4">
                <div className="relative">
                  {/* Glow do Avatar */}
                  <div className={`absolute inset-0 -m-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 ${isPremium ? 'animate-spin duration-3000 opacity-90' : 'opacity-30'}`} />
                  <div className="relative h-20 w-20 rounded-full border-3 border-gray-950 overflow-hidden bg-gray-900 shadow-xl">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatarUrl || ''} className="object-cover" />
                      <AvatarFallback className="text-2xl font-black bg-orange-500 text-white">
                        {user.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {isPremium && (
                    <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-md border border-gray-950">
                      <Crown className="h-2.5 w-2.5" fill="currentColor" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-sm font-black tracking-tight leading-tight uppercase max-w-[200px] truncate">
                    {user.name || 'Atleta ClubRun'}
                  </h3>
                  {athleteProfile?.city && (
                    <p className="flex items-center justify-center gap-1 text-[7.5px] font-bold text-white/50 tracking-wider uppercase">
                      <MapPin className="h-2.5 w-2.5 text-orange-500" /> {athleteProfile.city}
                    </p>
                  )}
                </div>

                {/* GRID DE ESTATÍSTICAS */}
                <div className="w-full grid grid-cols-3 gap-2 bg-black/35 backdrop-blur-xs border border-white/5 rounded-2xl p-2.5">
                  <div className="text-center">
                    <span className="block text-[6.5px] font-black tracking-wider text-white/40 uppercase">Volume</span>
                    <p className="font-mono text-xs font-black text-white mt-0.5">
                      {formattedDistance}<span className="text-[7.5px] font-bold text-white/60"> km</span>
                    </p>
                  </div>
                  <div className="border-x border-white/5 text-center">
                    <span className="block text-[6.5px] font-black tracking-wider text-white/40 uppercase">Treinos</span>
                    <p className="font-mono text-xs font-black text-white mt-0.5">
                      {stats.totalWorkouts}
                    </p>
                  </div>
                  <div className="text-center flex flex-col justify-center items-center">
                    <span className="block text-[6.5px] font-black tracking-wider text-white/40 uppercase">Ritmo</span>
                    {selectedTheme.premium && !isPremium ? (
                      <div className="flex items-center gap-0.5 mt-0.5 text-amber-500" title="Disponível no Premium">
                        <Crown className="h-3 w-3" fill="currentColor" />
                        <span className="text-[7px] font-black uppercase">PREM</span>
                      </div>
                    ) : (
                      <p className={`font-mono text-xs font-black mt-0.5 ${selectedTheme.primaryTextClass}`}>
                        {formattedPace}<span className="text-[7px] font-bold text-white/60">/km</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* QR CODE & CTA DO CARD */}
              <div className="relative z-10 flex flex-col items-center space-y-3 mb-2">
                {qrCodeUrl ? (
                  <div className="p-1.5 rounded-2xl bg-gray-950/80 border border-white/5 shadow-xl flex items-center justify-center">
                    <div className="relative h-20 w-20 bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="Perfil QR Code" 
                        className="h-18 w-18 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gray-900 rounded-xl animate-pulse" />
                )}
                
                <div className="space-y-0.5">
                  <p className="text-[6.5px] font-black tracking-widest text-white uppercase leading-none">
                    Escaneie para ver meu perfil
                  </p>
                  <p className={`text-[5.5px] font-bold uppercase ${selectedTheme.secondaryTextClass}`}>
                    e junte-se ao ClubRun
                  </p>
                </div>
              </div>
            </div>

            {/* OVERLAY DE PAYWALL SE O TEMA FOR PREMIUM E O USUÁRIO FOR FREE */}
            {isLockedTheme && (
              <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-xs rounded-[2.25rem] z-20 flex flex-col items-center justify-center p-6 text-center border-3 border-amber-500/20 animate-in fade-in duration-300">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 mb-4 animate-bounce">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  Tema Desbloqueado no Premium
                </h4>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-2 mb-4">
                  Os designs estilizados de cards estão disponíveis apenas para atletas Premium. 
                </p>
                <Link
                  href="/checkout?plan=athlete"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-[9px] font-black tracking-wider uppercase text-white shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all"
                >
                  Desbloquear Temas <Crown className="h-3 w-3" fill="currentColor" />
                </Link>
                <button
                  onClick={() => setSelectedThemeId('classic')}
                  className="mt-3 text-[8px] font-black text-gray-400 uppercase hover:text-white transition-colors"
                >
                  Voltar ao tema gratuito
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
