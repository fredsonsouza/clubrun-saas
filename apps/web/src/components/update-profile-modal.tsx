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
import { useState } from 'react'

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
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  user,
  athleteProfile: initialData,
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

  const isSubscribed = initialData?.isPremium ?? false

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
    <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center p-4 duration-200 sm:p-6">
      <button
        type="button"
        aria-label="Fechar edição de perfil"
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="zoom-in-95 relative flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-gray-100 border-b bg-white px-6 py-5">
          <h2 className="flex items-center gap-2 font-extrabold text-gray-900 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <User className="h-4 w-4" />
            </div>
            Editar Perfil de Atleta
          </h2>
          <button
            type="button"
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
              <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-500/10 bg-gradient-to-r from-gray-900 via-orange-950 to-orange-500 p-6 text-white shadow-xl">
                {/* Efeitos de Luz */}
                <div className="-mt-4 -mr-4 absolute top-0 right-0 h-24 w-24 rounded-full bg-orange-500/20 blur-xl" />

                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 font-black text-[9px] uppercase tracking-widest">
                      👑 Premium
                    </span>
                    <h4 className="font-black text-sm leading-snug tracking-tight">
                      Desbloqueie o seu perfil completo
                    </h4>
                    <p className="max-w-sm font-bold text-[10px] text-gray-300 leading-normal">
                      Personalize sua capa, adicione bio, peso, altura,
                      vestíveis, ficha de saúde e participe dos rankings!
                    </p>
                  </div>
                  <Link
                    href="/checkout?plan=athlete"
                    onClick={onClose}
                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-center font-black text-[10px] text-gray-900 uppercase tracking-wider shadow-black/10 shadow-lg transition-all hover:bg-orange-500 hover:text-white active:scale-95"
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
              />
              <div className="relative">
                <ImageUpload
                  label="Sua Capa (Banner)"
                  value={formData.coverUrl}
                  onChange={(url) =>
                    setFormData({ ...formData, coverUrl: url })
                  }
                  aspectRatio="video"
                />
                {!isSubscribed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-200 border-dashed bg-white/70 p-4 text-center backdrop-blur-xs">
                    <span className="flex items-center gap-1 font-black text-[10px] text-orange-500 uppercase tracking-widest">
                      👑 Premium
                    </span>
                    <p className="mt-1 font-bold text-[9px] text-gray-400">
                      Personalize sua capa
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* NOME COMPLETO */}
            <div className="space-y-2">
              <label
                htmlFor="profile-name"
                className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
              >
                Seu Nome Completo
              </label>
              <input
                id="profile-name"
                type="text"
                required
                disabled={!isSubscribed}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Fredson Souza"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* BIO E LOCALIZAÇÃO */}
            <div className="space-y-4">
              <h3 className="font-black text-orange-500 text-xs uppercase tracking-widest">
                Informações Básicas
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label
                    htmlFor="profile-bio"
                    className="font-bold text-gray-500 text-xs uppercase"
                  >
                    Sobre Você (Bio)
                  </label>
                  <textarea
                    id="profile-bio"
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
                    className="h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Data de Nascimento (Obrigatória para todos - Liberada) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-birth-date"
                    className="font-bold text-gray-500 text-xs uppercase"
                  >
                    Data de Nascimento *
                  </label>
                  <input
                    id="profile-birth-date"
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-city"
                    className="flex items-center gap-2 font-bold text-gray-500 text-xs uppercase"
                  >
                    <MapPin className="h-3 w-3" /> Cidade / Estado
                  </label>
                  <input
                    id="profile-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Ex: Boa Vista, RR"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-gender"
                    className="font-bold text-gray-500 text-xs uppercase"
                  >
                    Gênero
                  </label>
                  <select
                    id="profile-gender"
                    disabled={!isSubscribed}
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-700 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
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
              <h3 className="font-black text-orange-500 text-xs uppercase tracking-widest">
                Dados Físicos (Opcional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-weight"
                    className="flex items-center gap-2 font-bold text-gray-500 text-xs uppercase"
                  >
                    <Scale className="h-3 w-3" /> Peso (kg)
                  </label>
                  <input
                    id="profile-weight"
                    type="number"
                    disabled={!isSubscribed}
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder={isSubscribed ? '0.0' : 'Bloqueado'}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-height"
                    className="flex items-center gap-2 font-bold text-gray-500 text-xs uppercase"
                  >
                    <Ruler className="h-3 w-3" /> Altura (cm)
                  </label>
                  <input
                    id="profile-height"
                    type="number"
                    disabled={!isSubscribed}
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    placeholder={isSubscribed ? '0' : 'Bloqueado'}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* EQUIPAMENTOS DE CORRIDA (Premium) */}
            <div className="relative space-y-4">
              <h3 className="flex items-center gap-1.5 font-black text-orange-500 text-xs uppercase tracking-widest">
                Equipamentos de Corrida{' '}
                {!isSubscribed && <Crown className="h-3.5 w-3.5" />}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-shoes"
                    className="font-bold text-gray-500 text-xs uppercase"
                  >
                    Tênis de Treino
                  </label>
                  <input
                    id="profile-shoes"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-shoes-max"
                    className="font-bold text-gray-500 text-xs uppercase"
                  >
                    Vida Útil Máxima (KM)
                  </label>
                  <input
                    id="profile-shoes-max"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-watch"
                    className="font-bold text-gray-500 text-xs uppercase"
                  >
                    Relógio / Smartwatch
                  </label>
                  <input
                    id="profile-watch"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* FICHA MÉDICA E SEGURANÇA (Premium) */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-1.5 font-black text-orange-500 text-xs uppercase tracking-widest">
                Saúde & Ficha Médica{' '}
                {!isSubscribed && <Crown className="h-3.5 w-3.5" />}
              </h3>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3">
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
                    className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="font-bold text-gray-700 text-sm">
                    Possuo alguma condição médica, limitação física ou problema
                    de saúde
                  </span>
                </label>

                {isSubscribed && formData.hasMedicalConditions && (
                  <div className="fade-in slide-in-from-top-2 animate-in space-y-1.5 duration-300">
                    <label
                      htmlFor="profile-medical-conditions"
                      className="font-bold text-red-500 text-xs uppercase"
                    >
                      Descreva suas condições médicas (ex: Asma, Diabetes,
                      Hipertensão, Lesão, etc.) *
                    </label>
                    <textarea
                      id="profile-medical-conditions"
                      required
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalConditions: e.target.value,
                        })
                      }
                      placeholder="Estas informações ajudam os treinadores do seu clube a resguardarem sua segurança física durante os treinos..."
                      className="h-24 w-full rounded-xl border border-red-200 bg-red-50/20 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* REDES SOCIAIS */}
            <div className="space-y-4">
              <h3 className="font-black text-orange-500 text-xs uppercase tracking-widest">
                Redes Sociais
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-instagram"
                    className="flex items-center gap-2 font-bold text-gray-500 text-xs uppercase"
                  >
                    <Instagram className="h-3 w-3" /> Instagram URL
                  </label>
                  <input
                    id="profile-instagram"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-strava"
                    className="flex items-center gap-2 font-bold text-gray-500 text-xs uppercase"
                  >
                    <Activity className="h-3 w-3" /> Strava URL
                  </label>
                  <input
                    id="profile-strava"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="font-black text-orange-500 text-xs uppercase tracking-widest">
                Privacidade do Perfil
              </p>
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
                      <span className="block font-bold text-gray-900 text-sm">
                        Público
                      </span>
                      <span className="font-medium text-[10px] text-gray-400">
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
                      <span className="block font-bold text-gray-900 text-sm">
                        Privado
                      </span>
                      <span className="font-medium text-[10px] text-gray-400">
                        Apenas você vê seus dados físicos
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-3 rounded-b-3xl border-gray-100 border-t bg-gray-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 cursor-pointer rounded-xl px-5 font-bold text-gray-600 transition-colors hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={isSaving}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
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
