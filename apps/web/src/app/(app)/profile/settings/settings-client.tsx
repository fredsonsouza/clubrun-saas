'use client'

import { Header } from '@/components/header'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Key,
  Loader2,
  Lock,
  PauseCircle,
  Save,
  Settings,
  Shield,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProfileSettingsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    hasPassword: boolean
  }
}

export function ProfileSettingsClient({ user }: ProfileSettingsClientProps) {
  const router = useRouter()
  const [isAnonymizing, setIsAnonymizing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  // Estados para Alteração de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handleAnonymize = async () => {
    if (!confirmPassword) {
      toast.error('Por favor, digite sua senha para confirmar.')
      return
    }

    setIsAnonymizing(true)
    const { anonymizeAccountAction } = await import('../actions')

    const result = await anonymizeAccountAction(confirmPassword)

    if (result?.success) {
      toast.success(result.message)
      router.push('/')
      router.refresh()
    } else {
      toast.error(
        result?.message || 'Erro ao processar exclusão. Tente novamente.'
      )
      setIsAnonymizing(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('As novas senhas não coincidem.')
      return
    }

    if (passwordForm.new.length < 12) {
      toast.error('A nova senha deve ter no mínimo 12 caracteres.')
      return
    }

    setIsUpdatingPassword(true)
    const { updatePasswordAction } = await import('../actions')

    const result = await updatePasswordAction(
      passwordForm.current,
      passwordForm.new
    )

    if (result.success) {
      toast.success(result.message)
      setShowPasswordModal(false)
      setPasswordForm({ current: '', new: '', confirm: '' })
    } else {
      toast.error(result.message)
    }
    setIsUpdatingPassword(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <Header user={user} />

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-2 font-bold text-gray-500 text-sm transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Perfil
          </Link>
        </div>

        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:p-12">
          <header className="mb-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Settings className="h-6 w-6" />
              </div>
              <h1 className="font-black text-3xl text-gray-900 tracking-tight">
                Minha Conta
              </h1>
            </div>
            <p className="mt-4 font-medium text-base text-gray-500">
              Gerencie as configurações de segurança, privacidade e o
              encerramento da sua conta.
            </p>
          </header>

          <div className="space-y-12">
            {/* SEGURANÇA */}
            {user.hasPassword === true ? (
              <section className="space-y-6">
                <h2 className="flex items-center gap-2 font-black text-orange-500 text-xs uppercase tracking-widest">
                  <Shield className="h-4 w-4" /> Segurança
                </h2>

                <div className="rounded-3xl border border-gray-50 bg-gray-50/30 p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">
                        Senha de Acesso
                      </h4>
                      <p className="font-medium text-gray-500 text-xs">
                        Mantenha sua conta protegida com uma senha forte.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="rounded-xl bg-white px-5 py-2.5 font-bold text-gray-700 text-xs shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                    >
                      Alterar Senha
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                <h2 className="flex items-center gap-2 font-black text-orange-500 text-xs uppercase tracking-widest">
                  <Shield className="h-4 w-4" /> Segurança
                </h2>

                <div className="rounded-3xl border border-blue-50 bg-blue-50/20 p-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">
                        Autenticação via Google
                      </h4>
                      <p className="mt-1 font-medium text-gray-500 text-xs leading-relaxed">
                        Sua conta está protegida pela autenticação do Google.
                        Você não possui uma senha local no Club Run.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ASSINATURA */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-2 font-black text-orange-500 text-xs uppercase tracking-widest">
                <CreditCard className="h-4 w-4" /> Assinatura & Planos
              </h2>

              <div className="rounded-4xl border border-orange-100 bg-orange-50/30 p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-orange-500 px-3 py-1 font-black text-[10px] text-white uppercase">
                        Plano Premium
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        Ativo
                      </span>
                    </div>
                    <h4 className="font-black text-gray-900 text-xl">
                      Elite Performance
                    </h4>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 font-medium text-gray-600 text-xs">
                        <Check className="h-3.5 w-3.5 text-green-500" /> Acesso
                        a rankings ilimitados
                      </li>
                      <li className="flex items-center gap-2 font-medium text-gray-600 text-xs">
                        <Check className="h-3.5 w-3.5 text-green-500" />{' '}
                        Prescrições de treino personalizadas
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-black text-orange-600 text-sm shadow-sm transition-all hover:bg-orange-50 active:scale-95"
                  >
                    Gerenciar Plano
                  </Link>
                </div>
              </div>
            </section>

            {/* DANGER ZONE */}
            <section className="space-y-6 pt-6">
              <h2 className="flex items-center gap-2 font-black text-red-600 text-xs uppercase tracking-widest">
                <AlertTriangle className="h-4 w-4" /> Zona de Perigo
              </h2>

              <div className="space-y-4">
                {/* Desativar */}
                <div className="group flex flex-col justify-between gap-4 rounded-3xl border-2 border-transparent bg-gray-50/50 p-6 transition-all hover:border-gray-100 hover:bg-white hover:shadow-gray-900/5 hover:shadow-xl sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-200">
                      <PauseCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-gray-900">
                        Pausar minha conta
                      </h4>
                      <p className="mt-1 max-w-sm font-medium text-gray-500 text-sm leading-relaxed">
                        Seus dados serão mantidos, mas você perderá acesso às
                        áreas exclusivas de membros.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        'Funcionalidade vinculada ao portal de faturamento Stripe.'
                      )
                    }
                    className="rounded-xl bg-white px-6 py-3 font-bold text-gray-700 text-sm shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                  >
                    Pausar Agora
                  </button>
                </div>

                {/* Excluir */}
                <div className="group flex flex-col justify-between gap-4 rounded-3xl border-2 border-transparent bg-red-50/30 p-6 transition-all hover:border-red-100 hover:bg-white hover:shadow-red-900/5 hover:shadow-xl sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                      <Trash2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-red-600">
                        Excluir permanentemente
                      </h4>
                      <p className="mt-1 max-w-sm font-medium text-gray-500 text-sm leading-relaxed">
                        Seus dados pessoais serão anonimizados conforme LGPD.
                        Esta ação é irreversível.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="rounded-xl bg-red-600 px-6 py-3 font-black text-sm text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
                  >
                    Excluir Conta
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
        {showConfirmDelete && (
          <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md">
            <div className="zoom-in-95 w-full max-w-md animate-in rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl text-gray-900 tracking-tight">
                Tem certeza absoluta?
              </h3>
              <p className="mt-4 font-medium text-gray-500 text-sm leading-relaxed">
                Esta ação irá{' '}
                <span className="font-bold text-red-600">
                  anonimizar permanentemente
                </span>{' '}
                seus dados pessoais. Seus treinos permanecerão nos clubes, mas
                não estarão mais vinculados à sua identidade.
              </p>

              <div className="mt-8 space-y-2">
                <label
                  htmlFor="confirm-delete-password"
                  className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                >
                  Digite sua senha para confirmar
                </label>
                <div className="relative">
                  <input
                    id="confirm-delete-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 pr-12 font-bold text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
                    placeholder="Sua senha de acesso"
                  />
                  <div className="-translate-y-1/2 absolute top-1/2 right-4 text-gray-300">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 rounded-2xl bg-gray-100 py-4 font-bold text-gray-600 text-sm transition-all hover:bg-gray-200 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAnonymize}
                  disabled={isAnonymizing}
                  className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-black text-sm text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                >
                  {isAnonymizing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  CONFIRMAR EXCLUSÃO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE ALTERAÇÃO DE SENHA */}
        {showPasswordModal && (
          <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md">
            <div className="zoom-in-95 w-full max-w-md animate-in rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <header className="mb-8 flex items-center justify-between">
                <h3 className="flex items-center gap-3 font-black text-2xl text-gray-900 tracking-tight">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Key className="h-5 w-5" />
                  </div>
                  Alterar Senha
                </h3>
              </header>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="current-password"
                    className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                  >
                    Senha Atual
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    required
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    placeholder="••••••••"
                  />
                </div>

                <div className="my-2 h-px bg-gray-100" />

                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                  >
                    Nova Senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new: e.target.value })
                    }
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Mínimo 12 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-new-password"
                    className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    required
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 font-bold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Repita a nova senha"
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 rounded-2xl bg-gray-100 py-4 font-bold text-gray-600 text-sm transition-all hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-black text-sm text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    SALVAR SENHA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
