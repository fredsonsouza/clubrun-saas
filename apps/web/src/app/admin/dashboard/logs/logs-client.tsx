'use client'

import { getSystemLogsAction } from '@/app/private-actions'
import { AdminHeader } from '@/components/admin-header'
import { DatePicker } from '@/components/date-picker'

import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  Search,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useState, useTransition } from 'react'

interface LogItem {
  id: string
  action: string
  entity: string
  entityId: string
  payload: any | null
  createdAt: string
  user: {
    name: string | null
    email: string
  } | null
}

interface AdminLogsClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  initialLogs: LogItem[]
  initialTotalPages: number
}

// Ações comuns do sistema para filtro rápido
const SYSTEM_ACTIONS = [
  'GOOGLE_SIGNUP',
  'GOOGLE_LOGIN',
  'PASSWORD_SIGNUP',
  'PASSWORD_LOGIN',
  'CREATE_CLUB',
  'UPDATE_CLUB',
  'REMOVE_MEMBER',
  'CREATE_WORKOUT',
  'PAY_INVOICE',
]

// Entidades comuns
const SYSTEM_ENTITIES = ['USER', 'CLUB', 'WORKOUT', 'INVOICE']

// Converter dd/mm/aaaa para aaaa-mm-dd
const parseToIso = (val: string) => {
  if (!val || val.length !== 10) return undefined
  const parts = val.split('/')
  if (parts.length !== 3) return undefined
  const d = parts[0]
  const m = parts[1]
  const y = parts[2]
  return `${y}-${m}-${d}`
}

export function AdminLogsClient({
  user,
  initialLogs,
  initialTotalPages,
}: AdminLogsClientProps) {
  const [logs, setLogs] = useState<LogItem[]>(initialLogs)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  // Buscar logs quando os filtros ou página mudarem
  useEffect(() => {
    // Evitar rodar na primeira renderização se não houver filtros
    if (
      page === 1 &&
      !search &&
      !actionFilter &&
      !entityFilter &&
      !startDate &&
      !endDate
    ) {
      setLogs(initialLogs)
      setTotalPages(initialTotalPages)
      return
    }

    const controller = new AbortController()
    const delayDebounceFn = setTimeout(() => {
      startTransition(async () => {
        try {
          const parsedStartDate = parseToIso(startDate)
          const parsedEndDate = parseToIso(endDate)

          const result = await getSystemLogsAction({
            page,
            limit: 20, // menor limite para melhor performance de visualização de payloads
            action: actionFilter || undefined,
            entity: entityFilter || undefined,
            search: search || undefined,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
          })
          if (!controller.signal.aborted) {
            setLogs(result.logs)
            setTotalPages(result.totalPages)
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error('Erro ao buscar logs:', error)
          }
        }
      })
    }, 300) // Debounce de 300ms para busca fluida

    return () => {
      clearTimeout(delayDebounceFn)
      controller.abort()
    }
  }, [
    page,
    search,
    actionFilter,
    entityFilter,
    startDate,
    endDate,
    initialLogs,
    initialTotalPages,
  ])

  // Resetar página ao mudar filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionFilter(e.target.value)
    setPage(1)
  }

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntityFilter(e.target.value)
    setPage(1)
  }

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    setPage(1)
  }

  const handleEndDateChange = (val: string) => {
    setEndDate(val)
    setPage(1)
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
            <Terminal className="h-8 w-8" />
          </div>
          <h1 className="font-black text-4xl text-gray-900 tracking-tight">
            Rastreabilidade de Logs
          </h1>
          <p className="mt-2 font-medium text-base text-gray-500">
            Auditoria completa de todas as ações e mutações de banco de dados do
            sistema.
          </p>
        </div>

        {/* FILTROS E BUSCA */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Campo de Busca */}
            <div className="relative sm:col-span-6">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuário, e-mail, ID..."
                value={search}
                onChange={handleSearchChange}
                className="w-full rounded-2xl border border-gray-100 bg-white py-4 pr-4 pl-12 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            {/* Filtro por Ação */}
            <div className="relative sm:col-span-3">
              <select
                value={actionFilter}
                onChange={handleActionChange}
                className="w-full appearance-none rounded-2xl border border-gray-100 bg-white px-4 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="">Todas as Ações</option>
                {SYSTEM_ACTIONS.map((act) => (
                  <option key={act} value={act}>
                    {act.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <Filter className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-4 h-4 w-4 text-gray-400" />
            </div>

            {/* Filtro por Entidade */}
            <div className="relative sm:col-span-3">
              <select
                value={entityFilter}
                onChange={handleEntityChange}
                className="w-full appearance-none rounded-2xl border border-gray-100 bg-white px-4 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="">Todas as Entidades</option>
                {SYSTEM_ENTITIES.map((ent) => (
                  <option key={ent} value={ent}>
                    {ent}
                  </option>
                ))}
              </select>
              <Database className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Filtros de Data (DayPicker) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              label="De (Data Inicial)"
            />
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              label="Até (Data Final)"
            />
          </div>
        </div>

        {/* LOGS LIST */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="space-y-4">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="mt-4 font-bold text-sm">
                  Atualizando auditoria...
                </p>
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => {
                const isExpanded = expandedLogId === log.id
                return (
                  <div
                    key={log.id}
                    className={`overflow-hidden rounded-2xl border transition-all ${isExpanded ? 'border-orange-200 bg-orange-50/5 shadow-md' : 'border-gray-50 bg-gray-50/30 hover:bg-gray-100/50'}`}
                  >
                    {/* Linha Resumo */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedLogId(isExpanded ? null : log.id)
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-black shadow-sm ${isExpanded ? 'text-orange-500' : 'text-gray-400'}`}
                        >
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-sm">
                            {log.action.replace('_', ' ')}:{' '}
                            <span className="font-black text-orange-600">
                              {log.entity}
                            </span>
                          </p>
                          <p className="mt-0.5 font-semibold text-gray-400 text-xs">
                            {log.user?.name || log.user?.email || 'Sistema'} •{' '}
                            {new Date(log.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}{' '}
                            {new Date(log.createdAt).toLocaleTimeString(
                              'pt-BR',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg border border-gray-100 bg-white px-3 py-1 font-black text-[9px] text-gray-400 uppercase tracking-wider">
                          ID: {log.entityId.slice(0, 8)}...
                        </span>
                        <ChevronRight
                          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90 text-orange-500' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Detalhes Expansíveis */}
                    {isExpanded && (
                      <div className="border-orange-100 border-t bg-white p-6">
                        <h5 className="mb-3 font-black text-[10px] text-gray-400 uppercase tracking-wider">
                          Metadados & Payload Completo
                        </h5>
                        <pre className="overflow-x-auto rounded-2xl bg-gray-900 p-5 font-mono text-[11px] text-green-400 shadow-inner">
                          <code>{JSON.stringify(log.payload, null, 2)}</code>
                        </pre>
                        <div className="mt-4 flex gap-6 font-bold text-[10px] text-gray-400 uppercase">
                          <span>Log ID: {log.id}</span>
                          <span>Entity ID: {log.entityId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-20 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-1 font-extrabold text-gray-900 text-lg">
                  Nenhum log encontrado
                </h3>
                <p className="font-semibold text-gray-400 text-sm">
                  Tente alterar seus termos de busca ou filtros aplicados.
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
