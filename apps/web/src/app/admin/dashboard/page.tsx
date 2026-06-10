import React from 'react'
import { auth } from '@/auth/auth'
import { AdminHeader } from '@/components/admin-header'
import { getSystemStats } from '@/http/get-system-stats'
import { getSystemLogs } from '@/http/get-system-logs'
import { 
  BarChart, 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  History,
} from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.isSystemAdmin && user.email !== 'admin@clubrun.com') {
    redirect('/')
  }

  const { stats } = await getSystemStats()
  const { logs } = await getSystemLogs()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <AdminHeader 
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }} 
      />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gray-900 text-orange-500 shadow-xl shadow-gray-900/20">
            <BarChart className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            Métricas do Sistema
          </h1>
          <p className="mt-2 text-base font-medium text-gray-500">
            Visão geral de performance, crescimento e saúde da plataforma ClubRun.
          </p>
        </div>

        {/* STATS GRID */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total de Clubes</p>
            <p className="mt-1 text-3xl font-black text-gray-900">{stats.totalClubs}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              Crescimento contínuo
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Usuários Totais</p>
            <p className="mt-1 text-3xl font-black text-gray-900">{stats.totalUsers}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              Novos atletas hoje
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <Zap className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Receita Est. (Mensal)</p>
            <p className="mt-1 text-3xl font-black text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              Assinaturas ativas
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total de Atividades</p>
            <p className="mt-1 text-3xl font-black text-gray-900">{stats.totalWorkouts}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              Histórico global
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900">
              <History className="h-6 w-6 text-orange-500" />
              Atividade Recente do Sistema
            </h2>
            <button className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:underline">
              Ver logs completos <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-6">
            {logs.length > 0 ? (
              logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm font-black text-gray-400">
                    <Activity className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {log.action.replace('_', ' ')}: <span className="text-orange-500">{log.entity}</span>
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {log.user?.name || log.user?.email || 'Sistema'} • {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  <span className="rounded-lg bg-gray-200 px-3 py-1 text-[10px] font-black uppercase text-gray-500">Info</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-gray-400">Nenhuma atividade registrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
