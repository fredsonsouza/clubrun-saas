'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Flame, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  TrendingUp, 
  LayoutDashboard,
  LayoutTemplate,
  Globe,
  Settings,
  UserPlus,
  Activity,
  Trophy,
  Zap
} from 'lucide-react'

const slides = [
  {
    title: "Experiência do Atleta",
    subtitle: "Dashboard & Feed Social",
    description: "Um centro de comando completo para o corredor. Registre treinos, acompanhe métricas de performance e interaja com sua comunidade através do feed social exclusivo do clube.",
    icon: <LayoutDashboard className="h-10 w-10 text-orange-500" />,
    color: "from-orange-500 to-amber-500",
    features: [
      "Registro detalhado de treinos (distância, pace, duração)",
      "Feed social com Kudos e comentários",
      "Métricas dinâmicas de progresso mensal",
      "Perfil de atleta personalizável"
    ]
  },
  {
    title: "Gestão de Assessorias",
    subtitle: "Controle Total do Treinador",
    description: "Ferramentas robustas para gerenciar múltiplos clubes, aprovar novos membros e acompanhar o crescimento da sua equipe em tempo real.",
    icon: <Users className="h-10 w-10 text-blue-500" />,
    color: "from-blue-500 to-indigo-500",
    features: [
      "Gestão centralizada de membros e cargos",
      "Sistema de convites por e-mail e WhatsApp",
      "Dashboard de métricas coletivas do clube",
      "Ranking de performance da assessoria"
    ]
  },
  {
    title: "Governança & Segurança",
    subtitle: "Transferência de Posse Segura",
    description: "Fluxos inteligentes de transferência de propriedade que garantem a integridade financeira e administrativa do clube automaticamente.",
    icon: <ShieldCheck className="h-10 w-10 text-emerald-500" />,
    color: "from-emerald-500 to-teal-500",
    features: [
      "Workflow seguro de transferência de dono",
      "Bloqueio administrativo por faturamento pendente",
      "Logs de auditoria para ações críticas",
      "Validação rigorosa de permissões (CASL)"
    ]
  },
  {
    title: "Faturamento & Monetização",
    subtitle: "Integração Stripe Completa",
    description: "Gestão automatizada de assinaturas e pagamentos, permitindo que a assessoria escale sem se preocupar com a burocracia financeira.",
    icon: <CreditCard className="h-10 w-10 text-purple-500" />,
    color: "from-purple-500 to-pink-500",
    features: [
      "Planos diferenciados para Atletas e Clubes",
      "Checkout transparente via Stripe",
      "Gestão automática de inadimplência",
      "Liberação instantânea de funcionalidades"
    ]
  },
  {
    title: "Alta Performance",
    subtitle: "Rankings & Gamificação",
    description: "Desperte a competitividade saudável com rankings automáticos e acompanhamento de recordes pessoais.",
    icon: <Trophy className="h-10 w-10 text-amber-500" />,
    color: "from-amber-500 to-yellow-500",
    features: [
      "Rankings semanais, mensais e anuais",
      "Filtros de performance por tipo de atividade",
      "Recordes e medalhas virtuais",
      "Integração de dados em tempo real"
    ]
  }
]

export default function ProjectTourPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-200 selection:bg-orange-500/30 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${slides[currentSlide].color} transition-all duration-1000`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 bg-gradient-to-br ${slides[currentSlide].color} transition-all duration-1000`} />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-110">
            <Flame className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Club<span className="text-orange-500">Run</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-orange-500' : 'w-2 bg-slate-700'}`}
              />
            ))}
          </div>
          <Link 
            href="/auth/sign-up"
            className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors"
          >
            Começar Agora
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-160px)] px-6 md:px-20 gap-12 lg:gap-20">
        
        {/* TEXT CONTENT */}
        <div className="w-full lg:w-1/2 flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold tracking-widest uppercase transition-colors duration-1000 text-orange-400`}>
              <Zap className="h-4 w-4" />
              Funcionalidade {currentSlide + 1} de {slides.length}
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-white">
              {slides[currentSlide].title}
            </h1>
            <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${slides[currentSlide].color} bg-clip-text text-transparent transition-all duration-1000`}>
              {slides[currentSlide].subtitle}
            </h2>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
              {slides[currentSlide].description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {slides[currentSlide].features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                <div className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br ${slides[currentSlide].color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <ChevronRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={prevSlide}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextSlide}
              className={`flex-1 md:w-64 flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r ${slides[currentSlide].color} text-white font-black text-lg shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95`}
            >
              Próximo Slide
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* VISUAL CONTENT / MOCKUP */}
        <div className="w-full lg:w-1/2 flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <div className="relative w-full max-w-lg aspect-square">
            {/* Visual elements representing the feature */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} rounded-[3rem] opacity-20 blur-[60px] animate-pulse`} />
            
            <div className="relative h-full w-full rounded-[3rem] border border-white/10 bg-slate-900/50 backdrop-blur-xl p-10 flex flex-col items-center justify-center text-center space-y-8 shadow-2xl overflow-hidden group">
               {/* Decorative grid */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               
               <div className={`relative h-32 w-32 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500`}>
                 {React.cloneElement(slides[currentSlide].icon as React.ReactElement<any>, { className: "h-16 w-16 text-white" })}
               </div>

               <div className="relative space-y-4">
                 <div className="h-2 w-32 mx-auto rounded-full bg-white/10" />
                 <div className="h-2 w-48 mx-auto rounded-full bg-white/5" />
                 <div className="h-2 w-24 mx-auto rounded-full bg-white/5" />
               </div>

               <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="h-16 rounded-2xl bg-white/5 border border-white/5" />
                 <div className="h-16 rounded-2xl bg-white/5 border border-white/5" />
               </div>
            </div>

            {/* Floating elements */}
            <div className={`absolute -top-4 -right-4 h-20 w-20 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-2xl animate-bounce duration-[3000ms]`}>
              <Activity className="h-10 w-10 text-orange-500" />
            </div>
            <div className={`absolute -bottom-6 -left-6 h-24 w-24 rounded-3xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-2xl animate-pulse`}>
              <TrendingUp className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER / CTAs */}
      <div className="relative z-10 px-6 md:px-20 pb-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 pt-12 mt-12">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-xs">Pronto para acelerar?</p>
          <p className="text-white font-black text-xl">Transforme sua assessoria hoje mesmo.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/auth/sign-in"
            className="px-8 py-3 rounded-2xl font-bold text-slate-300 hover:text-white transition-colors"
          >
            Fazer Login
          </Link>
          <Link 
            href="/auth/sign-up"
            className="px-8 py-3 rounded-2xl bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
          >
            Cadastrar Gratuitamente
          </Link>
        </div>
      </div>
    </div>
  )
}
