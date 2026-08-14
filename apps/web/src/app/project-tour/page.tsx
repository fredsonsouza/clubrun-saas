'use client'

import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Flame,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  Settings,
  ShieldCheck,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

const slides = [
  {
    title: 'Experiência do Atleta',
    subtitle: 'Dashboard & Feed Social',
    description:
      'Um centro de comando completo para o corredor. Registre treinos, acompanhe métricas de performance e interaja com sua comunidade através do feed social exclusivo do clube.',
    icon: <LayoutDashboard className="h-10 w-10 text-orange-500" />,
    color: 'from-orange-500 to-amber-500',
    features: [
      'Registro detalhado de treinos (distância, pace, duração)',
      'Feed social com Kudos e comentários',
      'Métricas dinâmicas de progresso mensal',
      'Perfil de atleta personalizável',
    ],
  },
  {
    title: 'Gestão de Assessorias',
    subtitle: 'Controle Total do Treinador',
    description:
      'Ferramentas robustas para gerenciar múltiplos clubes, aprovar novos membros e acompanhar o crescimento da sua equipe em tempo real.',
    icon: <Users className="h-10 w-10 text-blue-500" />,
    color: 'from-blue-500 to-indigo-500',
    features: [
      'Gestão centralizada de membros e cargos',
      'Sistema de convites por e-mail e WhatsApp',
      'Dashboard de métricas coletivas do clube',
      'Ranking de performance da assessoria',
    ],
  },
  {
    title: 'Governança & Segurança',
    subtitle: 'Transferência de Posse Segura',
    description:
      'Fluxos inteligentes de transferência de propriedade que garantem a integridade financeira e administrativa do clube automaticamente.',
    icon: <ShieldCheck className="h-10 w-10 text-emerald-500" />,
    color: 'from-emerald-500 to-teal-500',
    features: [
      'Workflow seguro de transferência de dono',
      'Bloqueio administrativo por faturamento pendente',
      'Logs de auditoria para ações críticas',
      'Validação rigorosa de permissões (CASL)',
    ],
  },
  {
    title: 'Faturamento & Monetização',
    subtitle: 'Integração Stripe Completa',
    description:
      'Gestão automatizada de assinaturas e pagamentos, permitindo que a assessoria escale sem se preocupar com a burocracia financeira.',
    icon: <CreditCard className="h-10 w-10 text-purple-500" />,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Planos diferenciados para Atletas e Clubes',
      'Checkout transparente via Stripe',
      'Gestão automática de inadimplência',
      'Liberação instantânea de funcionalidades',
    ],
  },
  {
    title: 'Alta Performance',
    subtitle: 'Rankings & Gamificação',
    description:
      'Desperte a competitividade saudável com rankings automáticos e acompanhamento de recordes pessoais.',
    icon: <Trophy className="h-10 w-10 text-amber-500" />,
    color: 'from-amber-500 to-yellow-500',
    features: [
      'Rankings semanais, mensais e anuais',
      'Filtros de performance por tipo de atividade',
      'Recordes e medalhas virtuais',
      'Integração de dados em tempo real',
    ],
  },
]

