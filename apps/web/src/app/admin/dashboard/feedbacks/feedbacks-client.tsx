'use client'

import { getSystemFeedbacksAction } from '@/app/private-actions'
import { AdminHeader } from '@/components/admin-header'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, useTransition } from 'react'

interface FeedbackItem {
  id: string
  type: string
  comment: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface AdminFeedbacksClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  initialFeedbacks: FeedbackItem[]
  initialTotalPages: number
}

export function AdminFeedbacksClient({
  user,
  initialFeedbacks,
  initialTotalPages,
}: AdminFeedbacksClientProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [typeFilter, setTypeFilter] = useState<string>('')

  const [isPending, startTransition] = useTransition()

  // Buscar feedbacks quando a página mudar
  useEffect(() => {
    if (page === 1) {
      setFeedbacks(initialFeedbacks)
      setTotalPages(initialTotalPages)
      return
    }

    const controller = new AbortController()

    startTransition(async () => {
      try {
        const result = await getSystemFeedbacksAction({
          page,
          limit: 15,
        })
        if (!controller.signal.aborted) {
          setFeedbacks(result.feedbacks)
          setTotalPages(result.totalPages)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erro ao buscar feedbacks:', error)
        }
      }
    })

    return () => controller.abort()
  }, [page, initialFeedbacks, initialTotalPages])

  // Filtragem local simples baseada em tipo de feedback
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (!typeFilter) return true
    return fb.type === typeFilter
  })

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'BUG':
        return {
          bg: 'bg-red-50 border-red-100 text-red-600',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Bug / Erro',
        }
      case 'SUGGESTION':
        return {
          bg: 'bg-green-50 border-green-100 text-green-600',
          icon: <Lightbulb className="h-3 w-3" />,
          label: 'Sugestão',
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-100 text-gray-500',
          icon: <HelpCircle className="h-3 w-3" />,
          label: 'Outro',
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <AdminHeader user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        {/* CABEÇALHO */}
        <div className="mb-10">
          <Link
            href="/admin/dashboard"
            className="mb-6 flex w-fit items-center gap-2 font-bold text-gray-500 text-xs transition-colors hover:text-orange-500"
          >
            <ArrowLeft className="h-4 w-4" /> VOLTAR AO PAINEL
          </Link>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gray-900 text-orange-500 shadow-gray-900/20 shadow-xl">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h1 className="font-black text-4xl text-gray-900 tracking-tight">
            Feedbacks de Usuários
          </h1>
          <p className="mt-2 font-medium text-base text-gray-500">
            Acompanhe críticas, relatos de bugs e sugestões enviados pelos
            atletas do ClubRun.
          </p>
        </div>

        {/* FILTROS */}
        <div className="mb-8 flex justify-end">
          <div className="flex w-full gap-2 rounded-2xl bg-gray-100 p-1.5 sm:w-auto">
            {(
              [
                { id: '', label: 'Todos' },
                { id: 'SUGGESTION', label: 'Sugestões' },
                { id: 'BUG', label: 'Bugs' },
                { id: 'OTHER', label: 'Outros' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTypeFilter(opt.id)}
                className={`flex-1 cursor-pointer rounded-xl px-5 py-2.5 text-center font-black text-xs uppercase tracking-wider transition-all sm:flex-initial ${
                  typeFilter === opt.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* FEEDBACKS LIST */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="space-y-6">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="mt-4 font-bold text-sm">
                  Carregando feedbacks...
                </p>
              </div>
            ) : filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((fb) => {
                const badge = getBadgeStyle(fb.type)
                return (
                  <div
                    key={fb.id}
                    className="rounded-3xl border border-gray-50 bg-gray-50/20 p-6 transition-all hover:bg-gray-50/40 hover:shadow-xs sm:p-8"
                  >
                    <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-black text-[10px] uppercase tracking-widest ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                          ID: {fb.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-400 text-xs">
                        {new Date(fb.createdAt).toLocaleDateString('pt-BR')}{' '}
                        {new Date(fb.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap font-medium text-base text-gray-800 leading-relaxed">
                      {fb.comment}
                    </p>

                    <div className="mt-6 flex flex-col gap-1 border-gray-100 border-t pt-4 sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        Enviado por:
                      </span>
                      <span className="font-bold text-gray-900 text-xs">
                        {fb.user.name || 'Sem nome'}
                      </span>
                      <span className="hidden text-gray-300 sm:inline">•</span>
                      <span className="font-medium text-gray-500 text-xs">
                        {fb.user.email}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-20 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-1 font-extrabold text-gray-900 text-lg">
                  Nenhum feedback encontrado
                </h3>
                <p className="font-semibold text-gray-400 text-sm">
                  Não há feedbacks registrados para esta categoria ainda.
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
