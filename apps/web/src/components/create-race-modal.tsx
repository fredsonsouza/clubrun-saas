'use client'

import React, { useState } from 'react'
import {
  X,
  Flag,
  MapPin,
  Calendar as CalendarIcon,
  Activity,
  ChevronDown,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { createRaceAction } from '@/app/(app)/[slug]/races/actions'

interface CreateRaceModalProps {
  isOpen: boolean
  slug: string
  onClose: () => void
  onSuccess?: () => void
}

export function CreateRaceModal({
  isOpen,
  slug,
  onClose,
  onSuccess,
}: CreateRaceModalProps) {
  const [name, setName] = useState('')
  const [distance, setDistance] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('slug', slug)
    formData.append('name', name)
    formData.append('distance', distance)
    formData.append('city', city)
    formData.append('date', date)
    formData.append('imageUrl', imageUrl)

    const result = await createRaceAction(formData)

    if (result.success) {
      toast.success(result.message)
      setName('')
      setDistance('')
      setCity('')
      setImageUrl('')
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-3 text-xl font-black text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Flag className="h-5 w-5" />
            </div>
            Cadastrar Prova-Alvo
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto bg-white p-6 md:p-8">
          <form id="race-form" onSubmit={handleSubmit} className="space-y-6">
            {/* NOME DA PROVA */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Flag className="h-3.5 w-3.5 text-orange-500" /> Nome da Prova
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Meia Maratona do Rio 2026"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DISTÂNCIA */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Activity className="h-3.5 w-3.5 text-orange-500" /> Distância
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="0.0"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pr-12 pl-5 font-mono text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 font-black text-gray-400">
                    km
                  </span>
                </div>
              </div>

              {/* DATA */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <CalendarIcon className="h-3.5 w-3.5 text-orange-500" /> Data
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>

            {/* CIDADE / LOCALIZAÇÃO */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <MapPin className="h-3.5 w-3.5 text-orange-500" /> Cidade / Localização
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Rio de Janeiro, RJ"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            {/* IMAGEM DA PROVA (Opcional) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <ImageIcon className="h-3.5 w-3.5 text-orange-500" /> URL da Imagem (Opcional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/prova.jpg"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </form>
        </div>

        <footer className="flex items-center justify-end gap-4 rounded-b-[2.5rem] border-t border-gray-100 bg-gray-50 px-8 py-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer h-14 rounded-2xl px-8 font-bold text-gray-600 transition-colors hover:bg-gray-200/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="race-form"
            disabled={isLoading}
            className="cursor-pointer flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-10 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              'CRIAR PROVA AGORA'
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