export default function ProjectTourPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="min-h-screen overflow-hidden bg-[#0f172a] font-sans text-slate-200 selection:bg-orange-500/30">
      {/* Background Decor */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-gradient-to-br opacity-20 blur-[120px] ${slides[currentSlide].color} transition-all duration-1000`}
        />
        <div
          className={`absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-gradient-to-br opacity-10 blur-[120px] ${slides[currentSlide].color} transition-all duration-1000`}
        />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-110">
            <Flame className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">
            Club<span className="text-orange-500">Run</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-1 md:flex">
            {slides.map((slide, i) => (
              <div
                key={slide.title}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-orange-500' : 'w-2 bg-slate-700'}`}
              />
            ))}
          </div>
          <Link
            href="/auth/sign-up"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 font-bold text-sm transition-colors hover:bg-white/10"
          >
            Começar Agora
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-160px)] flex-col items-center justify-center gap-12 px-6 md:px-20 lg:flex-row lg:gap-20">
        {/* TEXT CONTENT */}
        <div className="fade-in slide-in-from-left-8 flex w-full animate-in flex-col items-start space-y-8 duration-700 lg:w-1/2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-orange-400 text-sm uppercase tracking-widest transition-colors duration-1000">
              <Zap className="h-4 w-4" />
              Funcionalidade {currentSlide + 1} de {slides.length}
            </div>
            <h1 className="font-black text-5xl text-white leading-tight tracking-tighter md:text-7xl">
              {slides[currentSlide].title}
            </h1>
            <h2
              className={`bg-gradient-to-r font-bold text-2xl md:text-3xl ${slides[currentSlide].color} bg-clip-text text-transparent transition-all duration-1000`}
            >
              {slides[currentSlide].subtitle}
            </h2>
            <p className="max-w-xl text-lg text-slate-400 leading-relaxed md:text-xl">
              {slides[currentSlide].description}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            {slides[currentSlide].features.map((feature) => (
              <div
                key={feature}
                className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-white/10"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${slides[currentSlide].color} opacity-80 transition-opacity group-hover:opacity-100`}
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-slate-300 text-sm">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              aria-label="Slide anterior"
              onClick={prevSlide}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 active:scale-90"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className={`flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r py-4 md:w-64 ${slides[currentSlide].color} font-black text-lg text-white shadow-orange-500/10 shadow-xl transition-all hover:scale-[1.02] hover:shadow-orange-500/20 active:scale-95`}
            >
              Próximo Slide
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* VISUAL CONTENT / MOCKUP */}
        <div className="fade-in zoom-in-95 flex w-full animate-in items-center justify-center delay-200 duration-1000 lg:w-1/2">
          <div className="relative aspect-square w-full max-w-lg">
            {/* Visual elements representing the feature */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} animate-pulse rounded-[3rem] opacity-20 blur-[60px]`}
            />

            <div className="group relative flex h-full w-full flex-col items-center justify-center space-y-8 overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/50 p-10 text-center shadow-2xl backdrop-blur-xl">
              {/* Decorative grid */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

              <div
                className={`relative h-32 w-32 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex transform items-center justify-center shadow-2xl transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110`}
              >
                {React.cloneElement(
                  slides[currentSlide].icon as React.ReactElement<any>,
                  { className: 'h-16 w-16 text-white' }
                )}
              </div>

              <div className="relative space-y-4">
                <div className="mx-auto h-2 w-32 rounded-full bg-white/10" />
                <div className="mx-auto h-2 w-48 rounded-full bg-white/5" />
                <div className="mx-auto h-2 w-24 rounded-full bg-white/5" />
              </div>

              <div className="grid w-full grid-cols-2 gap-4">
                <div className="h-16 rounded-2xl border border-white/5 bg-white/5" />
                <div className="h-16 rounded-2xl border border-white/5 bg-white/5" />
              </div>
            </div>

            {/* Floating elements */}
            <div className="-top-4 -right-4 absolute flex h-20 w-20 animate-bounce items-center justify-center rounded-2xl border border-white/10 bg-slate-800 shadow-2xl duration-[3000ms]">
              <Activity className="h-10 w-10 text-orange-500" />
            </div>
            <div className="-bottom-6 -left-6 absolute flex h-24 w-24 animate-pulse items-center justify-center rounded-3xl border border-white/10 bg-slate-800 shadow-2xl">
              <TrendingUp className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER / CTAs */}
      <div className="relative z-10 mt-12 flex flex-col items-center justify-between gap-8 border-white/5 border-t px-6 pt-12 pb-12 md:flex-row md:px-20">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <p className="mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">
            Pronto para acelerar?
          </p>
          <p className="font-black text-white text-xl">
            Transforme sua assessoria hoje mesmo.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/sign-in"
            className="rounded-2xl px-8 py-3 font-bold text-slate-300 transition-colors hover:text-white"
          >
            Fazer Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-2xl bg-orange-500 px-8 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105 hover:bg-orange-600 active:scale-95"
          >
            Cadastrar Gratuitamente
          </Link>
        </div>
      </div>
    </div>
  )
}
