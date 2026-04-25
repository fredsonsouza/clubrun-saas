import React from 'react'
import { auth } from '@/auth/auth'
import { AdminHeader } from '@/components/admin-header'
import { 
  BarChart, 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const { user } = await auth()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <AdminHeader user={user} />

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
            <p className="mt-1 text-3xl font-black text-gray-900">124</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="h-3 w-3" /> +12% este mês
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Atletas Ativos</p>
            <p className="mt-1 text-3xl font-black text-gray-900">3.842</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="h-3 w-3" /> +8% este mês
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <Zap className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">MRR Total</p>
            <p className="mt-1 text-3xl font-black text-gray-900">R$ 14.850</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="h-3 w-3" /> +15% este mês
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Taxa de Churn</p>
            <p className="mt-1 text-3xl font-black text-gray-900">1.2%</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
              -0.5% vs mês ant.
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY PLACEHOLDER */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">Atividade Recente do Sistema</h2>
            <button className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:underline">
              Ver logs completos <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Novo clube registrado: <span className="text-orange-500">Pace Makers RR</span></p>
                  <p className="text-xs font-medium text-gray-500">Há {i * 2} horas atrás</p>
                </div>
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">Sucesso</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
