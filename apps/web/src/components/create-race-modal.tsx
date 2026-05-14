'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  Flag,
  MapPin,
  Calendar as CalendarIcon,
  Activity,
  ChevronDown,
  Loader2,
  Image as ImageIcon,
  Map as MapIcon,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { createRaceAction } from '@/app/(app)/[slug]/races/actions'
import dynamic from 'next/dynamic'

const MapEditor = dynamic(() => import('./map-editor').then(mod => mod.MapEditor), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">Carregando mapa...</div>
})

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

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
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('06:00')
  const [imageUrl, setImageUrl] = useState('')
  const [routeData, setRouteData] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState<{ longitude: number; latitude: number } | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  // IBGE States & Cities
  const [ufs, setUfs] = useState<{ id: number; sigla: string; nome: string }[]>([])
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([])
  const [isLoadingUfs, setIsLoadingUfs] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  useEffect(() => {
    if (isOpen) {
      async function loadUfs() {
        try {
          setIsLoadingUfs(true)
          const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
          const data = await response.json()
          setUfs(data)
        } catch (error) {
          console.error('Erro ao carregar UFs:', error)
        } finally {
          setIsLoadingUfs(false)
        }
      }
      loadUfs()
    }
  }, [isOpen])

  useEffect(() => {
    async function loadCities() {
      if (!selectedState) {
        setCities([])
        return
      }
      try {
        setIsLoadingCities(true)
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
        const data = await response.json()
        setCities(data)
      } catch (error) {
        console.error('Erro ao carregar cidades:', error)
      } finally {
        setIsLoadingCities(false)
      }
    }
    loadCities()
  }, [selectedState])

  // Geocoding to center map
  useEffect(() => {
    if (selectedCity && selectedState && MAPBOX_TOKEN) {
      const cityName = `${selectedCity}, ${selectedState}, Brasil`
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${MAPBOX_TOKEN}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center
            setMapCenter({ longitude: lng, latitude: lat })
          }
        })
        .catch(err => console.error('Geocoding error:', err))
    }
  }, [selectedCity, selectedState])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('slug', slug)
    formData.append('name', name)
    formData.append('distance', distance)
    
    // Pattern: City, UF
    const location = `${selectedCity}, ${selectedState}`
    formData.append('city', location)
    
    const fullDate = `${date}T${time}:00`
    formData.append('date', fullDate)
    formData.append('imageUrl', imageUrl)
    if (routeData) {
      formData.append('routeData', JSON.stringify(routeData))
    }

    const result = await createRaceAction(formData)

    if (result.success) {
      toast.success(result.message)
      setName('')
      setDistance('')
      setSelectedCity('')
      setSelectedState('')
      setImageUrl('')
      setRouteData(null)
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

      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-200">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="flex items-center gap-3 text-xl font-black text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Flag className="h-5 w-5" />
            </div>
            Cadastrar Corrida
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto bg-white">
          <form id="race-form" onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* ESQUERDA: CAMPOS DE TEXTO */}
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    <Flag className="h-3.5 w-3.5 text-orange-500" /> Nome da Corrida
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
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
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

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                      <CalendarIcon className="h-3.5 w-3.5 text-orange-500" /> Hora
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    <CalendarIcon className="h-3.5 w-3.5 text-orange-500" /> Data da Prova
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                      <Globe className="h-3.5 w-3.5 text-orange-500" /> Estado
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        disabled={isLoadingUfs}
                        className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50"
                      >
                        <option value="">UF</option>
                        {ufs.map(uf => (
                          <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                      <MapPin className="h-3.5 w-3.5 text-orange-500" /> Cidade
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        disabled={isLoadingCities || !selectedState}
                        className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50"
                      >
                        <option value="">Selecione...</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.nome}>{city.nome}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    <ImageIcon className="h-3.5 w-3.5 text-orange-500" /> URL da Imagem (Opcional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              {/* DIREITA: MAPA */}
              <div className="flex flex-col space-y-3 lg:h-full">
                <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <MapIcon className="h-3.5 w-3.5 text-orange-500" /> Desenhar Percurso (Opcional)
                </label>
                <div className="flex-1 overflow-hidden">
                   <MapEditor onChange={setRouteData} center={mapCenter} />
                </div>
                <p className="text-[10px] font-medium leading-relaxed text-gray-400">
                  O mapa centralizará automaticamente na cidade selecionada. Use o botão de linha para desenhar o trajeto oficial.
                </p>
              </div>
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
              'CRIAR CORRIDA AGORA'
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
