'use client'

import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  Flame,
  MapPin,
  Medal,
  Menu,
  Star,
  TrendingUp,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Estado para controlar qual tabela de preços exibir
  const [pricingView, setPricingView] = useState<'runner' | 'club'>('runner')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden scroll-smooth bg-gray-50 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      {/* =========================================
          NAVBAR
      ========================================= */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'border-gray-200 border-b bg-white/90 py-3 shadow-sm backdrop-blur-md'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 font-bold text-gray-600 text-sm md:flex">
            <a
              href="#funcionalidades"
              className="cursor-pointer transition-colors hover:text-orange-500"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="cursor-pointer transition-colors hover:text-orange-500"
            >
              Como Funciona
            </a>
            <a
              href="#planos"
              className="cursor-pointer transition-colors hover:text-orange-500"
            >
              Planos
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth/sign-in"
              className="cursor-pointer font-bold text-gray-600 text-sm transition-colors hover:text-gray-900"
            >
              Fazer Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="hover:-translate-y-0.5 cursor-pointer rounded-full bg-gray-900 px-6 py-2.5 font-bold text-sm text-white shadow-md transition-all hover:bg-gray-800"
            >
              Criar Conta
            </Link>
          </div>

          <button
            type="button"
            aria-label="Abrir menu"
            className="cursor-pointer p-2 text-gray-600 transition-colors hover:text-orange-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="slide-in-from-top-4 absolute top-full left-0 flex w-full animate-in flex-col gap-4 border-gray-200 border-b bg-white px-4 py-4 shadow-lg md:hidden">
            <button
              type="button"
              onClick={() => scrollToSection('funcionalidades')}
              className="cursor-pointer rounded-lg p-2 text-left font-bold text-gray-700 hover:bg-gray-50"
            >
              Funcionalidades
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('como-funciona')}
              className="cursor-pointer rounded-lg p-2 text-left font-bold text-gray-700 hover:bg-gray-50"
            >
              Como Funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('planos')}
              className="cursor-pointer rounded-lg p-2 text-left font-bold text-gray-700 hover:bg-gray-50"
            >
              Planos
            </button>
            <div className="my-2 h-px bg-gray-100" />
            <Link
              href="/auth/sign-in"
              className="cursor-pointer rounded-xl border border-gray-200 py-3 text-center font-bold text-gray-700"
            >
              Fazer Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="cursor-pointer rounded-xl bg-orange-500 py-3 text-center font-bold text-white shadow-md shadow-orange-500/20"
            >
              Criar Conta
            </Link>
          </div>
        )}
      </nav>

      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="-z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="fade-in slide-in-from-bottom-4 mb-8 inline-flex animate-in items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5 font-bold text-orange-600 text-xs uppercase tracking-wider shadow-sm duration-500">
            <Zap className="h-4 w-4 fill-current" />
            <span>A plataforma definitiva para corredores e assessorias</span>
          </div>

          <h1 className="fade-in slide-in-from-bottom-6 mb-6 max-w-4xl animate-in font-extrabold text-5xl text-gray-900 leading-[1.1] tracking-tight delay-100 duration-700 md:text-7xl">
            Sua comunidade de corrida, <br className="hidden md:block" />
            <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              agora em alta performance.
            </span>
          </h1>

          <p className="fade-in slide-in-from-bottom-8 mb-10 max-w-2xl animate-in font-medium text-gray-500 text-lg leading-relaxed delay-200 duration-700 md:text-xl">
            Conecte-se com sua assessoria, registre seus treinos, domine os
            rankings e gerencie sua equipe em um ambiente feito para quem
            respira asfalto e trilha.
          </p>

          <div className="fade-in slide-in-from-bottom-10 flex w-full animate-in flex-col justify-center gap-4 delay-300 duration-700 sm:w-auto sm:flex-row">
            <Link
              href="/auth/sign-up?role=athlete"
              className="group flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 font-bold text-lg text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:bg-orange-600"
            >
              Sou Corredor
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/sign-up?role=owner"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 text-lg shadow-sm transition-all hover:scale-105 hover:border-orange-200 hover:bg-gray-50 hover:text-orange-500"
            >
              <Crown className="h-5 w-5" /> Sou Treinador
            </Link>
          </div>

          {/* VISUAL HERO CARDS */}
          <div className="fade-in slide-in-from-bottom-12 mx-auto mt-20 grid w-full max-w-4xl animate-in grid-cols-1 gap-6 delay-500 duration-1000 md:grid-cols-3">
            <div className="hover:-translate-y-6 md:-translate-y-4 flex transform flex-col items-start rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-transform">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="mb-1 font-bold text-gray-900 text-sm">
                Tiroteio na Pista
              </p>
              <div className="mt-4 flex w-full items-end justify-between">
                <div>
                  <span className="mb-1 block font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                    Pace Médio
                  </span>
                  <span className="font-light text-2xl text-gray-900 tracking-tight">
                    4:15{' '}
                    <span className="font-bold text-gray-400 text-sm">/km</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex transform flex-col items-center justify-center rounded-3xl bg-linear-to-b from-orange-500 to-orange-600 p-6 text-white shadow-2xl shadow-orange-500/20 transition-transform hover:translate-y-2 md:translate-y-4">
              <Trophy className="mb-3 h-10 w-10 text-orange-200" />
              <p className="mb-1 font-bold text-orange-100 text-sm uppercase tracking-widest">
                Líder da Semana
              </p>
              <h3 className="mb-4 font-extrabold text-2xl">Carlos Silva</h3>
              <div className="rounded-xl bg-black/20 px-4 py-2 backdrop-blur-sm">
                <span className="font-bold">42.5 km</span> registrados
              </div>
            </div>

            <div className="hover:-translate-y-10 md:-translate-y-8 flex transform flex-col items-start rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-transform">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <p className="mb-1 font-bold text-gray-900 text-sm">
                Membros Ativos
              </p>
              <div className="mt-4 flex w-full items-end justify-between">
                <div>
                  <span className="mb-1 block font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                    Neste Mês
                  </span>
                  <span className="font-extrabold text-3xl text-gray-900 tracking-tight">
                    84
                  </span>
                </div>
                <div className="rounded-lg bg-green-50 px-2 py-1 font-bold text-green-600 text-xs">
                  +12%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SOCIAL PROOF
      ========================================= */}
      <section className="border-gray-200 border-y bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center font-bold text-gray-400 text-sm uppercase tracking-widest">
            Corredores e Assessorias que confiam na gente
          </p>
          <div className="grid grid-cols-2 gap-8 divide-x divide-gray-100 text-center md:grid-cols-4">
            <div>
              <span className="mb-1 block font-extrabold text-4xl text-gray-900">
                50+
              </span>
              <span className="font-bold text-gray-500 text-xs uppercase">
                Clubes Ativos
              </span>
            </div>
            <div>
              <span className="mb-1 block font-extrabold text-4xl text-gray-900">
                12k
              </span>
              <span className="font-bold text-gray-500 text-xs uppercase">
                Atletas Cadastrados
              </span>
            </div>
            <div>
              <span className="mb-1 block font-extrabold text-4xl text-orange-500">
                85k
              </span>
              <span className="font-bold text-gray-500 text-xs uppercase">
                KM Percorridos
              </span>
            </div>
            <div>
              <span className="mb-1 block font-extrabold text-4xl text-gray-900">
                4.9
              </span>
              <span className="mt-1 flex items-center justify-center text-orange-400 text-sm">
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FUNCIONALIDADES
      ========================================= */}
      <section id="funcionalidades" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="font-extrabold text-3xl text-gray-900 md:text-4xl">
              Tudo o que você precisa para evoluir
            </h2>
            <p className="mt-4 font-medium text-gray-500 text-lg">
              Ferramentas desenhadas sob medida para atletas focados e
              treinadores exigentes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feat 1 */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-extrabold text-gray-900 text-xl">
                Rankings Dinâmicos
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Classificações automáticas por distância semanal, mensal e
                anual. Desperte a competição saudável na sua equipe.
              </p>
            </div>
            {/* Feat 2 */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-extrabold text-gray-900 text-xl">
                Gestão de Provas
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Crie o calendário alvo da assessoria, acompanhe as confirmações
                e registre os tempos oficiais de cada atleta.
              </p>
            </div>
            {/* Feat 3 */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-extrabold text-gray-900 text-xl">
                Feed Social do Clube
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Um mural exclusivo para a sua equipe. Dê kudos, comente e
                interaja com os treinos diários dos seus parceiros.
              </p>
            </div>
            {/* Feat 4 */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Crown className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-extrabold text-gray-900 text-xl">
                Controle de Membros
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Aprove convites, gerencie inadimplência e atribua cargos de
                administrador para o seu staff de treinadores.
              </p>
            </div>
            {/* Feat 5 */}
            <div className="rounded-3xl border border-gray-100 bg-gradient-to-br bg-white from-gray-900 to-gray-800 p-8 text-white shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700 text-white">
                <Medal className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-extrabold text-white text-xl">
                Métricas Pessoais de Performance
              </h3>
              <p className="max-w-xl font-medium text-gray-300 leading-relaxed">
                O seu perfil não é só um nome. Acompanhe a sua evolução de pace,
                o histórico de distâncias e guarde o seu portfólio de medalhas e
                resultados num só lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          COMO FUNCIONA
      ========================================= */}
      <section
        id="como-funciona"
        className="border-gray-100 border-t bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-extrabold text-3xl text-gray-900 md:text-4xl">
              Fácil de começar. Impossível de parar.
            </h2>
            <p className="mt-4 font-medium text-gray-500 text-lg">
              Veja como é simples colocar a sua equipe para rodar no ClubRun.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Linha conectora (Desktop) */}
            <div className="absolute top-8 right-1/6 left-1/6 z-0 hidden h-0.5 bg-orange-100 md:block" />

            {/* Passo 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-100 bg-white font-black text-orange-500 text-xl shadow-sm">
                1
              </div>
              <h3 className="mb-2 font-extrabold text-gray-900 text-xl">
                Crie sua Conta
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Defina o seu perfil de corredor ou crie o espaço oficial da sua
                assessoria desportiva.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-100 bg-white font-black text-orange-500 text-xl shadow-sm">
                2
              </div>
              <h3 className="mb-2 font-extrabold text-gray-900 text-xl">
                Conecte o Pelotão
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Partilhe o link do clube no WhatsApp e veja os atletas a
                entrarem para a equipa.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-200 bg-orange-500 font-black text-white text-xl shadow-lg shadow-orange-500/30">
                3
              </div>
              <h3 className="mb-2 font-extrabold text-gray-900 text-xl">
                Acelere Juntos
              </h3>
              <p className="font-medium text-gray-500 leading-relaxed">
                Registem treinos, subam no ranking mensal e preparem-se para as
                próximas provas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PLANOS
      ========================================= */}
      <section
        id="planos"
        className="border-gray-200 border-t bg-gray-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-extrabold text-3xl text-gray-900 md:text-4xl">
            Planos acessíveis para todos
          </h2>
          <p className="mb-10 font-medium text-gray-500 text-lg">
            A escolha certa para você superar seus limites ou profissionalizar
            sua assessoria.
          </p>

          {/* TOGGLE (Corredor vs Clube) */}
          <div className="mx-auto mb-16 inline-flex rounded-2xl bg-gray-200/60 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setPricingView('runner')}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-sm transition-all duration-300 ${pricingView === 'runner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <User className="h-4 w-4" /> Para Corredores
            </button>
            <button
              type="button"
              onClick={() => setPricingView('club')}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-sm transition-all duration-300 ${pricingView === 'club' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Crown className="h-4 w-4" /> Para Assessorias
            </button>
          </div>

          {/* VIEWS DOS PLANOS */}
          <div className="fade-in zoom-in-95 animate-in duration-500">
            {/* VIEW 1: CORREDOR */}
            {pricingView === 'runner' && (
              <div className="mx-auto max-w-lg">
                <div className="relative flex flex-col rounded-3xl border-2 border-orange-500 bg-white p-10 text-left shadow-orange-500/10 shadow-xl">
                  <div className="-translate-y-1/2 absolute top-0 right-8 rounded-full bg-orange-500 px-3 py-1 font-bold text-white text-xs uppercase tracking-wider">
                    Acesso Total
                  </div>
                  <span className="mb-2 font-bold text-orange-500 text-sm uppercase tracking-wider">
                    Atleta Premium
                  </span>
                  <h3 className="mb-4 font-extrabold text-3xl text-gray-900">
                    ClubRun Pass
                  </h3>

                  <div className="mb-8">
                    <span className="font-extrabold text-5xl text-gray-900">
                      R$ 19,90
                    </span>
                    <span className="font-medium text-gray-500">/mês</span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-4">
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Participe de clubes e assessorias
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Dispute o ranking mensal e anual
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Registro detalhado de treinos e pace
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Feed social, kudos e comentários
                    </li>
                  </ul>

                  <Link
                    href="/auth/sign-up?role=athlete&plan=premium"
                    className="w-full cursor-pointer rounded-2xl bg-orange-500 py-4 text-center font-bold text-white shadow-md transition-colors hover:bg-orange-600"
                  >
                    Quero ser Premium
                  </Link>
                  <p className="mt-4 text-center font-bold text-gray-400 text-xs uppercase tracking-widest">
                    Cancele quando quiser
                  </p>
                </div>
              </div>
            )}

            {/* VIEW 2: ASSESSORIA / CLUBES */}
            {pricingView === 'club' && (
              <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 text-left md:grid-cols-3">
                {/* PLANO Starter */}
                <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-colors hover:border-gray-300">
                  <span className="mb-2 font-bold text-gray-500 text-sm uppercase tracking-wider">
                    Grupos Menores
                  </span>
                  <h3 className="mb-4 font-extrabold text-2xl text-gray-900">
                    Starter
                  </h3>
                  <div className="mb-8">
                    <span className="font-extrabold text-5xl text-gray-900">
                      R$ 24<span className="text-3xl">,90</span>
                    </span>
                    <span className="font-medium text-gray-500">/mês</span>
                  </div>
                  <ul className="mb-8 flex-1 space-y-4">
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />{' '}
                      Até 30 atletas ativos
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />{' '}
                      1 Clube Exclusivo
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />{' '}
                      Dashboard do Treinador
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />{' '}
                      Aprovação de Convites
                    </li>
                  </ul>
                  <Link
                    href="/auth/sign-up?role=owner&plan=starter"
                    className="w-full cursor-pointer rounded-2xl bg-gray-100 py-4 text-center font-bold text-gray-900 transition-colors hover:bg-gray-200"
                  >
                    Começar Starter
                  </Link>
                </div>

                {/* PLANO Pro */}
                <div className="md:-translate-y-4 relative flex flex-col rounded-3xl border-2 border-orange-500 bg-white p-8 shadow-orange-500/10 shadow-xl">
                  <div className="-translate-y-1/2 absolute top-0 right-8 rounded-full bg-orange-500 px-3 py-1 font-bold text-white text-xs uppercase tracking-wider">
                    Mais Escolhido
                  </div>
                  <span className="mb-2 font-bold text-orange-500 text-sm uppercase tracking-wider">
                    Assessorias
                  </span>
                  <h3 className="mb-4 font-extrabold text-2xl text-gray-900">
                    Clube Pro
                  </h3>
                  <div className="mb-8">
                    <span className="font-extrabold text-5xl text-gray-900">
                      R$ 49<span className="text-3xl">,90</span>
                    </span>
                    <span className="font-medium text-gray-500">/mês</span>
                  </div>
                  <ul className="mb-8 flex-1 space-y-4">
                    <li className="flex items-center gap-3 font-bold text-gray-900">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Até 100 atletas ativos
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Gestão de Provas e Eventos
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Múltiplos Administradores
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                      Verificação de Inadimplência
                    </li>
                  </ul>
                  <Link
                    href="/auth/sign-up?role=owner&plan=pro"
                    className="w-full cursor-pointer rounded-2xl bg-orange-500 py-4 text-center font-bold text-white shadow-md transition-colors hover:bg-orange-600"
                  >
                    Assinar Pro
                  </Link>
                </div>

                {/* PLANO Elite */}
                <div className="flex flex-col rounded-3xl bg-gray-900 p-8 shadow-xl transition-colors hover:bg-gray-800">
                  <span className="mb-2 flex items-center gap-2 font-bold text-gray-400 text-sm uppercase tracking-wider">
                    <Crown className="h-4 w-4 text-amber-500" /> Profissional
                  </span>
                  <h3 className="mb-4 font-extrabold text-2xl text-white">
                    Elite
                  </h3>
                  <div className="mb-8">
                    <span className="font-extrabold text-5xl text-white">
                      R$ 99<span className="text-3xl text-gray-400">,90</span>
                    </span>
                    <span className="font-medium text-gray-400">/mês</span>
                  </div>
                  <ul className="mb-8 flex-1 space-y-4">
                    <li className="flex items-center gap-3 font-medium text-gray-300">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />{' '}
                      Atletas Ilimitados
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-300">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />{' '}
                      Tudo do plano Pro
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-300">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />{' '}
                      Domínio Personalizado
                    </li>
                    <li className="flex items-center gap-3 font-medium text-gray-300">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />{' '}
                      Suporte Prioritário VIP
                    </li>
                  </ul>
                  <Link
                    href="/auth/sign-up?role=owner&plan=elite"
                    className="w-full cursor-pointer rounded-2xl bg-white py-4 text-center font-bold text-gray-900 transition-colors hover:bg-gray-100"
                  >
                    Assinar Elite
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-gray-200 border-t bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" fill="currentColor" />
            <span className="font-extrabold text-gray-900 text-xl tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-medium text-gray-500 text-sm">
            <Link
              href="#"
              className="cursor-pointer transition-colors hover:text-gray-900"
            >
              Termos de Uso
            </Link>
            <Link
              href="#"
              className="cursor-pointer transition-colors hover:text-gray-900"
            >
              Privacidade
            </Link>
            <Link
              href="#"
              className="cursor-pointer transition-colors hover:text-gray-900"
            >
              Contato
            </Link>
          </div>
          <p className="font-bold text-gray-400 text-sm uppercase tracking-widest">
            © 2026 ClubRun SaaS
          </p>
        </div>
      </footer>
    </div>
  )
}
