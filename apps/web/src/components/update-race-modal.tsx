'use client'

import React, { useState, useEffect } from 'react'
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
  Edit,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateRaceAction } from '@/app/(app)/[slug]/races/actions'
import { getRace } from '@/http/get-race'
import dynamic from 'next/dynamic'
import { format, addHours, isBefore, parse } from 'date-fns'
import { DatePicker } from './date-picker'
import { WarningModal } from './warning-modal'

const MapEditor = dynamic(() => import('./map-editor').then(mod => mod.MapEditor), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">Carregando mapa...</div>
})

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

interface UpdateRaceModalProps {
  isOpen: boolean
  slug: string
  raceId: string
  onClose: () => void
  onSuccess?: () => void
}

export function UpdateRaceModal({
  isOpen,
  slug,
  raceId,
  onClose,
  onSuccess,
}: UpdateRaceModalProps) {
  const [name, setName] = useState('')
  const [distance, setDistance] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [routeData, setRouteData] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState<{ longitude: number; latitude: number } | undefined>(undefined)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  // IBGE States & Cities
  const [ufs, setUfs] = useState<{ id: number; sigla: string; nome: string }[]>([])
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([])
  const [isLoadingUfs, setIsLoadingUfs] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Load Initial Data
  useEffect(() => {
    if (isOpen && raceId) {
      async function loadData() {
        try {
          setIsFetching(true)
          const { race } = await getRace(slug, raceId)
          
          setName(race.name)
          setDistance(race.distance.toString())
          setImageUrl(race.imageUrl || '')
          setRouteData(race.routeData)
          
          // Parse location "City, UF"
          if (race.city && race.city.includes(',')) {
            const [c, s] = race.city.split(',').map(x => x.trim())
            setSelectedState(s)
            setSelectedCity(c)
          } else if (race.city) {
             setSelectedCity(race.city)
          }

          // Parse date and time
          const d = new Date(race.date)
          setDate(format(d, 'dd/MM/yyyy'))
          setTime(format(d, 'HH:mm'))
          
        } catch (error) {
          console.error(error)
          toast.error('Erro ao carregar dados da corrida.')
          onClose()
        } finally {
          setIsFetching(false)
        }
      }
      loadData()
    }
  }, [isOpen, raceId, slug])

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

    // Validation: Min 24h in advance
    let formattedDate = date
    if (date.includes('/')) {
      const [day, month, year] = date.split('/')
      formattedDate = `${year}-${month}-${day}`
    }

    const raceDateTime = parse(`${formattedDate} ${time}`, 'yyyy-MM-dd HH:mm', new Date())
    const minDate = addHours(new Date(), 24)

    if (isBefore(raceDateTime, minDate)) {
      setWarningMessage('Para garantir uma organização impecável, as corridas devem ser editadas respeitando o prazo de no mínimo 24 horas de antecedência. Por favor, ajuste a data ou o horário.')
      setShowWarning(true)
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    
    const location = `${selectedCity}, ${selectedState}`
    formData.append('city', location)
    
    // Parse dd/mm/yyyy to yyyy-mm-dd
    // formattedDate is already defined and parsed above for validation

    // Already formatted above for validation
    formData.append('date', `${formattedDate}T${time}:00`)
    formData.append('imageUrl', imageUrl)
    if (routeData) {
      formData.append('routeData', JSON.stringify(routeData))
    }

    const result = await updateRaceAction(formData)

    if (result.success) {
      toast.success(result.message)
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
              <Edit className="h-5 w-5" />
            </div>
            Editar Corrida
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {isFetching ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest text-center">Carregando dados da corrida...</p>
          </div>
        ) : (
          <div className="overflow-y-auto bg-white">
            <form id="update-race-form" onSubmit={handleSubmit} className="p-6 md:p-8">
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
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={time}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '')
                            if (val.length > 4) val = val.slice(0, 4)
                            if (val.length > 2) val = val.replace(/(\d{2})(\d{2})/, '$1:$2')
                            setTime(val)
                          }}
                          placeholder="06:00"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50 pr-12 pl-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                        <span className="absolute top-1/2 right-12 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">
                          h
                        </span>
                      </div>
                    </div>
                  </div>

                  <DatePicker 
                    label="Data da Prova"
                    value={date}
                    onChange={setDate}
                    required
                  />

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
                    <MapIcon className="h-3.5 w-3.5 text-orange-500" /> Editar Percurso (Opcional)
                  </label>
                  <div className="flex-1 overflow-hidden min-h-[400px] border border-gray-100 rounded-2xl">
                     <MapEditor 
                      initialValue={routeData} 
                      onChange={setRouteData} 
                      center={mapCenter} 
                     />
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed text-gray-400">
                    O mapa carregará o percurso atual. Você pode editá-lo ou redesenhá-lo conforme necessário.
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}

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
            form="update-race-form"
            disabled={isLoading || isFetching}
            className="cursor-pointer flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-10 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              'SALVAR ALTERAÇÕES'
            )}
          </button>
        </footer>
      </div>
      <WarningModal
        isOpen={showWarning}
        title="Atenção ao Prazo"
        message={warningMessage}
        onClose={() => setShowWarning(false)}
      />
    </div>
  )
}
