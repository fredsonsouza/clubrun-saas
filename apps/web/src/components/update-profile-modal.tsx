'use client'

import React, { useState } from 'react'
import {
  X,
  User,
  MapPin,
  Scale,
  Ruler,
  Instagram,
  Activity,
  Save,
  Globe,
  Lock,
} from 'lucide-react'

interface UpdateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: {
    bio: string | null
    city: string | null
    weight: number | null
    height: number | null
    gender: string | null
    instagramUrl: string | null
    stravaUrl: string | null
    isPublic: boolean
  } | null
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  initialData,
}: UpdateProfileModalProps) {
  const [formData, setFormData] = useState({
    bio: initialData?.bio || '',
    city: initialData?.city || '',
    weight: initialData?.weight || '',
    height: initialData?.height || '',
    gender: initialData?.gender || 'MALE',
    instagramUrl: initialData?.instagramUrl || '',
    stravaUrl: initialData?.stravaUrl || '',
    isPublic: initialData?.isPublic ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // Simulação de chamada: PUT /profile/athlete
    setTimeout(() => {
      setIsSaving(false)
      alert('Perfil atualizado com sucesso!')
      onClose()
    }, 1000)
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
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
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
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Conte sua história no esporte..."
                    className="h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
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
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="cursor-pointer w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
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
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder="0.0"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Ruler className="h-3 w-3" /> Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
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
                    value={formData.instagramUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramUrl: e.target.value,
                      })
                    }
                    placeholder="https://instagram.com/seu.perfil"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Activity className="h-3 w-3" /> Strava URL
                  </label>
                  <input
                    type="url"
                    value={formData.stravaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, stravaUrl: e.target.value })
                    }
                    placeholder="https://strava.com/athletes/seu.id"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* PRIVACIDADE */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-widest text-orange-500">
                Privacidade do Perfil
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="isPublic"
                    checked={formData.isPublic === true}
                    onChange={() => setFormData({ ...formData, isPublic: true })}
                    className="peer sr-only"
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:ring-1">
                    <Globe className="h-5 w-5 shrink-0 text-orange-500" />
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
                <label className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="isPublic"
                    checked={formData.isPublic === false}
                    onChange={() => setFormData({ ...formData, isPublic: false })}
                    className="peer sr-only"
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:ring-1">
                    <Lock className="h-5 w-5 shrink-0 text-gray-400 peer-checked:text-orange-500" />
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
