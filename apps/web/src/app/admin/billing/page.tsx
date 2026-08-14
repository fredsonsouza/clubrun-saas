import { auth } from '@/auth/auth'
import { AdminHeader } from '@/components/admin-header'
import { getSystemBilling } from '@/http/get-system-billing'
import { AlertCircle, CheckCircle2, CreditCard } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function AdminBillingPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.isSystemAdmin) {
    redirect('/')
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

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-8 duration-500 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 font-extrabold text-3xl text-gray-900 tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-500 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            Faturação Global
          </h1>
          <p className="font-medium text-gray-500 text-sm">
            Acompanhe a receita recorrente (MRR) e as transações de toda a
            plataforma ClubRun.
          </p>
        </div>

        {/* Dashboard Financeiro */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* MRR Principal */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 p-8 text-white shadow-xl lg:col-span-2">
            <div className="-top-24 -right-24 pointer-events-none absolute h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />

            <div className="relative z-10 mb-8 flex items-start justify-between">
              <div>
                <p className="mb-2 font-bold text-gray-400 text-sm uppercase tracking-widest">
                  Receita Recorrente Mensal (MRR)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-5xl text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(billing.mrr)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1.5 font-bold text-green-400 text-sm">
                Dados reais
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 border-gray-800 border-t pt-6">
              <div>
                <p className="mb-1 font-bold text-gray-500 text-xs uppercase tracking-wider">
                  Receita de Clubes (B2B)
                </p>
                <p className="font-bold text-white text-xl">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(billing.b2bRevenue)}
                </p>
              </div>
              <div>
                <p className="mb-1 font-bold text-gray-500 text-xs uppercase tracking-wider">
                  Receita de Atletas (B2C)
                </p>
                <p className="font-bold text-white text-xl">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(billing.b2cRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo Disponível (Stripe/Pagar.me) */}
          <div className="flex flex-col justify-center rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <p className="mb-2 font-bold text-gray-400 text-xs uppercase tracking-widest">
              Saldo a Transferir
            </p>
            <p className="mb-6 font-black text-4xl text-gray-900">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(billing.availableBalance)}
            </p>
            <button
              type="button"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 font-bold text-gray-900 opacity-50 transition-colors hover:bg-gray-200"
            >
              Efetuar Saque (Indisponível)
            </button>
          </div>
        </div>

        {/* Transações Recentes */}
        <h2 className="mb-4 font-extrabold text-gray-900 text-xl">
          Transações Recentes
        </h2>
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="divide-y divide-gray-50">
            {billing.transactions.length > 0 ? (
              billing.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-5 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {tx.entity}
                    </p>
                    <p className="mt-0.5 font-medium text-gray-500 text-xs">
                      {tx.type} •{' '}
                      {new Date(tx.date).toLocaleDateString('pt-BR')}{' '}
                      {new Date(tx.date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-bold font-mono text-gray-900 text-sm">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(tx.amount)}
                    </span>
                    {tx.status === 'PAID' ? (
                      <span className="flex w-24 items-center justify-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-1 font-bold text-[10px] text-green-600 uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" /> Pago
                      </span>
                    ) : (
                      <span className="flex w-24 items-center justify-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-1 font-bold text-[10px] text-red-600 uppercase tracking-wider">
                        <AlertCircle className="h-3 w-3" /> {tx.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center font-medium text-gray-400 text-sm">
                Nenhuma transação registrada.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
