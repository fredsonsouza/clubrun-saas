'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Flame,
  LogOut,
} from 'lucide-react'

// --- SIMULAÇÃO DE HEADER ONBOARDING ---
function OnboardingHeaderPreview() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-orange-500" fill="currentColor" />
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Club<span className="text-orange-500">Run</span>
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-1 focus:outline-none"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-gray-200 bg-white">
              <img src="https://i.pravatar.cc/150?img=11" alt="Perfil" />
            </div>
          </button>
          {isOpen && (
            <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
              <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

// --- PÁGINA DE PREVIEW ---
export default function CheckoutPreviewPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const planInfo = {
    name: 'Plano Pro',
    price: 'R$ 99,00',
    interval: 'por mês',
    features: [
      'Atletas ilimitados',
      'Gestão de provas avançada',
      'Suporte prioritário',
      'Múltiplos administradores',
    ],
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('Pagamento aprovado! Redirecionando para o Dashboard...')
    }, 2000)
  }

  // Máscaras visuais simples para melhorar o protótipo
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      <OnboardingHeaderPreview />

      <main className="animate-in fade-in mx-auto max-w-5xl px-4 pt-8 duration-500 sm:px-6 md:pt-12 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Finalize a sua assinatura
          </h1>
          <p className="flex items-center justify-center gap-2 font-medium text-gray-500">
            <Lock className="h-4 w-4 text-gray-400" /> Pagamento 100% seguro e
            criptografado
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LADO ESQUERDO: CARTÃO */}
          <div className="space-y-6 lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              {/* Detalhe visual discreto no fundo do formulário */}
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl"></div>

              <div className="relative z-10 mb-6 flex items-center gap-3 border-b border-gray-100 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Cartão de Crédito
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    Visa, Mastercard, Amex, Elo
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleCheckout}
                id="checkout-form"
                className="relative z-10 space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    placeholder="Ex: FREDSON SOUZA"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-bold text-gray-900 uppercase shadow-sm transition-all placeholder:font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder="0000 0000 0000 0000"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-mono text-lg font-bold tracking-widest text-gray-900 shadow-sm transition-all placeholder:font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Validade
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-center font-mono text-lg font-bold text-gray-900 shadow-sm transition-all placeholder:font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      CVC
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvc}
                      onChange={(e) =>
                        setCvc(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="123"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-center font-mono text-lg font-bold text-gray-900 shadow-sm transition-all placeholder:font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
              <ShieldCheck className="h-4 w-4 text-green-500" /> Transação via
              Pagar.me
            </div>
          </div>

          {/* LADO DIREITO: RESUMO */}
          <div className="space-y-6 lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 p-8 text-white shadow-xl">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />

              <h3 className="relative z-10 mb-6 text-sm font-bold tracking-widest text-gray-400 uppercase">
                Resumo do Pedido
              </h3>

              <div className="relative z-10 mb-6 flex items-end justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-2xl font-black text-white">
                    <Flame
                      className="h-5 w-5 text-orange-500"
                      fill="currentColor"
                    />{' '}
                    {planInfo.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-black">
                    {planInfo.price}
                  </span>
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {planInfo.interval}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mb-8 space-y-4">
                {planInfo.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm font-medium text-gray-300"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="relative z-10 border-t border-gray-700/50 pt-6">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isLoading || cardNumber.length < 16}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Assinar Agora <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Pode cancelar a qualquer momento nas definições.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
