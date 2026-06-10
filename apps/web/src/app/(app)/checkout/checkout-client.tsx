'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Flame,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { Header } from '@/components/header'
import { subscribeAthlete } from '@/http/subscribe-athlete'

interface CheckoutClientProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

export function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const getPlanInfo = (planName: string) => {
    switch (planName) {
      case 'athlete':
        return {
          name: 'Atleta Premium',
          price: 'R$ 9,90',
          interval: 'por mês',
          features: [
            'Participar de clubes ilimitados',
            'Registrar treinos e planilhas',
            'Perfil completo de atleta com bio e capa',
            'Estatísticas avançadas de ritmo e distância',
            'Conexão com Instagram e Strava',
          ],
        }
      case 'starter':
        return {
          name: 'Plano Starter',
          price: 'R$ 24,90',
          interval: 'por mês',
          features: [
            'Até 30 atletas ativos',
            '1 Clube exclusive',
            'Dashboard do Treinador',
            'Aprovação de convites',
          ],
        }
      case 'elite':
        return {
          name: 'Plano Elite',
          price: 'R$ 99,90',
          interval: 'por mês',
          features: [
            'Atletas ilimitados',
            'Tudo do plano Pro',
            'Domínio personalizado',
            'Suporte prioritário VIP',
          ],
        }
      default:
        return {
          name: 'Plano Pro',
          price: 'R$ 49,90',
          interval: 'por mês',
          features: [
            'Até 100 atletas ativos',
            'Gestão de provas avançada',
            'Múltiplos administradores',
            'Verificação de inadimplência',
            'Ranking em tempo real',
          ],
        }
    }
  }

  const planInfo = getPlanInfo(plan)

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulação de processamento de pagamento
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)
      
      // Pequeno delay para mostrar o sucesso antes de redirecionar
      setTimeout(async () => {
        const role = searchParams.get('role')
        if (role === 'athlete' || plan === 'athlete') {
          // Persiste a assinatura premium do atleta no banco de dados
          try {
            await subscribeAthlete()
          } catch (err) {
            console.error('Erro ao salvar assinatura no banco de dados:', err)
          }

          // Salva no localStorage e nos cookies que o atleta é assinado
          if (typeof window !== 'undefined') {
            localStorage.setItem('clubrun:athlete_subscribed', 'true')
            document.cookie = 'athlete_subscribed=true; path=/; max-age=31536000'
          }

          const clubSlug = searchParams.get('clubSlug')
          const clubName = searchParams.get('clubName')

          if (clubSlug) {
            try {
              const { requestJoinClub } = await import('@/http/request-join-club')
              await requestJoinClub(clubSlug)
              router.push(`/explore?checkoutComplete=true&joinedClubName=${encodeURIComponent(clubName || 'Clube')}`)
            } catch (err) {
              console.error('Erro ao pedir para participar:', err)
              router.push('/explore?checkoutComplete=true')
            }
          } else {
            router.push('/explore?checkoutComplete=true')
          }
        } else {
          router.push('/create-club?checkoutComplete=true')
        }
      }, 2500)
    }, 3000)
  }

  // Máscaras simples
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
    return value
      .replace(/[^0-9]/g, '')
      .replace(/^([2-9])/, '0$1')
      .replace(/^(1[3-9])/, '1')
      .replace(/^([0-1][0-2])([0-9])/, '$1/$2')
      .replace(/^(0[1-9]|1[0-2])([0-9]{2})/, '$1/$2')
      .slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      {/* Overlay de Sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="animate-in zoom-in-95 fade-in flex flex-col items-center text-center duration-500">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-xl shadow-green-500/10">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-4xl font-black tracking-tight text-gray-900">
              Pagamento Confirmado!
            </h2>
            <p className="max-w-xs text-lg font-medium text-gray-500">
              Sua assinatura {planInfo.name} foi ativada com sucesso. Prepare-se para decolar!
            </p>
            
            <div className="mt-12 flex items-center gap-2 text-xs font-black tracking-widest text-gray-400 uppercase">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              Redirecionando para criação do clube...
            </div>
          </div>
        </div>
      )}

      {/* Header Estilo Checkout (sem distrações) */}
      <Header user={user} />

      <main className="animate-in fade-in mx-auto max-w-7xl px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <button 
            onClick={() => router.back()}
            className="cursor-pointer group flex items-center gap-2 text-xs font-black tracking-widest text-gray-400 uppercase transition-colors hover:text-orange-500"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors group-hover:border-orange-200 group-hover:bg-orange-50">
              <ArrowLeft className="h-3 w-3" />
            </div>
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          
          {/* LADO ESQUERDO: FORMULÁRIO */}
          <div className="space-y-8 lg:col-span-7">
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm sm:p-12">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 shadow-inner">
                  <CreditCard className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900">
                    Pagamento
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    Insira os dados do cartão para ativar o plano Pro.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCheckout} id="checkout-form" className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Titular do Cartão
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    placeholder="NOME COMO NO CARTÃO"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 uppercase transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Número do Cartão
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-mono text-lg font-black tracking-widest text-gray-900 transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                    />
                    <div className="absolute top-1/2 right-5 -translate-y-1/2 flex gap-1">
                      <div className="h-6 w-10 rounded bg-blue-900/10 grayscale opacity-50" />
                      <div className="h-6 w-10 rounded bg-orange-500/10 grayscale opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Validade
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center font-mono text-lg font-black text-gray-900 transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      CVC / CVV
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center font-mono text-lg font-black text-gray-900 transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                      />
                      <ShieldAlert className="absolute top-1/2 right-5 h-4 w-4 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-3 rounded-full bg-white px-6 py-2 shadow-xs ring-1 ring-gray-100">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Ambiente 100% Seguro & Criptografado
                </span>
              </div>
              <p className="max-w-md text-[10px] font-medium leading-relaxed text-gray-400">
                O ClubRun não armazena os seus dados de cartão. Todo o processamento é realizado por parceiros certificados PCI-DSS.
              </p>
            </div>
          </div>

          {/* LADO DIREITO: RESUMO */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-[3rem] bg-gray-900 p-8 text-white shadow-2xl sm:p-10">
              <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]" />
              
              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-2">
                  <span className="rounded-lg bg-orange-500 px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                    PRO
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    ASSINATURA ANUAL
                  </span>
                </div>

                <div className="mb-10">
                  <h4 className="mb-1 flex items-center gap-2 text-2xl font-black text-white">
                    <Flame className="h-6 w-6 text-orange-500" fill="currentColor" />
                    {planInfo.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">
                      {planInfo.price}
                    </span>
                    <span className="text-sm font-bold text-gray-500">
                      {planInfo.interval}
                    </span>
                  </div>
                </div>

                <div className="mb-10 space-y-4">
                  {planInfo.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-8">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isLoading}
                    className="cursor-pointer group flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 font-black text-gray-900 shadow-xl transition-all hover:bg-orange-500 hover:text-white active:scale-95 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
                    ) : (
                      <>
                        ATIVAR AGORA
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                  <p className="mt-6 text-center text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    <Sparkles className="h-3 w-3 inline mr-1 text-orange-500" /> 7 dias de garantia ou seu dinheiro de volta
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
