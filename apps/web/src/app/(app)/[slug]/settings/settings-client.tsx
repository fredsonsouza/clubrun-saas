'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import {
  Settings,
  CreditCard,
  ShieldAlert,
  AlertTriangle,
  Save,
  Globe,
  AlignLeft,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  Zap,
  Loader2,
  ChevronDown,
  UserCog,
  RefreshCcw,
  LayoutDashboard,
  BarChart,
  Users,
  Activity,
  Compass,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  updateClubAction,
  shutdownClubAction,
  transferOwnershipAction,
  activateBillingAction,
} from './actions'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { ImageUpload } from '@/components/image-upload'

interface Member {
  id: string
  userId: string
  role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  name: string | null
  email: string
  avatarUrl: string | null
}

interface SettingsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  club: {
    name: string
    slug: string
    description: string | null
    avatarUrl: string | null
    bannerUrl: string | null
    cnpj: string | null
    city: string | null
    state: string | null
    status: 'ACTIVE' | 'DEACTIVATED'
  }
  userRole: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  billing: {
    seats: {
      amount: number
      unit: number
      price: number
    }
    total: number
  }
  members: Member[]
  metrics: {
    activeMembers: number
    inactiveMembers: number
    pendingInvites: number
    totalDistanceMonth: number
    totalWorkoutsMonth: number
  }
  token?: string
}

// --- MOCKS DE FATURAÇÃO ---
const BILLING_INFO = {
  plan: 'Plano Pro',
  price: 'R$ 99,00',
  cycle: 'mensal',
  nextBillingDate: '01 de Maio de 2026',
  membersUsed: 84,
  membersLimit: 100,
  paymentMethod: { brand: 'Visa', last4: '4242', expiry: '12/28' },
}

const INVOICES = [
  { id: 'inv-002', date: '01 Abr 2026', amount: 'R$ 99,00', status: 'PAID' },
  { id: 'inv-001', date: '01 Mar 2026', amount: 'R$ 99,00', status: 'PAID' },
]

