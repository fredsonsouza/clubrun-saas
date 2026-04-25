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
      // Redireciona para o novo slug (embora a API gere o slug, assumimos que segue o padrão ou usamos o slug digitado se a API permitisse)
      // Por agora, redirecionamos para o dashboard do novo clube
      router.push(`/${slug}/dashboard`)
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 selection:bg-orange-500 selection:text-white">

      {/* HEADER IMPORTADO E CONFIGURADO */}
      <Header variant="onboarding" user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 animate-in fade-in duration-500">

        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar
        </button>

        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">Crie o seu pelotão</h1>
          <p className="text-lg text-gray-500 font-medium">Defina a identidade do seu clube e convide seus atletas para começarem a competir.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"><Trophy className="w-4 h-4 text-orange-500" /> Nome do Clube</label>
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Macuxi Runner" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold text-lg placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-sm" />
              </div>

              <div className="space-y-2">
                <label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" /> Link Público</label>
                <div className="flex items-stretch shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all">
                  <span className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 text-gray-500 font-medium text-sm sm:text-base">clubrun.com/</span>
                  <input id="slug" type="text" required value={slug} onChange={handleSlugChange} placeholder="nome-do-clube" className="flex-1 bg-gray-50 border border-gray-200 px-4 py-4 text-gray-900 font-bold focus:bg-white focus:outline-none w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"><AlignLeft className="w-4 h-4 text-orange-500" /> Descrição (Opcional)</label>
                <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qual o foco da sua assessoria ou grupo de amigos?" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-5 text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-sm resize-none" />
              </div>

              <hr className="border-gray-100" />

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
                <button type="button" onClick={handleGoBack} className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading || name.length < 3} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-70">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Criar meu Clube <ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 relative hidden md:block">
            <div className="sticky top-24">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Pré-visualização ao vivo
              </div>
              <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 overflow-hidden relative transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 border border-orange-100"><Zap className="w-8 h-8" /></div>
                <h3 className={`text-2xl font-extrabold mb-2 truncate transition-colors duration-300 ${name ? 'text-gray-900' : 'text-gray-300'}`}>{name || 'Nome do seu Clube'}</h3>
                <p className={`text-sm font-medium mb-6 line-clamp-3 min-h-[60px] transition-colors duration-300 ${description ? 'text-gray-500' : 'text-gray-300'}`}>{description || 'Sua descrição aparecerá aqui...'}</p>
                <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-600 mb-8">
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Global</span>
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg"><Users className="w-3.5 h-3.5 text-gray-400" /> 1 Membro</span>
                </div>
                <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                  <span className="text-sm font-bold text-gray-500">Pedir para Participar</span><ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
