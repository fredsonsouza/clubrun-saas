import React from 'react'
import { auth } from '@/auth/auth'
import { AdminHeader } from '@/components/admin-header'
import { getSystemBilling } from '@/http/get-system-billing'
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminBillingPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { billing } = await getSystemBilling()

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

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-gray-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-500 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            Faturação Global
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Acompanhe a receita recorrente (MRR) e as transações de toda a plataforma ClubRun.
          </p>
        </div>

        {/* Dashboard Financeiro */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* MRR Principal */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 p-8 text-white shadow-xl lg:col-span-2">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />

            <div className="relative z-10 mb-8 flex items-start justify-between">
              <div>
                <p className="mb-2 text-sm font-bold tracking-widest text-gray-400 uppercase">
                  Receita Recorrente Mensal (MRR)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billing.mrr)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-sm font-bold text-green-400">
                Dados reais
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Receita de Clubes (B2B)
                </p>
                <p className="text-xl font-bold text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billing.b2bRevenue)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Receita de Atletas (B2C)
                </p>
                <p className="text-xl font-bold text-white">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billing.b2cRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo Disponível (Stripe/Pagar.me) */}
          <div className="flex flex-col justify-center rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <p className="mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
              Saldo a Transferir
            </p>
            <p className="mb-6 text-4xl font-black text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billing.availableBalance)}
            </p>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 font-bold text-gray-900 transition-colors hover:bg-gray-200 cursor-not-allowed opacity-50">
               Efetuar Saque (Indisponível)
            </button>
          </div>
        </div>

        {/* Transações Recentes */}
        <h2 className="mb-4 text-xl font-extrabold text-gray-900">
          Transações Recentes
        </h2>
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="divide-y divide-gray-50">
            {billing.transactions.length > 0 ? billing.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-5 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{tx.entity}</p>
                  <p className="mt-0.5 text-xs font-medium text-gray-500">
                    {tx.type} • {new Date(tx.date).toLocaleDateString('pt-BR')} {new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="font-mono text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                  </span>
                  {tx.status === 'PAID' ? (
                    <span className="flex w-24 items-center justify-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-1 text-[10px] font-bold tracking-wider text-green-600 uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Pago
                    </span>
                  ) : (
                    <span className="flex w-24 items-center justify-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold tracking-wider text-red-600 uppercase">
                      <AlertCircle className="h-3 w-3" /> {tx.status}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-sm font-medium text-gray-400">
                Nenhuma transação registrada.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
