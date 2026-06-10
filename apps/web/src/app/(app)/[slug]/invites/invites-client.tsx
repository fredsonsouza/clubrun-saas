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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { getInviteLink } from '@/http/get-invite-link'
import { 
  createInviteAction, 
  revokeInviteAction,
  updateMemberStatusAction 
} from './actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// --- TIPOS ---
type Role = 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'

interface PendingInvite {
  id: string
  email: string
  role: Role
  createdAt: string
  author?: string
}

interface PendingMember {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

interface InvitesClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  slug: string
  initialInvites: PendingInvite[]
  initialPendingMembers: PendingMember[]
}

export function InvitesClient({
  user,
  slug,
  initialInvites,
  initialPendingMembers,
}: InvitesClientProps) {
  const [invites, setInvites] = useState<PendingInvite[]>(initialInvites)
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>(initialPendingMembers)
  const [emailToInvite, setEmailToInvite] = useState('')
  const [roleToInvite, setRoleToInvite] = useState<Role>('ATHLETE')
  const [isCopied, setIsCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [inviteToRevoke, setInviteToRevoke] = useState<PendingInvite | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  
  const [memberToProcess, setMemberToProcess] = useState<{ member: PendingMember, action: 'ACTIVE' | 'INACTIVE' } | null>(null)
  const [isProcessingMember, setIsProcessingMember] = useState(false)

  // Efeito para buscar o link real
  React.useEffect(() => {
    async function fetchLink() {
      try {
        const { inviteLink: link } = await getInviteLink(slug)
        setInviteLink(link)
      } catch (error) {
        console.error('Falha ao buscar link de convite', error)
      }
    }
    fetchLink()
  }, [slug])

  const handleCopyLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar:', err)
    }
  }


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
      setInvites([{
        id: Math.random().toString(),
        email: emailToInvite,
        role: roleToInvite,
        createdAt: 'Agora mesmo',
        author: user.name || 'Você'
      }, ...invites])
      setEmailToInvite('')
    } else {
      toast.error(result.message)
    }
    setIsSending(false)
  }

  const handleRevokeInvite = async () => {
    if (!inviteToRevoke) return
    setIsRevoking(true)
    const result = await revokeInviteAction({ slug, inviteId: inviteToRevoke.id })

    if (result.success) {
      toast.success(result.message)
      setInvites(invites.filter((inv) => inv.id !== inviteToRevoke.id))
      setInviteToRevoke(null)
    } else {
      toast.error(result.message)
    }
    setIsRevoking(false)
  }

  const handleUpdateMemberStatus = async () => {
    if (!memberToProcess) return
    setIsProcessingMember(true)
    const { member, action } = memberToProcess

    const result = await updateMemberStatusAction({
      slug,
      memberId: member.id,
      status: action,
    })

    if (result.success) {
      toast.success(result.message)
      setPendingMembers(pendingMembers.filter((m) => m.id !== member.id))
      setMemberToProcess(null)
    } else {
      toast.error(result.message)
    }
    setIsProcessingMember(false)
  }

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
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
              Gestão de Convites & Membros
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Acompanhe as solicitações de entrada e envie novos convites.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            {/* LINK PÚBLICO */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="relative z-10 mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Link de Convite</h3>
                  <p className="text-xs font-medium text-gray-500">Apenas para Atletas (Members)</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1.5">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink || 'Gerando link...'}
                    className="flex-1 truncate bg-transparent px-3 text-sm font-medium text-gray-600 outline-none"
                  />
                  <button onClick={handleCopyLink} className={`cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition-all ${isCopied ? 'bg-green-50 text-green-600' : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}>
                    {isCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <a
                  href={inviteLink ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Fala, corredor! 🏃‍♂️\n\nEstou te convidando para entrar no nosso pelotão no *ClubRun*. Clique no link abaixo para participar:\n\n${inviteLink}`
                  )}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#128C7E] ${!inviteLink ? 'pointer-events-none opacity-50' : ''}`}
                >
                  PARTILHAR VIA WHATSAPP
                </a>
              </div>
            </div>

            {/* CONVITE E-MAIL */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Convite por E-mail</h3>
                  <p className="text-xs font-medium text-gray-500">Defina o nível de acesso</p>
                </div>
              </div>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <input
                  type="email"
                  required
                  value={emailToInvite}
                  onChange={(e) => setEmailToInvite(e.target.value)}
                  placeholder="atleta@exemplo.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-orange-500 focus:outline-none"
                />
                <select
                  value={roleToInvite}
                  onChange={(e) => setRoleToInvite(e.target.value as Role)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="ATHLETE">Atleta (Membro Comum)</option>
                  <option value="COACH">Treinador (Staff Técnico)</option>
                  <option value="MANAGER">Gestor (Staff Administrativo)</option>
                  <option value="ADMIN">Administrador (Acesso Geral)</option>
                  <option value="BILLING">Financeiro (Gestão de Contas)</option>
                </select>
                <button type="submit" disabled={isSending || !emailToInvite} className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white hover:bg-gray-800 disabled:opacity-70">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Enviar Convite</>}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-8 md:col-span-7">
            {/* SOLICITAÇÕES DE ENTRADA */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-orange-50/30 px-6 py-5">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <UserPlus className="h-5 w-5 text-orange-600" /> Solicitações de Entrada
                </h3>
                <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                  {pendingMembers.length}
                </span>
              </div>
              {pendingMembers.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {pendingMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-gray-100">
                          <AvatarImage src={member.avatarUrl || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          <p className="text-xs font-medium text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setMemberToProcess({ member, action: 'INACTIVE' })} className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-600">Recusar</button>
                        <button onClick={() => setMemberToProcess({ member, action: 'ACTIVE' })} className="cursor-pointer rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600">Aprovar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-sm font-medium text-gray-400 italic">Nenhuma solicitação pendente.</div>
              )}
            </div>

            {/* CONVITES POR E-MAIL */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Clock className="h-5 w-5 text-orange-500" /> Convites por E-mail (Enviados)
                </h3>
                <span className="rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600">{invites.length}</span>
              </div>
              {invites.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {invites.map((invite) => (
                    <div key={invite.id} className="group flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="mb-1 text-sm font-bold text-gray-900">{invite.email}</p>
                        <div className="flex items-center gap-3">
                          <RoleBadge role={invite.role} />
                          <span className="text-xs font-medium text-gray-400">{invite.createdAt}</span>
                        </div>
                      </div>
                      <button onClick={() => setInviteToRevoke(invite)} className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 md:opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-sm font-medium text-gray-400 italic">Nenhum convite por e-mail pendente.</div>
              )}
            </div>
          </div>
        </div>

        {/* MODAIS */}
        <Dialog open={!!memberToProcess} onOpenChange={(open) => !open && setMemberToProcess(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-3 ${memberToProcess?.action === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                {memberToProcess?.action === 'ACTIVE' ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                {memberToProcess?.action === 'ACTIVE' ? 'Aprovar Membro' : 'Recusar Solicitação'}
              </DialogTitle>
              <DialogDescription className="pt-4 text-base">
                Você está prestes a {memberToProcess?.action === 'ACTIVE' ? 'aprovar' : 'recusar'} a entrada de <span className="font-black text-gray-900">{memberToProcess?.member.name}</span> no clube.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-3">
              <button onClick={() => setMemberToProcess(null)} className="cursor-pointer flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleUpdateMemberStatus} disabled={isProcessingMember} className={`cursor-pointer flex-[1.5] rounded-2xl px-6 py-4 text-sm font-black text-white shadow-lg ${memberToProcess?.action === 'ACTIVE' ? 'bg-green-600 shadow-green-600/20 hover:bg-green-700' : 'bg-red-600 shadow-red-600/20 hover:bg-red-700'}`}>
                {isProcessingMember ? 'PROCESSANDO...' : 'CONFIRMAR'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!inviteToRevoke} onOpenChange={(open) => !open && setInviteToRevoke(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6" /> Revogar Convite
              </DialogTitle>
              <DialogDescription className="pt-4 text-base">
                Tem certeza que deseja cancelar o convite para <span className="font-black text-gray-900">{inviteToRevoke?.email}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-3">
              <button onClick={() => setInviteToRevoke(null)} className="cursor-pointer flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleRevokeInvite} disabled={isRevoking} className="cursor-pointer flex-[1.5] rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 hover:bg-red-700">
                {isRevoking ? 'CANCELANDO...' : 'CONFIRMAR CANCELAMENTO'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
