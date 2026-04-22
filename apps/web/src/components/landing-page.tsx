'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Menu,
  Star,
  Trophy,
  Users,
  X,
  Zap,
  MapPin,
  Crown,
} from 'lucide-react'

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 font-sans text-gray-900 selection:bg-orange-500 selection:text-white">
      {/* =========================================
          NAVBAR
      ========================================= */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'border-b border-gray-200 bg-white/90 py-3 shadow-sm backdrop-blur-md'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-gray-600 md:flex">
            <a
              href="#funcionalidades"
              className="transition-colors hover:text-orange-500 cursor-pointer"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="transition-colors hover:text-orange-500 cursor-pointer"
            >
              Como Funciona
            </a>
            <a
              href="#planos"
              className="transition-colors hover:text-orange-500 cursor-pointer"
            >
              Planos
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth/sign-in"
              className="text-sm font-bold text-gray-600 transition-colors hover:text-gray-900 cursor-pointer"
            >
              Fazer Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-800 cursor-pointer"
            >
              Criar Clube
            </Link>
          </div>

          <button
            className="p-2 text-gray-600 transition-colors hover:text-orange-500 md:hidden cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="animate-in slide-in-from-top-4 absolute top-full left-0 flex w-full flex-col gap-4 border-b border-gray-200 bg-white px-4 py-4 shadow-lg md:hidden">
            <a
              href="#funcionalidades"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg p-2 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Funcionalidades
            </a>
            <a
              href="#planos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg p-2 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Planos
            </a>
            <div className="my-2 h-px bg-gray-100" />
            <Link
              href="/auth/sign-in"
              className="rounded-xl border border-gray-200 py-3 text-center font-bold text-gray-700 cursor-pointer"
            >
              Fazer Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-xl bg-orange-500 py-3 text-center font-bold text-white shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Criar Clube Grátis
            </Link>
          </div>
        )}
      </nav>

      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-8 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5 text-xs font-bold tracking-wider text-orange-600 uppercase shadow-sm duration-500">
            <Zap className="h-4 w-4 fill-current" />
            <span>A plataforma definitiva para assessorias esportivas</span>
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-6 mb-6 max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight text-gray-900 delay-100 duration-700 md:text-7xl">
            Sua comunidade de corrida, <br className="hidden md:block" />
            <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              agora em alta performance.
            </span>
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-8 mb-10 max-w-2xl text-lg leading-relaxed font-medium text-gray-500 delay-200 duration-700 md:text-xl">
            Gerencie seu clube, acompanhe os treinos da sua equipe e crie
            rankings automáticos em um ambiente feito para quem respira asfalto
            e trilha.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-10 flex w-full flex-col gap-4 delay-300 duration-700 sm:w-auto sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:bg-orange-600 cursor-pointer"
            >
              Começar Agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#funcionalidades"
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 cursor-pointer"
            >
              Conhecer Plataforma
            </Link>
          </div>

          {/* VISUAL ELEGANTE E PRÁTICO */}
          <div className="animate-in fade-in slide-in-from-bottom-12 mx-auto mt-20 grid w-full max-w-4xl grid-cols-1 gap-6 delay-500 duration-1000 md:grid-cols-3">
            {/* Card 1: Registro de Treino */}
            <div className="flex transform flex-col items-start rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-transform hover:-translate-y-6 md:-translate-y-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="mb-1 text-sm font-bold text-gray-900">
                Tiroteio na Pista
              </p>
              <div className="mt-4 flex w-full items-end justify-between">
                <div>
                  <span className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Pace Médio
                  </span>
                  <span className="text-2xl font-light tracking-tight text-gray-900">
                    4:15{' '}
                    <span className="text-sm font-bold text-gray-400">/km</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Destaque / Ranking */}
            <div className="flex transform flex-col items-center justify-center rounded-3xl bg-linear-to-b from-orange-500 to-orange-600 p-6 text-white shadow-2xl shadow-orange-500/20 transition-transform hover:translate-y-2 md:translate-y-4">
              <Trophy className="mb-3 h-10 w-10 text-orange-200" />
              <p className="mb-1 text-sm font-bold tracking-widest text-orange-100 uppercase">
                Líder da Semana
              </p>
              <h3 className="mb-4 text-2xl font-extrabold">Carlos Silva</h3>
              <div className="rounded-xl bg-black/20 px-4 py-2 backdrop-blur-sm">
                <span className="font-bold">42.5 km</span> registrados
              </div>
            </div>

            {/* Card 3: Crescimento do Clube */}
            <div className="flex transform flex-col items-start rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-transform hover:-translate-y-10 md:-translate-y-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <p className="mb-1 text-sm font-bold text-gray-900">
                Membros Ativos
              </p>
              <div className="mt-4 flex w-full items-end justify-between">
                <div>
                  <span className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Neste Mês
                  </span>
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                    84
                  </span>
                </div>
                <div className="rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
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
      <section className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-bold tracking-widest text-gray-400 uppercase">
            Assessoria e Clubes que confiam na gente
          </p>
          <div className="grid grid-cols-2 gap-8 divide-x divide-gray-100 text-center md:grid-cols-4">
            <div>
              <span className="mb-1 block text-4xl font-extrabold text-gray-900">
                50+
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">
                Clubes Ativos
              </span>
            </div>
            <div>
              <span className="mb-1 block text-4xl font-extrabold text-gray-900">
                12k
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">
                Atletas Cadastrados
              </span>
            </div>
            <div>
              <span className="mb-1 block text-4xl font-extrabold text-orange-500">
                85k
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">
                KM Percorridos
              </span>
            </div>
            <div>
              <span className="mb-1 block text-4xl font-extrabold text-gray-900">
                4.9
              </span>
              <span className="mt-1 flex items-center justify-center text-sm text-orange-400">
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
          PLANOS
      ========================================= */}
      <section
        id="planos"
        className="border-t border-gray-200 bg-gray-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl">
            Planos sob medida para o seu pelotão
          </h2>
          <p className="mb-16 text-lg font-medium text-gray-500">
            Seja um grupo de amigos ou uma grande assessoria esportiva
            profissional.
          </p>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 text-left md:grid-cols-3">
            {/* PLANO 1: Iniciante */}
            <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-colors hover:border-gray-300">
              <span className="mb-2 text-sm font-bold tracking-wider text-gray-500 uppercase">
                Iniciante
              </span>
              <h3 className="mb-4 text-2xl font-extrabold text-gray-900">
                Gratuito
              </h3>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-gray-900">
                  R$ 0
                </span>
                <span className="font-medium text-gray-500">/mês</span>
              </div>
              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-center gap-3 font-medium text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />{' '}
                  Até 15 atletas
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" /> 1
                  Clube
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />{' '}
                  Ranking Mensal Básico
                </li>
              </ul>
              <Link
                href="/auth/sign-up"
                className="w-full rounded-2xl bg-gray-100 py-4 text-center font-bold text-gray-900 transition-colors hover:bg-gray-200 cursor-pointer"
              >
                Começar Grátis
              </Link>
            </div>

            {/* PLANO 2: Pro */}
            <div className="relative flex flex-col rounded-3xl border-2 border-orange-500 bg-white p-8 shadow-xl shadow-orange-500/10 md:-translate-y-4">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                Mais Escolhido
              </div>
              <span className="mb-2 text-sm font-bold tracking-wider text-orange-500 uppercase">
                Performance
              </span>
              <h3 className="mb-4 text-2xl font-extrabold text-gray-900">
                Clube Pro
              </h3>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-gray-900">
                  R$ 49
                </span>
                <span className="font-medium text-gray-500">/mês</span>
              </div>
              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-center gap-3 font-bold text-gray-900">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                  Atletas Ilimitados
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                  Rankings Customizados (Semana, Ano)
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                  Perfis de Treinador (Manager)
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
                  Exportação de Relatórios
                </li>
              </ul>
              <Link
                href="/auth/sign-up"
                className="w-full rounded-2xl bg-orange-500 py-4 text-center font-bold text-white shadow-md transition-colors hover:bg-orange-600 cursor-pointer"
              >
                Assinar Pro
              </Link>
            </div>

            {/* PLANO 3: Elite */}
            <div className="flex flex-col rounded-3xl bg-gray-900 p-8 shadow-xl transition-colors hover:bg-gray-800">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                <Crown className="h-4 w-4 text-amber-500" /> Assessorias
              </span>
              <h3 className="mb-4 text-2xl font-extrabold text-white">Elite</h3>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">
                  R$ 99
                </span>
                <span className="font-medium text-gray-400">/mês</span>
              </div>
              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-center gap-3 font-medium text-gray-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />{' '}
                  Tudo do plano Pro
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />{' '}
                  Gestão Financeira (Mensalidades)
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
                href="/auth/sign-up"
                className="w-full rounded-2xl bg-white py-4 text-center font-bold text-gray-900 transition-colors hover:bg-gray-100 cursor-pointer"
              >
                Assinar Elite
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" fill="currentColor" />
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Club<span className="text-orange-500">Run</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
            <Link href="#" className="transition-colors hover:text-gray-900 cursor-pointer">
              Termos de Uso
            </Link>
            <Link href="#" className="transition-colors hover:text-gray-900 cursor-pointer">
              Privacidade
            </Link>
            <Link href="#" className="transition-colors hover:text-gray-900 cursor-pointer">
              Contato
            </Link>
          </div>
          <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
            © 2026 ClubRun SaaS
          </p>
        </div>
      </footer>
    </div>
  )
}