export function SettingsClient({
  user,
  club,
  userRole,
  members,
  billing,
  metrics,
  token,
}: SettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'general' | 'billing' | 'danger'
  >('overview')
  const [name, setName] = useState(club.name)
  const [description, setDescription] = useState(club.description || '')
  const [cnpj, setCnpj] = useState(club.cnpj || '')
  const [city, setCity] = useState(club.city || '')
  const [state, setState] = useState(club.state || '')
  const [avatarUrl, setAvatarUrl] = useState(club.avatarUrl || '')
  const [bannerUrl, setBannerUrl] = useState(club.bannerUrl || '')

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState('')
  const [leaveAfterTransfer, setLeaveAfterTransfer] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  const handleActivateBilling = async () => {
    setIsActivating(true)
    const result = await activateBillingAction(club.slug)

    if (result.success) {
      toast.success(result.message)
      // Recarrega para limpar as travas
      window.location.reload()
    } else {
      toast.error(result.message)
    }
    setIsActivating(false)
  }

  const admins = members.filter(
    (m) =>
      (m.role === 'ADMIN' || m.role === 'MANAGER') && m.email !== user.email
  )

  // --- LÓGICA IBGE ---
  const [ufs, setUfs] = useState<{ id: number; sigla: string; nome: string }[]>(
    []
  )
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([])
  const [isLoadingUfs, setIsLoadingUfs] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Busca Estados (UFs) ao montar
  useEffect(() => {
    async function loadUfs() {
      try {
        setIsLoadingUfs(true)
        const response = await fetch(
          'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
        )
        const data = await response.json()
        setUfs(data)
      } catch (error) {
        console.error('Erro ao carregar UFs:', error)
      } finally {
        setIsLoadingUfs(false)
      }
    }
    loadUfs()
  }, [])

  // Busca Cidades ao mudar o Estado
  // Se o 'state' for uma sigla (ex: RR), buscamos cidades
  // Se for nome completo (ex: Roraima), precisamos achar a sigla
  useEffect(() => {
    async function loadCities() {
      if (!state) {
        setCities([])
        return
      }

      // Tenta achar a sigla se o state for o nome
      const uf = ufs.find((u) => u.sigla === state || u.nome === state)
      if (!uf) return

      try {
        setIsLoadingCities(true)
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf.sigla}/municipios?orderBy=nome`
        )
        const data = await response.json()
        setCities(data)
      } catch (error) {
        console.error('Erro ao carregar cidades:', error)
      } finally {
        setIsLoadingCities(false)
      }
    }

    if (ufs.length > 0) {
      loadCities()
    }
  }, [state, ufs])

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', club.slug)
    formData.append('description', description)
    formData.append('cnpj', cnpj)
    formData.append('city', city)
    formData.append('state', state)
    formData.append('avatarUrl', avatarUrl)
    formData.append('bannerUrl', bannerUrl)

    const result = await updateClubAction(formData)

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }

    setIsSaving(false)
  }

  const handleTransferOwnership = async () => {
    if (!transferTargetId) return

    setIsTransferring(true)
    const result = await transferOwnershipAction({
      slug: club.slug,
      transferToUserId: transferTargetId,
      leaveAfterTransfer,
    })

    if (result.success) {
      toast.success(result.message)
      setIsTransferModalOpen(false)
      
      if (leaveAfterTransfer) {
        router.push('/explore')
      } else {
        window.location.reload()
      }
    } else {
      toast.error(result.message)
    }
    setIsTransferring(false)
  }

  const handleDeleteClub = async () => {
    if (deleteConfirmName !== club.name) {
      toast.error('O nome do clube digitado está incorreto.')
      return
    }

    setIsDeleting(true)
    const result = await shutdownClubAction(club.slug)

    if (result.success) {
      toast.success(result.message)
      router.push('/explore')
    } else {
      toast.error(result.message)
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const isOwner = userRole === 'OWNER'
  const isBillingPending = isOwner && club.subscriptionStatus === 'PENDING_UPDATE'

  useEffect(() => {
    if (isBillingPending) {
      setActiveTab('billing')
    } else {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      if (tabParam === 'billing') {
        setActiveTab('billing')
      }
    }
  }, [isBillingPending])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {isBillingPending && (
          <div className="mb-8 flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm ring-1 ring-red-200">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-red-900">Ação Necessária: Atualize o Faturamento</h3>
              <p className="text-sm font-medium text-red-700">
                Você é o novo dono deste clube. Para continuar gerenciando o pelotão e permitir que os membros acessem o sistema, você deve cadastrar um método de pagamento válido.
              </p>
            </div>
          </div>
        )}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
              Painel de Gestão
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Controle total sobre o seu pelotão: métricas, configurações e
              faturação.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
            <ShieldCheck className="h-4 w-4" />
            NÍVEL DE ACESSO:{' '}
            <span className="uppercase">
              {userRole === 'OWNER'
                ? 'Proprietário'
                : userRole === 'ADMIN'
                  ? 'Administrador'
                  : 'Gestor'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full shrink-0 space-y-2 lg:w-72">
            <button
              onClick={() => !isBillingPending && setActiveTab('overview')}
              disabled={isBillingPending}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-orange-500 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} ${isBillingPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Visão Geral
              {activeTab === 'overview' && (
                <ArrowRight className="animate-in slide-in-from-left-2 ml-auto h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => !isBillingPending && setActiveTab('general')}
              disabled={isBillingPending}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-orange-500 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} ${isBillingPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Settings className="h-4 w-4" />
              Informações Básicas
              {activeTab === 'general' && (
                <ArrowRight className="animate-in slide-in-from-left-2 ml-auto h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-white text-orange-500 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} ${isBillingPending ? 'ring-2 ring-red-200 bg-red-50' : ''}`}
            >
              <CreditCard className="h-4 w-4" />
              Faturamento & Plano
              {activeTab === 'billing' && (
                <ArrowRight className="animate-in slide-in-from-left-2 ml-auto h-4 w-4" />
              )}
            </button>

            {userRole === 'OWNER' && (
              <>
                <div className="py-4">
                  <div className="h-px bg-gray-200" />
                </div>
                <button
                  onClick={() => !isBillingPending && setActiveTab('danger')}
                  disabled={isBillingPending}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all ${activeTab === 'danger' ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100' : 'text-red-500/70 hover:bg-red-50 hover:text-red-600'} ${isBillingPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Zona de Perigo
                  {activeTab === 'danger' && (
                    <ArrowRight className="animate-in slide-in-from-left-2 ml-auto h-4 w-4" />
                  )}
                </button>
              </>
            )}
          </aside>

          <div className="w-full flex-1">
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  <div className="rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                      Membros Ativos
                    </p>
                    <p className="mt-1 text-4xl font-black text-gray-900">
                      {metrics.activeMembers}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
                      <span className="text-orange-500">
                        {metrics.inactiveMembers} inativos
                      </span>
                    </div>
                  </div>

                  <div className="rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                      <Activity className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                      Treinos no Mês
                    </p>
                    <p className="mt-1 text-4xl font-black text-gray-900">
                      {metrics.totalWorkoutsMonth}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-500">
                      Volume total da equipe
                    </div>
                  </div>

                  <div className="rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                      <Compass className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                      Distância Total (Mês)
                    </p>
                    <p className="mt-1 text-4xl font-black text-gray-900">
                      {metrics.totalDistanceMonth > 1000
                        ? `${(metrics.totalDistanceMonth / 1000).toFixed(1)} km`
                        : `${metrics.totalDistanceMonth} m`}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500">
                      Quilometragem acumulada
                    </div>
                  </div>

                  <div className="rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                      Convites Pendentes
                    </p>
                    <p className="mt-1 text-4xl font-black text-gray-900">
                      {metrics.pendingInvites}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-500">
                      <a
                        href={`/${club.slug}/invites`}
                        className="hover:underline"
                      >
                        Gerenciar convites →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'general' && (
              <div className="animate-in fade-in slide-in-from-right-4 rounded-4xl border border-gray-100 bg-white p-6 shadow-sm duration-300 sm:p-10">
                <div className="mb-8">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Informações do Clube
                  </h2>
                  <p className="text-sm font-medium text-gray-400">
                    Edite os detalhes básicos e a identidade visual do seu
                    pelotão.
                  </p>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-10">
                  {/* Identidade Visual */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <ImageUpload
                      label="Logo do Clube"
                      value={avatarUrl}
                      onChange={setAvatarUrl}
                      aspectRatio="square"
                      token={token}
                    />
                    <ImageUpload
                      label="Banner de Capa"
                      value={bannerUrl}
                      onChange={setBannerUrl}
                      aspectRatio="video"
                      token={token}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        <Trophy className="h-3.5 w-3.5 text-orange-500" /> Nome
                        do Clube
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Macuxi Runners"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />{' '}
                        CNPJ (Opcional)
                      </label>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        <Globe className="h-3.5 w-3.5 text-orange-500" /> Estado
                      </label>
                      <select
                        value={
                          ufs.find((u) => u.nome === state || u.sigla === state)
                            ?.sigla || ''
                        }
                        onChange={(e) => {
                          const uf = ufs.find((u) => u.sigla === e.target.value)
                          setState(uf ? uf.nome : '')
                          setCity('') // Reseta cidade ao mudar estado
                        }}
                        disabled={isLoadingUfs}
                        className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">Selecione o Estado</option>
                        {ufs.map((u) => (
                          <option key={u.id} value={u.sigla}>
                            {u.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        <Globe className="h-3.5 w-3.5 text-orange-500" /> Cidade
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={isLoadingCities || !state}
                        className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">
                          {isLoadingCities
                            ? 'Carregando cidades...'
                            : 'Selecione a Cidade'}
                        </option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.nome}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                      <AlignLeft className="h-3.5 w-3.5 text-orange-500" />{' '}
                      Descrição do Clube
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Fale um pouco sobre a história e os objetivos do clube..."
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-5 font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSaving || !name}
                      className="flex h-14 cursor-pointer items-center gap-2 rounded-2xl bg-gray-900 px-8 font-bold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                {/* Resumo do Plano */}
                <div className="relative overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-sm">
                  <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl" />
                  <div className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
                    <div className="relative z-10">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-md bg-orange-100 px-2.5 py-1 text-[10px] font-black tracking-widest text-orange-600 uppercase">
                          <Zap className="h-3 w-3" /> Plano Pro
                        </span>
                        {isBillingPending ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <AlertTriangle className="h-3 w-3" /> Aguardando Pagamento
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-500">
                            <CheckCircle2 className="h-3 w-3" /> Ativo
                          </span>
                        )}
                      </div>
                      <h2 className="text-4xl font-black tracking-tight text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(billing.total)}
                        <span className="text-base font-bold tracking-normal text-gray-400">
                          / mês
                        </span>
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={isBillingPending ? handleActivateBilling : undefined}
                        disabled={isActivating}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50"
                      >
                        {isActivating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isBillingPending ? (
                          'Assinar Agora'
                        ) : (
                          'Gerenciar Assinatura'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 bg-gray-50 p-6 sm:px-10">
                    <div className="mb-3 flex items-end justify-between">
                      <span className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                        Membros no Pelotão
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {billing.seats.amount}{' '}
                        <span className="font-bold text-gray-400">/ ∞</span>
                      </span>
                    </div>
                    <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-orange-500 shadow-sm transition-all duration-1000"
                        style={{
                          width: `${Math.min((billing.seats.amount / 50) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed font-medium text-gray-500">
                       Sua assinatura cobre {billing.seats.amount} membros
                      ativos. O valor unitário é de{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(billing.seats.unit)}{' '}
                      por vaga.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                      <CreditCard className="h-5 w-5 text-gray-400" /> Método de
                      Pagamento
                    </h3>
                    <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      {isBillingPending ? (
                        <div className="flex items-center gap-4 text-gray-400">
                           <div className="flex h-10 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-[10px] font-black italic">
                            CARD
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase">Nenhum cartão</p>
                            <p className="text-xs font-medium">Cadastre para ativar</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-blue-900 text-[10px] font-black text-white italic shadow-sm">
                            VISA
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 uppercase">
                              Termina em {BILLING_INFO.paymentMethod.last4}
                            </p>
                            <p className="text-xs font-medium text-gray-400">
                              Expira a {BILLING_INFO.paymentMethod.expiry}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={isBillingPending ? handleActivateBilling : undefined}
                      disabled={isActivating}
                      className="cursor-pointer text-sm font-bold text-orange-500 transition-colors hover:text-orange-600 disabled:opacity-50"
                    >
                      {isActivating ? 'Processando...' : isBillingPending ? 'Cadastrar Cartão de Crédito' : 'Atualizar cartão de crédito'}
                    </button>
                  </div>

                  <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-gray-900">
                      <AlignLeft className="h-5 w-5 text-gray-400" /> Histórico
                      de Faturas
                    </h3>
                    <div className="space-y-3">
                      {INVOICES.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="group flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-gray-50"
                        >
                          <div>
                            <p className="mb-1 text-sm font-bold text-gray-900">
                              {invoice.amount}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                              <span>{invoice.date}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> PAGO
                              </span>
                            </div>
                          </div>
                          <button className="cursor-pointer rounded-xl p-3 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-orange-50 hover:text-orange-500">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (isOwner || userRole === 'ADMIN') && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                <div className="flex flex-col justify-between gap-4 rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-10">
                  <div className="max-w-md">
                    <h3 className="font-extrabold text-gray-900">
                      Transferir Propriedade
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      Ao transferir a propriedade, deixará de ter controlo total
                      sobre o clube. O novo proprietário terá permissão total
                      para gerir membros e definições.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                  >
                    <RefreshCcw className="h-4 w-4" /> Transferir para
                    Administrador
                  </button>
                </div>

                <Dialog
                  open={isTransferModalOpen}
                  onOpenChange={setIsTransferModalOpen}
                >
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-orange-600">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        Transferir Propriedade
                      </DialogTitle>
                      <DialogDescription className="pt-4 text-base">
                        Escolha um administrador para assumir o controle total
                        do{' '}
                        <span className="font-black text-gray-900">
                          {club.name}
                        </span>
                        .
                      </DialogDescription>
                      <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs font-medium text-amber-800">
                        <strong>Importante:</strong> Após a transferência, você
                        passará a ter o cargo de Atleta e não poderá mais
                        excluir o clube ou transferi-lo de volta sem a permissão
                        do novo dono. O novo dono terá 48h para atualizar os dados de pagamento.
                      </div>
                    </DialogHeader>

                    <div className="py-6">
                      <label className="mb-2 block text-xs font-black tracking-widest text-gray-400 uppercase">
                        Selecionar Novo Proprietário
                      </label>
                      {admins.length > 0 ? (
                        <div className="space-y-3">
                          {admins.map((admin) => (
                            <label
                              key={admin.id}
                              className="relative block cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="transferTarget"
                                value={admin.userId}
                                className="peer sr-only"
                                onChange={(e) =>
                                  setTransferTargetId(e.target.value)
                                }
                              />
                              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all peer-checked:border-orange-500 peer-checked:bg-white peer-checked:ring-4 peer-checked:ring-orange-500/10">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                                  {admin.avatarUrl ? (
                                    <img
                                      src={admin.avatarUrl}
                                      alt={admin.name || ''}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center font-black text-gray-400">
                                      {admin.name?.[0] || 'A'}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-black text-gray-900">
                                    {admin.name || admin.email}
                                  </p>
                                  <p className="text-xs font-medium text-gray-500 lowercase">
                                    {admin.role}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-gray-100 p-8 text-center">
                          <UserCog className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                          <p className="text-sm font-medium text-gray-400">
                            Nenhum outro administrador disponível para
                            transferência.
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <input
                          type="checkbox"
                          id="leaveAfterTransfer"
                          checked={leaveAfterTransfer}
                          onChange={(e) => setLeaveAfterTransfer(e.target.checked)}
                          className="h-5 w-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor="leaveAfterTransfer" className="text-sm font-bold text-gray-700">
                          Sair do clube após a transferência
                        </label>
                      </div>
                    </div>

                    <DialogFooter className="mt-2 gap-3">
                      <button
                        onClick={() => setIsTransferModalOpen(false)}
                        className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleTransferOwnership}
                        disabled={!transferTargetId || isTransferring}
                        className="flex-[1.5] cursor-pointer rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white shadow-lg shadow-gray-900/20 transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50"
                      >
                        {isTransferring ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />A
                            TRANSFERIR...
                          </div>
                        ) : (
                          'CONFIRMAR TRANSFERÊNCIA'
                        )}
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="rounded-4xl border border-red-100 bg-red-50/50 p-6 shadow-sm sm:p-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-red-900">
                      Encerrar Atividades do Clube
                    </h2>
                  </div>
                  <p className="mb-8 max-w-xl text-sm leading-relaxed font-medium text-red-700/80">
                    O clube entrará em estado de "apenas leitura". Novos treinos não poderão ser postados, 
                    mas o histórico de todos os membros será preservado. A assinatura Pro será cancelada imediatamente.
                  </p>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={club.status === 'DEACTIVATED'}
                    className="cursor-pointer rounded-xl bg-red-600 px-8 py-4 font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  >
                    {club.status === 'DEACTIVATED' ? 'Clube já Desativado' : 'Encerrar Atividades Agora'}
                  </button>
                </div>

                {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-red-600">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        Confirmar Encerramento
                      </DialogTitle>
                      <DialogDescription className="pt-4 text-base">
                        O clube ficará visível apenas para histórico. Todos os membros serão notificados para buscar um novo pelotão.
                      </DialogDescription>
                      <p className="mt-4 text-sm font-bold text-gray-500">
                        Para confirmar, digite o nome do clube abaixo:
                        <span className="mt-1 block font-black text-gray-900">
                          "{club.name}"
                        </span>
                      </p>
                    </DialogHeader>
                    <div className="py-4">
                      <input
                        type="text"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        placeholder="Digite o nome do clube aqui..."
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                      />
                    </div>
                    <DialogFooter className="mt-6 gap-3">
                      <button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteClub}
                        disabled={deleteConfirmName !== club.name || isDeleting}
                        className="flex-[1.5] cursor-pointer rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                      >
                        {isDeleting ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />A
                            PROCESSAR...
                          </div>
                        ) : (
                          'CONFIRMAR ENCERRAMENTO GENTIL'
                        )}
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
