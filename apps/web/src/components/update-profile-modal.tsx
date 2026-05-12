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
  AlertTriangle,
  Trash2,
  PauseCircle,
  Loader2,
} from 'lucide-react'

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
    instagramUrl: string | null
    stravaUrl: string | null
    isPublic: boolean
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
    instagramUrl: initialData?.instagramUrl || '',
    stravaUrl: initialData?.stravaUrl || '',
    isPublic: initialData?.isPublic ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isAnonymizing, setIsAnonymizing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Import delayed to avoid circular issues if any
    const { updateProfileAction } = await import('@/app/(app)/profile/actions')

    const result = await updateProfileAction({
      ...formData,
      name: formData.name,
      avatarUrl: formData.avatarUrl || null,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseInt(formData.height) : undefined,
      gender: formData.gender as any,
      instagramUrl: formData.instagramUrl || null,
      stravaUrl: formData.stravaUrl || null,
    })

    setIsSaving(false)
    
    if (result.success) {
      toast.success(result.message)
      onClose()
    } else {
      toast.error(result.message)
    }
  }

  const handleAnonymize = async () => {
    if (!confirmPassword) {
      toast.error('Por favor, digite sua senha para confirmar.')
      return
    }

    setIsAnonymizing(true)
    const { anonymizeAccountAction } = await import('@/app/(app)/profile/actions')
    
    const result = await anonymizeAccountAction(confirmPassword)
    
    if (result && !result.success) {
      toast.error(result.message)
      setIsAnonymizing(false)
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
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
            {/* FOTO E NOME */}
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="w-32 shrink-0">
                <ImageUpload 
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                  label="Sua Foto"
                  token={token}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-orange-500">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Seu nome completo"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                />
              </div>
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

            {/* DANGER ZONE */}
            <div className="mt-12 rounded-[2rem] border-2 border-red-50 bg-red-50/20 p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600">
                <AlertTriangle className="h-4 w-4" /> Zona de Perigo
              </h3>
              
              <div className="mt-6 space-y-4">
                {/* Desativar */}
                <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">Pausar minha conta</h4>
                    <p className="text-xs font-medium text-gray-500">Seus dados serão mantidos, mas você terá acesso limitado (Visitante).</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => toast.info('Funcionalidade vinculada ao portal de faturamento Stripe.')}
                    className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-200"
                  >
                    <PauseCircle className="h-4 w-4" /> Pausar
                  </button>
                </div>

                {/* Excluir */}
                <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-sm font-black text-red-600">Excluir permanentemente</h4>
                    <p className="text-xs font-medium text-gray-500">Seus dados pessoais serão anonimizados conforme LGPD. Ação irreversível.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* CONFIRMAÇÃO DE EXCLUSÃO */}
        {showConfirmDelete && (
          <div className="animate-in fade-in fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
            <div className="animate-in zoom-in-95 w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Tem certeza absoluta?</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-gray-500">
                Esta ação irá <span className="font-bold text-red-600">anonimizar permanentemente</span> seus dados pessoais. Seus treinos permanecerão nos clubes, mas não estarão mais vinculados à sua identidade.
              </p>
              
              <div className="mt-8 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Digite sua senha para confirmar</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
                  placeholder="Sua senha de acesso"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAnonymize}
                  disabled={isAnonymizing}
                  className="flex-[1.5] flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                >
                  {isAnonymizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  EXCLUIR CONTA
                </button>
              </div>
            </div>
          </div>
        )}

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
