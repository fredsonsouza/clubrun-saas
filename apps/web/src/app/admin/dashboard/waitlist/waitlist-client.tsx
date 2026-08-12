'use client'

import { getSystemWaitlistAction } from '@/app/private-actions'
import { AdminHeader } from '@/components/admin-header'
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Mail,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, useTransition } from 'react'

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  createdAt: string
}

interface AdminWaitlistClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  initialWaitlist: WaitlistEntry[]
  initialTotalPages: number
}

export function AdminWaitlistClient({
  user,
  initialWaitlist,
  initialTotalPages,
}: AdminWaitlistClientProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialWaitlist)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  const [isPending, startTransition] = useTransition()

  // Buscar novos registros quando a página mudar
  useEffect(() => {
    if (page === 1) {
      setWaitlist(initialWaitlist)
      setTotalPages(initialTotalPages)
      return
    }

    const controller = new AbortController()

    startTransition(async () => {
      try {
        const result = await getSystemWaitlistAction({
          page,
          limit: 20,
        })
        if (!controller.signal.aborted) {
          setWaitlist(result.waitlist)
          setTotalPages(result.totalPages)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erro ao buscar lista de espera:', error)
        }
      }
    })

    return () => controller.abort()
  }, [page, initialWaitlist, initialTotalPages])

  // Filtragem local baseada na busca por email ou nome
  const filteredWaitlist = waitlist.filter((entry) => {
    const s = search.toLowerCase()
    return (
      entry.email.toLowerCase().includes(s) ||
      entry.name?.toLowerCase().includes(s)
    )
  })

  // Copiar todos os emails no formato CSV para o clipboard
  const handleCopyEmails = () => {
    const emailsList = waitlist.map((entry) => entry.email).join(', ')
    navigator.clipboard.writeText(emailsList)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <AdminHeader user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        {/* CABEÇALHO */}
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-6 flex w-fit items-center gap-2 font-bold text-gray-500 text-xs transition-colors hover:text-orange-500"
            >
              <ArrowLeft className="h-4 w-4" /> VOLTAR AO PAINEL
            </Link>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gray-900 text-orange-500 shadow-gray-900/20 shadow-xl">
              <Users className="h-8 w-8" />
            </div>
            <h1 className="font-black text-4xl text-gray-900 tracking-tight">
              Lista de Espera PRO
            </h1>
            <p className="mt-2 font-medium text-base text-gray-500">
              Gerencie os contatos cadastrados interessados nos planos de
              assinatura futuros do ClubRun.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyEmails}
            disabled={waitlist.length === 0}
            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white shadow-orange-500/10 shadow-xl transition-all hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <ClipboardCheck className="h-5 w-5" />
                E-MAILS COPIADOS!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                COPIAR TODOS OS E-MAILS
              </>
            )}
          </button>
        </div>

        {/* FILTROS E BUSCA */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-white py-4 pr-5 pl-12 font-bold text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* REGISTROS LIST */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="space-y-6">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="mt-4 font-bold text-sm">
                  Carregando lista de espera...
                </p>
              </div>
            ) : filteredWaitlist.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-gray-100 border-b">
                      <th className="pb-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        Nome do Lead
                      </th>
                      <th className="pb-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        E-mail de Contato
                      </th>
                      <th className="pb-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        Data de Cadastro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredWaitlist.map((entry) => (
                      <tr key={entry.id} className="group">
                        <td className="py-4 pr-4 font-bold text-gray-900">
                          {entry.name || (
                            <span className="font-semibold text-gray-300 italic">
                              Não informado
                            </span>
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="flex items-center gap-2 font-semibold text-gray-700">
                            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                            {entry.email}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-gray-500 text-sm">
                          {new Date(entry.createdAt).toLocaleDateString(
                            'pt-BR'
                          )}{' '}
                          {new Date(entry.createdAt).toLocaleTimeString(
                            'pt-BR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-1 font-extrabold text-gray-900 text-lg">
                  Nenhum lead encontrado
                </h3>
                <p className="font-semibold text-gray-400 text-sm">
                  Não há interessados registrados com esse filtro ainda.
                </p>
              </div>
            )}
          </div>

          {/* CONTROLES DE PAGINAÇÃO */}
          {totalPages > 1 && !isPending && (
            <div className="mt-8 flex items-center justify-between border-gray-100 border-t pt-6">
              <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white font-bold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white font-bold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
