'use client'

import {
  Activity,
  ArrowRight,
  Crown,
  Instagram,
  Loader2,
  Lock,
  MapPin,
  Ruler,
  Save,
  Scale,
  User,
  X,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

interface UpdateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string | null
    avatarUrl: string | null
  }
  athleteProfile: {
    bio: string | null
    city: string | null
    weight: number | null
    height: number | null
    gender: string | null
    birthDate: string
    instagramUrl: string | null
    stravaUrl: string | null
    coverUrl: string | null
    shoes?: string | null
    shoesMaxDistance?: number | null
    shoesRemainingDistance?: number | null
    watch?: string | null
    hasMedicalConditions?: boolean
    medicalConditions?: string | null
    isPublic?: boolean
    isPremium?: boolean
  } | null
  token?: string
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  user,
  athleteProfile: initialData,
  token,
}: UpdateProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatarUrl: user?.avatarUrl || '',
    bio: initialData?.bio || '',
    city: initialData?.city || '',
    weight: initialData?.weight?.toString() || '',
    height: initialData?.height?.toString() || '',
    gender: initialData?.gender || 'MALE',
    birthDate: initialData?.birthDate
      ? new Date(initialData.birthDate).toISOString().split('T')[0]
      : '2000-01-01',
    instagramUrl: initialData?.instagramUrl || '',
    stravaUrl: initialData?.stravaUrl || '',
    coverUrl: initialData?.coverUrl || '',
    isPublic: initialData?.isPublic ?? true,
    shoes: initialData?.shoes || '',
    shoesMaxDistance: initialData?.shoesMaxDistance?.toString() || '',
    watch: initialData?.watch || '',
    hasMedicalConditions: initialData?.hasMedicalConditions ?? false,
    medicalConditions: initialData?.medicalConditions || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Assinatura do Atleta
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSubscribed =
        localStorage.getItem('clubrun:athlete_subscribed') === 'true'
      const premiumByRole = initialData?.isPremium ?? false
      setIsSubscribed(storedSubscribed || premiumByRole)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação estrita de data de nascimento real
    if (formData.birthDate === '2000-01-01') {
      toast.error(
        'Por favor, informe sua data de nascimento real para continuar!'
      )
      return
    }

    if (
      formData.shoes &&
      (!formData.shoesMaxDistance ||
        Number.parseFloat(formData.shoesMaxDistance) <= 0)
    ) {
      toast.error(
        'Ao informar um tênis, você deve preencher a quilometragem recomendada pelo fabricante maior que zero!'
      )
      return
    }

    setIsSaving(true)

    // Import delayed to avoid circular issues if any
    const { updateProfileAction } = await import('@/app/(app)/profile/actions')

    const result = await updateProfileAction({
      ...formData,
      name: formData.name,
      avatarUrl: formData.avatarUrl || null,
      weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
      height: formData.height ? Number.parseInt(formData.height) : undefined,
      gender: formData.gender as any,
      birthDate: new Date(formData.birthDate),
      instagramUrl: formData.instagramUrl || null,
      stravaUrl: formData.stravaUrl || null,
      coverUrl: formData.coverUrl || null,
      shoes: formData.shoes || null,
      shoesMaxDistance: formData.shoes
        ? formData.shoesMaxDistance
          ? Number.parseFloat(formData.shoesMaxDistance)
          : null
        : null,
      watch: formData.watch || null,
      hasMedicalConditions: formData.hasMedicalConditions,
      medicalConditions: formData.hasMedicalConditions
        ? formData.medicalConditions || null
        : null,
    })

    setIsSaving(false)

    if (result.success) {
      toast.success(result.message)
      onClose()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <User className="h-4 w-4" />
            </div>
            Editar Perfil de Atleta
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto bg-white p-6 md:p-8">
          <form
            id="profile-form"
            onSubmit={handleSubmit}
            className="space-y-10"
          >
            {!isSubscribed && (
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-gray-900 via-orange-950 to-orange-500 p-6 text-white shadow-xl border border-orange-500/10">
                {/* Efeitos de Luz */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-orange-500/20 blur-xl" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest">
                      👑 Premium
                    </span>
                    <h4 className="text-sm font-black tracking-tight leading-snug">
                      Desbloqueie o seu perfil completo
                    </h4>
                    <p className="text-[10px] font-bold text-gray-300 leading-normal max-w-sm">
                      Personalize sua capa, adicione bio, peso, altura,
                      vestíveis, ficha de saúde e participe dos rankings!
                    </p>
                  </div>
                  <Link
                    href="/checkout?plan=athlete"
                    onClick={onClose}
                    className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-[10px] font-black text-gray-900 tracking-wider uppercase shadow-lg shadow-black/10 transition-all hover:bg-orange-500 hover:text-white active:scale-95 text-center"
                  >
                    Assinar Agora
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* IDENTIDADE VISUAL */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ImageUpload
                label="Sua Foto de Perfil"
                value={formData.avatarUrl}
                onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                aspectRatio="square"
                token={token}
              />
              <div className="relative">
                <ImageUpload
                  label="Sua Capa (Banner)"
                  value={formData.coverUrl}
                  onChange={(url) =>
                    setFormData({ ...formData, coverUrl: url })
                  }
                  aspectRatio="video"
                  token={token}
                />
                {!isSubscribed && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-4 text-center">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                      👑 Premium
                    </span>
                    <p className="text-[9px] font-bold text-gray-400 mt-1">
                      Personalize sua capa
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* NOME COMPLETO */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Seu Nome Completo
              </label>
              <input
                type="text"
                required
                disabled={!isSubscribed}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Fredson Souza"
                className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
              />
            </div>

            {/* BIO E LOCALIZAÇÃO */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">
                Informações Básicas
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Sobre Você (Bio)
                  </label>
                  <textarea
                    disabled={!isSubscribed}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder={
                      isSubscribed
                        ? 'Conte sua história no esporte...'
                        : 'Conteúdo exclusivo para atletas Premium 👑'
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>

                {/* Data de Nascimento (Obrigatória para todos - Liberada) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <MapPin className="h-3 w-3" /> Cidade / Estado
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Ex: Boa Vista, RR"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Gênero
                  </label>
                  <select
                    disabled={!isSubscribed}
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DADOS FÍSICOS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">
                Dados Físicos (Opcional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Scale className="h-3 w-3" /> Peso (kg)
                  </label>
                  <input
                    type="number"
                    disabled={!isSubscribed}
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder={isSubscribed ? '0.0' : 'Bloqueado'}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Ruler className="h-3 w-3" /> Altura (cm)
                  </label>
                  <input
                    type="number"
                    disabled={!isSubscribed}
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    placeholder={isSubscribed ? '0' : 'Bloqueado'}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* EQUIPAMENTOS DE CORRIDA (Premium) */}
            <div className="space-y-4 relative">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-1.5">
                Equipamentos de Corrida{' '}
                {!isSubscribed && <Crown className="h-3.5 w-3.5" />}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Tênis de Treino
                  </label>
                  <input
                    type="text"
                    disabled={!isSubscribed}
                    value={formData.shoes}
                    onChange={(e) =>
                      setFormData({ ...formData, shoes: e.target.value })
                    }
                    placeholder={
                      isSubscribed
                        ? 'Ex: Nike Pegasus 40'
                        : 'Exclusivo Atleta Premium 👑'
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Vida Útil Máxima (KM)
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={!isSubscribed || !formData.shoes}
                    value={formData.shoesMaxDistance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shoesMaxDistance: e.target.value,
                      })
                    }
                    placeholder={!formData.shoes ? 'Defina o tênis' : 'Ex: 500'}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Relógio / Smartwatch
                  </label>
                  <input
                    type="text"
                    disabled={!isSubscribed}
                    value={formData.watch}
                    onChange={(e) =>
                      setFormData({ ...formData, watch: e.target.value })
                    }
                    placeholder={
                      isSubscribed
                        ? 'Ex: Garmin Forerunner 255'
                        : 'Exclusivo Atleta Premium 👑'
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* FICHA MÉDICA E SEGURANÇA (Premium) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-1.5">
                Saúde & Ficha Médica{' '}
                {!isSubscribed && <Crown className="h-3.5 w-3.5" />}
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isSubscribed}
                    checked={isSubscribed && formData.hasMedicalConditions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasMedicalConditions: e.target.checked,
                      })
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Possuo alguma condição médica, limitação física ou problema
                    de saúde
                  </span>
                </label>

                {isSubscribed && formData.hasMedicalConditions && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-bold text-red-500 uppercase">
                      Descreva suas condições médicas (ex: Asma, Diabetes,
                      Hipertensão, Lesão, etc.) *
                    </label>
                    <textarea
                      required
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalConditions: e.target.value,
                        })
                      }
                      placeholder="Estas informações ajudam os treinadores do seu clube a resguardarem sua segurança física durante os treinos..."
                      className="h-24 w-full rounded-xl border border-red-200 bg-red-50/20 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* REDES SOCIAIS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">
                Redes Sociais
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Instagram className="h-3 w-3" /> Instagram URL
                  </label>
                  <input
                    type="url"
                    disabled={!isSubscribed}
                    value={formData.instagramUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramUrl: e.target.value,
                      })
                    }
                    placeholder={
                      isSubscribed
                        ? 'https://instagram.com/seu.perfil'
                        : 'Exclusivo Atleta Premium 👑'
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Activity className="h-3 w-3" /> Strava URL
                  </label>
                  <input
                    type="url"
                    disabled={!isSubscribed}
                    value={formData.stravaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, stravaUrl: e.target.value })
                    }
                    placeholder={
                      isSubscribed
                        ? 'https://strava.com/athletes/seu.id'
                        : 'Exclusivo Atleta Premium 👑'
                    }
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-widest text-orange-500">
                Privacidade do Perfil
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`group relative ${isSubscribed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  <input
                    type="radio"
                    name="isPublic"
                    disabled={!isSubscribed}
                    checked={isSubscribed && formData.isPublic === true}
                    onChange={() =>
                      setFormData({ ...formData, isPublic: true })
                    }
                    className="peer sr-only"
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:ring-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-900">
                        Público
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        Todos podem ver suas estatísticas
                      </span>
                    </div>
                  </div>
                </label>
                <label
                  className={`group relative ${isSubscribed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  <input
                    type="radio"
                    name="isPublic"
                    disabled={!isSubscribed}
                    checked={isSubscribed && formData.isPublic === false}
                    onChange={() =>
                      setFormData({ ...formData, isPublic: false })
                    }
                    className="peer sr-only"
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:ring-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-500 peer-checked:bg-orange-100 peer-checked:text-orange-500">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-900">
                        Privado
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        Apenas você vê seus dados físicos
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-3 rounded-b-3xl border-t border-gray-100 bg-gray-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer h-11 rounded-xl px-5 font-bold text-gray-600 transition-colors hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={isSaving}
            className="cursor-pointer flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Salvar Alterações
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
