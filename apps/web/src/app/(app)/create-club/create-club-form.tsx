'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Globe,
  MapPin,
  Trophy,
  Users,
  Zap,
  AlignLeft,
  ArrowLeft,
} from 'lucide-react'
import { Header } from '@/components/header'
import { toast } from 'sonner'
import { createClubAction } from './actions'

const generateSlug = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

interface CreateClubFormProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

export function CreateClubForm({ user }: CreateClubFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hasExistingClub = true

  useEffect(() => {
    if (!isSlugManuallyEdited) setSlug(generateSlug(name))
  }, [name, isSlugManuallyEdited])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true)
    setSlug(generateSlug(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('description', description)

    const result = await createClubAction(formData)

    if (result.success) {
      toast.success(result.message)
      router.push('/explore')
    } else {
      toast.error(result.message)
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    if (hasExistingClub) {
      router.push('/dashboard')
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      {/* HEADER IMPORTADO E CONFIGURADO */}
      <Header variant="onboarding" user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 pb-24 duration-500 sm:px-6 lg:px-8">
        <button
          onClick={handleGoBack}
          className="group mb-6 flex items-center gap-2 rounded-lg p-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900 focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar
        </button>

        <div className="mb-10 text-center md:text-left">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900">
            Crie o seu pelotão
          </h1>
          <p className="text-lg font-medium text-gray-500">
            Defina a identidade do seu clube e convide seus atletas para
            começarem a competir.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10 lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase"
                >
                  <Trophy className="h-4 w-4 text-orange-500" /> Nome do Clube
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Macuxi Runner"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg font-bold text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="slug"
                  className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase"
                >
                  <Globe className="h-4 w-4 text-orange-500" /> Link Público
                </label>
                <div className="flex items-stretch overflow-hidden rounded-xl shadow-sm transition-all focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/50">
                  <span className="flex items-center border border-r-0 border-gray-200 bg-gray-100 px-4 text-sm font-medium text-gray-500 sm:text-base">
                    clubrun.com/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="nome-do-clube"
                    className="w-full flex-1 border border-gray-200 bg-gray-50 px-4 py-4 font-bold text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase"
                >
                  <AlignLeft className="h-4 w-4 text-orange-500" /> Descrição
                  (Opcional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Qual o foco da sua assessoria ou grupo de amigos?"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                />
              </div>

              <hr className="border-gray-100" />

              <div className="flex flex-col-reverse items-center justify-end gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="w-full rounded-xl px-6 py-4 font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || name.length < 3}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70 sm:w-auto"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Criar meu Clube <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="relative hidden md:block lg:col-span-5">
            <div className="sticky top-24">
              <div className="mb-4 ml-2 flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>{' '}
                Pré-visualização ao vivo
              </div>
              <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white p-8 shadow-xl transition-all duration-300">
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                  <Zap className="h-8 w-8" />
                </div>
                <h3
                  className={`mb-2 truncate text-2xl font-extrabold transition-colors duration-300 ${name ? 'text-gray-900' : 'text-gray-300'}`}
                >
                  {name || 'Nome do seu Clube'}
                </h3>
                <p
                  className={`mb-6 line-clamp-3 min-h-[60px] text-sm font-medium transition-colors duration-300 ${description ? 'text-gray-500' : 'text-gray-300'}`}
                >
                  {description || 'Sua descrição aparecerá aqui...'}
                </p>
                <div className="mb-8 flex flex-wrap gap-3 text-xs font-bold text-gray-600">
                  <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> Global
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-400" /> 1 Membro
                  </span>
                </div>
                <div className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-50 grayscale">
                  <span className="text-sm font-bold text-gray-500">
                    Pedir para Participar
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
