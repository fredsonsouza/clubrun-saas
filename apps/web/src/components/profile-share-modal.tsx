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
  Activity,
  ArrowRight,
  Check,
  Copy,
  Crown,
  Download,
  Flame,
  Lock,
  MapPin,
  QrCode,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

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
    const formatted = km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)
    return formatted.replace('.', ',')
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
      toast.warning(
        'Inscreva-se no Premium para baixar cards com temas estilizados!'
      )
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
      },
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
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border-none bg-gray-50 p-0 shadow-2xl sm:max-w-4xl md:flex-row">
        {/* COLUNA ESQUERDA: Configuração de Temas & Botões (Mobile no topo, Desktop do lado) */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto border-gray-100 border-b bg-white p-6 md:border-r md:border-b-0 md:p-8">
          <div>
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-2 font-black text-gray-900 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <QrCode className="h-4.5 w-4.5" />
                </div>
                Compartilhar Perfil
              </DialogTitle>
              <p className="mt-1 font-semibold text-gray-400 text-xs">
                Gere um card no formato stories (9:16) com o QR Code do seu
                perfil para postar no Instagram e atrair novos seguidores.
              </p>
            </DialogHeader>

            {/* SELETOR DE TEMAS */}
            <div className="space-y-3">
              <span className="block font-black text-[10px] text-gray-400 uppercase tracking-widest">
                Escolha o Tema do Card
              </span>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id
                  const isLocked = theme.premium && !isPremium

                  return (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`relative flex cursor-pointer flex-col items-start rounded-2xl border p-3.5 text-left transition-all active:scale-98 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/10 text-orange-950 shadow-sm'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-extrabold text-xs">
                          {theme.name}
                        </span>
                        {theme.premium && (
                          <span
                            className={`inline-flex items-center justify-center rounded-md p-1 ${isLocked ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}
                          >
                            <Crown
                              className="h-3 w-3"
                              fill={isLocked ? 'none' : 'currentColor'}
                            />
                          </span>
                        )}
                      </div>
                      <span className="mt-1 font-semibold text-[9px] text-gray-400">
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
              <div className="fade-in mt-5 animate-in space-y-2.5 rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 duration-300">
                <div className="flex items-center gap-2">
                  <Crown
                    className="h-4.5 w-4.5 text-amber-600"
                    fill="currentColor"
                  />
                  <span className="font-black text-amber-800 text-xs uppercase tracking-wider">
                    Recurso Premium
                  </span>
                </div>
                <p className="font-medium text-gray-600 text-xs leading-relaxed">
                  Desbloqueie todos os temas estilizados exclusivos e mostre seu
                  Pace Médio real no card de compartilhamento assinando o
                  ClubRun Premium!
                </p>
                <Link
                  href="/checkout?plan=athlete"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-center font-black text-[10px] text-white uppercase tracking-wider shadow-amber-500/20 shadow-md transition-all hover:bg-amber-600 active:scale-98"
                >
                  Fazer Upgrade Premium <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* CONTROLES E AÇÕES */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-gray-100 border-t pt-6">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3 text-center transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-95"
            >
              {isCopied ? (
                <Check className="h-4.5 w-4.5 text-green-500" />
              ) : (
                <Copy className="h-4.5 w-4.5 text-gray-500 hover:text-orange-500" />
              )}
              <span className="font-black text-[8px] uppercase tracking-wider">
                Copiar Link
              </span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3 text-center transition-all hover:bg-emerald-50 hover:text-emerald-500 active:scale-95"
            >
              <Share2 className="h-4.5 w-4.5 text-gray-500 hover:text-emerald-500" />
              <span className="font-black text-[8px] uppercase tracking-wider">
                WhatsApp
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isLockedTheme}
              className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-center text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                isLockedTheme
                  ? 'bg-gray-400'
                  : 'bg-orange-500 shadow-md shadow-orange-500/10 hover:bg-orange-600'
              }`}
            >
              {isDownloading ? (
                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isLockedTheme ? (
                <Lock className="h-4.5 w-4.5" />
              ) : (
                <Download className="h-4.5 w-4.5" />
              )}
              <span className="font-black text-[8px] uppercase tracking-wider">
                Baixar Card
              </span>
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: Preview do Card (Centralizado com background cinza e proporções stories) */}
        <div className="relative flex shrink-0 select-none items-center justify-center bg-gray-100/50 p-6 md:w-[420px] md:px-12 md:pt-16 md:pb-10">
          <div className="relative">
            {/* CONTAINER DO STORIES DE PERFIL (280px x 497px) */}
            <div
              id="profile-stories-card"
              className={`relative flex h-[497px] w-[280px] flex-col justify-between overflow-hidden rounded-[2.25rem] p-6 text-center text-white shadow-2xl transition-all duration-500 ${selectedTheme.cardBgClass}`}
            >
              {/* Efeitos de Fundo */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
              <div
                className={`-top-12 -right-12 absolute h-40 w-40 rounded-full opacity-80 blur-3xl ${selectedTheme.glowClass}`}
              />
              <div
                className={`-bottom-12 -left-12 absolute h-40 w-40 rounded-full opacity-80 blur-3xl ${selectedTheme.glowClass}`}
              />
              <div
                className={`absolute inset-3.5 border border-gradient-to-b ${selectedTheme.borderGradient} pointer-events-none rounded-[1.75rem]`}
              />

              {/* Cabeçalho do Card */}
              <div className="relative z-10 mt-2.5 flex flex-col items-center space-y-1">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 fill-current text-orange-500" />
                  <span className="font-black text-[9px] text-white uppercase tracking-[0.2em]">
                    ClubRun
                  </span>
                </div>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-black text-[7px] text-amber-400 uppercase tracking-wider">
                    <Crown className="h-2 w-2" fill="currentColor" /> Membro
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-black text-[7px] text-orange-400 uppercase tracking-wider">
                    Pelotão
                  </span>
                )}
              </div>

              {/* Foto de Perfil + Informações Básicas */}
              <div className="relative z-10 my-auto flex flex-col items-center space-y-4">
                <div className="relative">
                  {/* Glow do Avatar */}
                  <div
                    className={`-m-1 absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 ${isPremium ? 'animate-spin opacity-90 duration-3000' : 'opacity-30'}`}
                  />
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-3 border-gray-950 bg-gray-900 shadow-xl">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={user.avatarUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-orange-500 font-black text-2xl text-white">
                        {user.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {isPremium && (
                    <div className="-top-1.5 -right-1.5 absolute flex h-5 w-5 items-center justify-center rounded-full border border-gray-950 bg-amber-500 text-white shadow-md">
                      <Crown className="h-2.5 w-2.5" fill="currentColor" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h3 className="max-w-[200px] truncate font-black text-sm uppercase leading-tight tracking-tight">
                    {user.name || 'Atleta ClubRun'}
                  </h3>
                  {athleteProfile?.city && (
                    <p className="flex items-center justify-center gap-1 font-bold text-[7.5px] text-white/50 uppercase tracking-wider">
                      <MapPin className="h-2.5 w-2.5 text-orange-500" />{' '}
                      {athleteProfile.city}
                    </p>
                  )}
                </div>

                {/* GRID DE ESTATÍSTICAS */}
                <div className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-black/35 p-2.5 backdrop-blur-xs">
                  <div className="text-center">
                    <span className="block font-black text-[6.5px] text-white/40 uppercase tracking-wider">
                      Volume
                    </span>
                    <p className="mt-0.5 font-black font-mono text-white text-xs">
                      {formattedDistance}
                      <span className="font-bold text-[7.5px] text-white/60">
                        {' '}
                        km
                      </span>
                    </p>
                  </div>
                  <div className="border-white/5 border-x text-center">
                    <span className="block font-black text-[6.5px] text-white/40 uppercase tracking-wider">
                      Treinos
                    </span>
                    <p className="mt-0.5 font-black font-mono text-white text-xs">
                      {stats.totalWorkouts}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="block font-black text-[6.5px] text-white/40 uppercase tracking-wider">
                      Ritmo
                    </span>
                    {selectedTheme.premium && !isPremium ? (
                      <div
                        className="mt-0.5 flex items-center gap-0.5 text-amber-500"
                        title="Disponível no Premium"
                      >
                        <Crown className="h-3 w-3" fill="currentColor" />
                        <span className="font-black text-[7px] uppercase">
                          PREM
                        </span>
                      </div>
                    ) : (
                      <p
                        className={`mt-0.5 font-black font-mono text-xs ${selectedTheme.primaryTextClass}`}
                      >
                        {formattedPace}
                        <span className="font-bold text-[7px] text-white/60">
                          /km
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* QR CODE & CTA DO CARD */}
              <div className="relative z-10 mb-2 flex flex-col items-center space-y-3">
                {qrCodeUrl ? (
                  <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-gray-950/80 p-1.5 shadow-xl">
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gray-950">
                      <img
                        src={qrCodeUrl}
                        alt="Perfil QR Code"
                        className="h-18 w-18 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 animate-pulse rounded-xl bg-gray-900" />
                )}

                <div className="space-y-0.5">
                  <p className="font-black text-[6.5px] text-white uppercase leading-none tracking-widest">
                    Escaneie para ver meu perfil
                  </p>
                  <p
                    className={`font-bold text-[5.5px] uppercase ${selectedTheme.secondaryTextClass}`}
                  >
                    e junte-se ao ClubRun
                  </p>
                </div>
              </div>
            </div>

            {/* OVERLAY DE PAYWALL SE O TEMA FOR PREMIUM E O USUÁRIO FOR FREE */}
            {isLockedTheme && (
              <div className="fade-in absolute inset-0 z-20 flex animate-in flex-col items-center justify-center rounded-[2.25rem] border-3 border-amber-500/20 bg-gray-950/85 p-6 text-center backdrop-blur-xs duration-300">
                <div className="mb-4 flex h-12 w-12 animate-bounce items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-black text-sm text-white uppercase tracking-tight">
                  Tema Desbloqueado no Premium
                </h4>
                <p className="mt-2 mb-4 font-medium text-[10px] text-gray-400 leading-relaxed">
                  Os designs estilizados de cards estão disponíveis apenas para
                  atletas Premium.
                </p>
                <Link
                  href="/checkout?plan=athlete"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-black text-[9px] text-white uppercase tracking-wider shadow-amber-500/20 shadow-lg transition-all hover:scale-102 active:scale-98"
                >
                  Desbloquear Temas{' '}
                  <Crown className="h-3 w-3" fill="currentColor" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedThemeId('classic')}
                  className="mt-3 font-black text-[8px] text-gray-400 uppercase transition-colors hover:text-white"
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
