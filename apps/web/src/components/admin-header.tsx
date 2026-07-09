'use client'

import {
  ArrowLeft,
  BarChart,
  ChevronDown,
  CreditCard,
  Flame,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import { ProfileButton } from './profile-button'

interface AdminHeaderProps {
  user: {
    id?: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false)
  const systemMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    return pathname?.includes(path)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        systemMenuRef.current &&
        !systemMenuRef.current.contains(event.target as Node)
      ) {
        setIsSystemMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-40 border-gray-900/10 border-b bg-gray-900 text-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO & MODE */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="hidden font-black text-2xl text-white tracking-tighter sm:block">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          <div className="h-8 w-px bg-gray-800" />

          {/* DROPDOWN DE MUDANÇA DE CONTEXTO NO ADMIN TAMBÉM */}
          <div className="relative" ref={systemMenuRef}>
            <button
              type="button"
              onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
              className="flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2.5 ring-1 ring-orange-500/20 transition-all hover:bg-orange-500/20"
            >
              <Zap
                className="h-3.5 w-3.5 text-orange-500"
                fill="currentColor"
              />
              <span className="font-black text-[10px] text-orange-500 uppercase tracking-[0.2em]">
                System Mode
              </span>
              <ChevronDown
                className={`h-3 w-3 text-orange-500/50 transition-transform ${isSystemMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isSystemMenuOpen && (
              <div className="fade-in zoom-in-95 absolute left-0 z-50 mt-2 w-56 animate-in rounded-2xl border border-gray-800 bg-gray-900 p-2 shadow-2xl ring-1 ring-white/10 duration-150">
                <div className="mb-1 border-gray-800 border-b px-3 py-2">
                  <span className="font-black text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                    Navegação Rápida
                  </span>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-300 text-sm transition-colors hover:bg-white/5"
                >
                  <BarChart className="h-4 w-4 text-orange-500" /> Dashboard
                  Global
                </Link>
                <Link
                  href="/admin/clubs"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-300 text-sm transition-colors hover:bg-white/5"
                >
                  <Globe className="h-4 w-4 text-orange-500" /> Lista de Clubes
                </Link>
                <Link
                  href="/admin/billing"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-300 text-sm transition-colors hover:bg-white/5"
                >
                  <CreditCard className="h-4 w-4 text-orange-500" /> Financeiro
                </Link>
                <Link
                  href="/admin/dashboard/feedbacks"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-300 text-sm transition-colors hover:bg-white/5"
                >
                  <MessageSquare className="h-4 w-4 text-orange-500" />{' '}
                  Feedbacks
                </Link>
                <Link
                  href="/admin/dashboard/waitlist"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-300 text-sm transition-colors hover:bg-white/5"
                >
                  <Users className="h-4 w-4 text-orange-500" /> Lista de Espera
                </Link>
                <div className="my-1 border-gray-800 border-t" />
                <Link
                  href="/explore"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-400 text-sm transition-colors hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar ao App
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ADMIN NAV CENTRAL */}
        <div className="hidden items-center gap-2 font-bold text-gray-400 text-sm lg:flex">
          <Link
            href="/admin/dashboard"
            className={`flex h-20 cursor-pointer items-center gap-2 border-b-2 px-4 transition-all ${isActive('/admin/dashboard') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Métricas
          </Link>

          <Link
            href="/admin/clubs"
            className={`flex h-20 cursor-pointer items-center gap-2 border-b-2 px-4 transition-all ${isActive('/admin/clubs') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <Globe className="h-4 w-4" />
            Clubes
          </Link>

          <Link
            href="/admin/billing"
            className={`flex h-20 cursor-pointer items-center gap-2 border-b-2 px-4 transition-all ${isActive('/admin/billing') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <CreditCard className="h-4 w-4" />
            Financeiro
          </Link>

          <Link
            href="/admin/dashboard/feedbacks"
            className={`flex h-20 cursor-pointer items-center gap-2 border-b-2 px-4 transition-all ${isActive('/admin/dashboard/feedbacks') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <MessageSquare className="h-4 w-4" />
            Feedbacks
          </Link>

          <Link
            href="/admin/dashboard/waitlist"
            className={`flex h-20 cursor-pointer items-center gap-2 border-b-2 px-4 transition-all ${isActive('/admin/dashboard/waitlist') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <Users className="h-4 w-4" />
            Lista de Espera
          </Link>

          <Link
            href="/admin/settings"
            className={`flex h-20 cursor-pointer items-center gap-2 border-b-2 px-4 transition-all ${isActive('/admin/settings') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="group hidden items-center gap-2 font-bold text-gray-400 text-xs transition-colors hover:text-white sm:flex"
          >
            <ArrowLeft className="group-hover:-translate-x-1 h-3.5 w-3.5 transition-transform" />
            Sair do Admin
          </Link>

          <div className="h-8 w-px bg-gray-800" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="font-black text-[10px] text-orange-500 uppercase tracking-widest">
                Root Admin
              </span>
              <span className="font-bold text-white text-xs">{user.name}</span>
            </div>
            <ProfileButton user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}
