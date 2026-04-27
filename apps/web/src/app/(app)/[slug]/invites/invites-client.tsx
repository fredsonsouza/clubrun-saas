'use client'

import React, { useState } from 'react'
import { Header } from '@/components/header'
import {
  Copy,
  CheckCircle2,
  Mail,
  Send,
  Link as LinkIcon,
  Clock,
  Trash2,
  User,
  UserPlus,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { createInviteAction, revokeInviteAction } from './actions'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// --- TIPOS ---
type Role = 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'

interface PendingInvite {
  id: string
  email: string
  role: Role
  createdAt: string
}

interface InvitesClientProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
  slug: string
  initialInvites: PendingInvite[]
}

export function InvitesClient({
  user,
  slug,
  initialInvites,
}: InvitesClientProps) {
  const [invites, setInvites] = useState<PendingInvite[]>(initialInvites)
  const [emailToInvite, setEmailToInvite] = useState('')
  const [roleToInvite, setRoleToInvite] = useState<Role>('MEMBER')
  const [isCopied, setIsCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [inviteToRevoke, setInviteToRevoke] = useState<PendingInvite | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  // URL mockada do clube atual
  const clubInviteLink = `https://clubrun.com/join/${slug}-xyz987`

  // Função para copiar o link com feedback visual
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(clubInviteLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar:', err)
    }
  }

  // Função para enviar convite por e-mail (POST /invites/create-invite)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailToInvite) return

    setIsSending(true)

    const formData = new FormData()
    formData.append('slug', slug)
    formData.append('email', emailToInvite)
    formData.append('role', roleToInvite)

    const result = await createInviteAction(formData)

    if (result.success) {
      toast.success(result.message)
      // Nota: O revalidateTag cuidará de atualizar a lista se recarregarmos, 
      // mas para UX imediata podemos adicionar localmente ou forçar refresh
      setInvites([
        {
          id: Math.random().toString(),
          email: emailToInvite,
          role: roleToInvite,
          createdAt: 'Agora mesmo',
        },
        ...invites,
      ])
      setEmailToInvite('')
    } else {
      toast.error(result.message)
    }

    setIsSending(false)
  }

  // Função para revogar convite (DELETE /invites/revoke-invite)
  const handleRevokeInvite = async () => {
    if (!inviteToRevoke) return

    setIsRevoking(true)
    const result = await revokeInviteAction({
      slug,
      inviteId: inviteToRevoke.id,
    })

    if (result.success) {
      toast.success(result.message)
      setInvites(invites.filter((inv) => inv.id !== inviteToRevoke.id))
      setInviteToRevoke(null)
    } else {
      toast.error(result.message)
    }

    setIsRevoking(false)
  }

  // Componente visual para o Cargo no Convite
  const RoleBadge = ({ role }: { role: Role }) => {
    if (role === 'MANAGER' || role === 'ADMIN' || role === 'OWNER')
      return (
        <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
          <User className="h-3 w-3" /> Administrador
        </span>
      )
    return (
      <span className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
        <UserPlus className="h-3 w-3" /> Atleta
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        {/* CABEÇALHO DA PÁGINA */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
            Convites do Clube
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Expanda o seu pelotão partilhando o link ou enviando convites
            diretos.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          {/* COLUNA ESQUERDA: Ações de Convite (Gerar Link & Form de E-mail) */}
          <div className="space-y-6 md:col-span-5">
            {/* CARTÃO 1: Link Público (Para WhatsApp/Grupos) */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-500/5 blur-2xl" />

              <div className="relative z-10 mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">
                    Link de Convite
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    Apenas para Atletas (Members)
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1.5">
                <input
                  type="text"
                  readOnly
                  value={clubInviteLink}
                  className="flex-1 truncate bg-transparent px-3 text-sm font-medium text-gray-600 outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition-all ${isCopied ? 'bg-green-50 text-green-600' : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:text-orange-500'}`}
                  title="Copiar Link"
                >
                  {isCopied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* CARTÃO 2: Convite Direto por E-mail (Para Admins ou Convites Fechados) */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">
                    Convite por E-mail
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    Defina o nível de acesso
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    E-mail do Atleta
                  </label>
                  <input
                    type="email"
                    required
                    value={emailToInvite}
                    onChange={(e) => setEmailToInvite(e.target.value)}
                    placeholder="atleta@exemplo.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Cargo
                  </label>
                  <div className="relative">
                    <select
                      value={roleToInvite}
                      onChange={(e) => setRoleToInvite(e.target.value as Role)}
                      className="cursor-pointer w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                    >
                      <option value="MEMBER">Atleta (Membro Comum)</option>
                      <option value="MANAGER">
                        Administrador (Treinador/Staff)
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending || !emailToInvite}
                  className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white transition-colors hover:bg-gray-800 active:scale-95 disabled:opacity-70"
                >
                  {isSending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Enviar Convite
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: Lista de Pendentes */}
          <div className="md:col-span-7">
            <div className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Clock className="h-5 w-5 text-orange-500" /> Pendentes
                </h3>
                <span className="rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600">
                  {invites.length}
                </span>
              </div>

              {invites.length > 0 ? (
                <div className="flex-1 divide-y divide-gray-50 overflow-y-auto">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="group flex items-center justify-between p-5 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="mb-1 text-sm font-bold text-gray-900">
                          {invite.email}
                        </p>
                        <div className="flex items-center gap-3">
                          <RoleBadge role={invite.role} />
                          <span className="text-xs font-medium text-gray-400">
                            {invite.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Botão de Revogar (Revela-se no hover em desktop) */}
                      <button
                        onClick={() => setInviteToRevoke(invite)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 opacity-100 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 md:opacity-0"
                        title="Revogar Convite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mb-1 text-lg font-extrabold text-gray-900">
                    Nenhum convite pendente
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    Todos os atletas convidados já aceitaram e entraram no
                    clube.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE REVOGAÇÃO */}
        <Dialog open={!!inviteToRevoke} onOpenChange={(open) => !open && setInviteToRevoke(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                Revogar Convite
              </DialogTitle>
              <DialogDescription className="pt-4 text-base">
                Tem certeza que deseja cancelar o convite para <span className="font-black text-gray-900">{inviteToRevoke?.email}</span>?
              </DialogDescription>
              <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">
                O link enviado por e-mail deixará de funcionar imediatamente. O atleta precisará de um novo convite para se juntar ao clube.
              </p>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-3">
              <button
                onClick={() => setInviteToRevoke(null)}
                className="cursor-pointer flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeInvite}
                disabled={isRevoking}
                className="cursor-pointer flex-[1.5] rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isRevoking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    CANCELANDO...
                  </div>
                ) : (
                  'CONFIRMAR CANCELAMENTO'
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
