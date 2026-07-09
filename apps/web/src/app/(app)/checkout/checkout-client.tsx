'use client'

import { Header } from '@/components/header'
import { subscribeAthlete } from '@/http/subscribe-athlete'
import { joinWaitlist } from '@/http/waitlist-actions'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Flame,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'

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

  const [tab, setTab] = useState<'waitlist' | 'checkout'>('waitlist')
  const [waitlistEmail, setWaitlistEmail] = useState(user.email || '')
  const [waitlistName, setWaitlistName] = useState(user.name || '')
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistError, setWaitlistError] = useState('')

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistEmail) return
    setWaitlistLoading(true)
    setWaitlistError('')
    try {
      await joinWaitlist({ email: waitlistEmail, name: waitlistName })
      setWaitlistSuccess(true)
    } catch (err) {
      console.error(err)
      setWaitlistError('Erro ao entrar na lista de espera. Tente novamente.')
    } finally {
      setWaitlistLoading(false)
    }
  }

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
            document.cookie =
              'athlete_subscribed=true; path=/; max-age=31536000'
          }

          const clubSlug = searchParams.get('clubSlug')
          const clubName = searchParams.get('clubName')

          if (clubSlug) {
            try {
              const { requestJoinClub } = await import(
                '@/http/request-join-club'
              )
              await requestJoinClub(clubSlug)
              router.push(
                `/explore?checkoutComplete=true&joinedClubName=${encodeURIComponent(clubName || 'Clube')}`
              )
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
    const match = matches?.[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    }
    return value
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
          <div className="zoom-in-95 fade-in flex animate-in flex-col items-center text-center duration-500">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-green-500/10 shadow-xl">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mb-2 font-black text-4xl text-gray-900 tracking-tight">
              Pagamento Confirmado!
            </h2>
            <p className="max-w-xs font-medium text-gray-500 text-lg">
              Sua assinatura {planInfo.name} foi ativada com sucesso. Prepare-se
              para decolar!
            </p>

            <div className="mt-12 flex items-center gap-2 font-black text-gray-400 text-xs uppercase tracking-widest">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              Redirecionando para criação do clube...
            </div>
          </div>
        </div>
      )}

      {/* Header Estilo Checkout (sem distrações) */}
      <Header user={user} />

      <main className="fade-in mx-auto max-w-7xl animate-in px-4 pt-12 duration-700 sm:px-6 lg:px-8">
        <div className="mb-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex cursor-pointer items-center gap-2 font-black text-gray-400 text-xs uppercase tracking-widest transition-colors hover:text-orange-500"
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
              {/* Alternador de abas */}
              <div className="mb-8 flex gap-2 rounded-2xl bg-gray-50 p-1.5">
                <button
                  type="button"
                  onClick={() => setTab('waitlist')}
                  className={`flex-1 cursor-pointer rounded-xl py-3 text-center font-black text-xs uppercase tracking-wider transition-all ${
                    tab === 'waitlist'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Lista de Espera (PRO)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('checkout')}
                  className={`flex-1 cursor-pointer rounded-xl py-3 text-center font-black text-xs uppercase tracking-wider transition-all ${
                    tab === 'checkout'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Simular Pagamento
                </button>
              </div>

              {tab === 'waitlist' ? (
                waitlistSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                      <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                    <h3 className="font-black text-2xl text-gray-900">
                      Inscrição Confirmada!
                    </h3>
                    <p className="mt-2 font-medium text-gray-500 text-sm">
                      Você está na lista de espera. Entraremos em contato assim
                      que os planos forem lançados com seu desconto exclusivo
                      nos três primeiros meses.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleJoinWaitlist}
                    id="waitlist-form"
                    className="space-y-6"
                  >
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 font-medium text-orange-800 text-sm leading-relaxed">
                      <Sparkles className="mr-2 inline h-5 w-5 shrink-0 text-orange-500" />
                      Estamos terminando a homologação de pagamentos.
                      Inscreva-se hoje na lista de espera e garanta{' '}
                      <strong>
                        desconto exclusivo nos três primeiros meses
                      </strong>{' '}
                      no lançamento!
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="waitlist-name"
                        className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                      >
                        Seu Nome
                      </label>
                      <input
                        id="waitlist-name"
                        type="text"
                        required
                        value={waitlistName}
                        onChange={(e) => setWaitlistName(e.target.value)}
                        placeholder="Insira seu nome completo"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="waitlist-email"
                        className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                      >
                        E-mail de Contato
                      </label>
                      <input
                        id="waitlist-email"
                        type="email"
                        required
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder="seu-email@exemplo.com"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>

                    {waitlistError && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 font-bold text-red-600 text-xs">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>{waitlistError}</span>
                      </div>
                    )}
                  </form>
                )
              ) : (
                <form
                  onSubmit={handleCheckout}
                  id="checkout-form"
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="card-name"
                      className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                    >
                      Titular do Cartão
                    </label>
                    <input
                      id="card-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 uppercase transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="card-number"
                      className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                    >
                      Número do Cartão
                    </label>
                    <div className="relative">
                      <input
                        id="card-number"
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        placeholder="0000 0000 0000 0000"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-black font-mono text-gray-900 text-lg tracking-widest transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      />
                      <div className="-translate-y-1/2 absolute top-1/2 right-5 flex gap-1">
                        <div className="h-6 w-10 rounded bg-blue-900/10 opacity-50 grayscale" />
                        <div className="h-6 w-10 rounded bg-orange-500/10 opacity-50 grayscale" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="card-expiry"
                        className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                      >
                        Validade
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        placeholder="MM/AA"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center font-black font-mono text-gray-900 text-lg transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="card-cvc"
                        className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                      >
                        CVC / CVV
                      </label>
                      <div className="relative">
                        <input
                          id="card-cvc"
                          type="text"
                          required
                          maxLength={4}
                          value={cvc}
                          onChange={(e) =>
                            setCvc(e.target.value.replace(/[^0-9]/g, ''))
                          }
                          placeholder="123"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center font-black font-mono text-gray-900 text-lg transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                        <ShieldAlert className="-translate-y-1/2 absolute top-1/2 right-5 h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-3 rounded-full bg-white px-6 py-2 shadow-xs ring-1 ring-gray-100">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span className="font-black text-[10px] text-gray-500 uppercase tracking-widest">
                  Ambiente 100% Seguro & Criptografado
                </span>
              </div>
              <p className="max-w-md font-medium text-[10px] text-gray-400 leading-relaxed">
                O ClubRun não armazena os seus dados de cartão. Todo o
                processamento é realizado por parceiros certificados PCI-DSS.
              </p>
            </div>
          </div>

          {/* LADO DIREITO: RESUMO */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-[3rem] bg-gray-900 p-8 text-white shadow-2xl sm:p-10">
              <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-2">
                  <span className="rounded-lg bg-orange-500 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                    PRO
                  </span>
                  <span className="font-bold text-gray-400 text-xs">
                    ASSINATURA ANUAL
                  </span>
                </div>

                <div className="mb-10">
                  <h4 className="mb-1 flex items-center gap-2 font-black text-2xl text-white">
                    <Flame
                      className="h-6 w-6 text-orange-500"
                      fill="currentColor"
                    />
                    {planInfo.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-5xl tracking-tighter">
                      {planInfo.price}
                    </span>
                    <span className="font-bold text-gray-500 text-sm">
                      {planInfo.interval}
                    </span>
                  </div>
                </div>

                <div className="mb-10 space-y-4">
                  {planInfo.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 font-bold text-gray-300 text-sm"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="border-white/10 border-t pt-8">
                  {tab === 'waitlist' ? (
                    <button
                      type="submit"
                      form="waitlist-form"
                      disabled={waitlistLoading || waitlistSuccess}
                      className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white py-5 font-black text-gray-900 shadow-xl transition-all hover:bg-orange-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {waitlistLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
                      ) : waitlistSuccess ? (
                        'INSCRITO COM SUCESSO!'
                      ) : (
                        <>
                          ENTRAR NA LISTA DE ESPERA
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isLoading}
                      className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white py-5 font-black text-gray-900 shadow-xl transition-all hover:bg-orange-500 hover:text-white active:scale-95 disabled:opacity-70"
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
                  )}
                  <p className="mt-6 text-center font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                    <Sparkles className="mr-1 inline h-3 w-3 text-orange-500" />{' '}
                    {tab === 'waitlist'
                      ? 'Inscrição gratuita para teste de produção'
                      : '7 dias de garantia ou seu dinheiro de volta'}
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
