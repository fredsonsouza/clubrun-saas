'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Flame, 
  LayoutDashboard, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  ChevronDown,
  Globe,
  Settings,
  BarChart,
} from 'lucide-react'
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
      if (systemMenuRef.current && !systemMenuRef.current.contains(event.target as Node)) {
        setIsSystemMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-900/10 bg-gray-900 text-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO & MODE */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="hidden text-2xl font-black tracking-tighter text-white sm:block">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          <div className="h-8 w-px bg-gray-800"></div>

          {/* DROPDOWN DE MUDANÇA DE CONTEXTO NO ADMIN TAMBÉM */}
          <div className="relative" ref={systemMenuRef}>
            <button 
              onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
              className="flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2.5 ring-1 ring-orange-500/20 transition-all hover:bg-orange-500/20"
            >
              <Zap className="h-3.5 w-3.5 text-orange-500" fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">System Mode</span>
              <ChevronDown className={`h-3 w-3 text-orange-500/50 transition-transform ${isSystemMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSystemMenuOpen && (
              <div className="animate-in fade-in zoom-in-95 absolute left-0 z-50 mt-2 w-56 rounded-2xl border border-gray-800 bg-gray-900 p-2 shadow-2xl duration-150 ring-1 ring-white/10">
                <div className="px-3 py-2 mb-1 border-b border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Navegação Rápida</span>
                </div>
                <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors">
                  <BarChart className="h-4 w-4 text-orange-500" /> Dashboard Global
                </Link>
                <Link href="/admin/clubs" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors">
                  <Globe className="h-4 w-4 text-orange-500" /> Lista de Clubes
                </Link>
                <Link href="/admin/billing" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors">
                  <CreditCard className="h-4 w-4 text-orange-500" /> Financeiro
                </Link>
                <div className="my-1 border-t border-gray-800" />
                <Link href="/explore" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Voltar ao App
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ADMIN NAV CENTRAL */}
        <div className="hidden items-center gap-2 text-sm font-bold text-gray-400 lg:flex">
          <Link
            href="/admin/dashboard"
            className={`flex h-20 items-center gap-2 px-4 border-b-2 transition-all cursor-pointer ${isActive('/admin/dashboard') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Métricas
          </Link>

          <Link
            href="/admin/clubs"
            className={`flex h-20 items-center gap-2 px-4 border-b-2 transition-all cursor-pointer ${isActive('/admin/clubs') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <Globe className="h-4 w-4" />
            Clubes
          </Link>

          <Link
            href="/admin/billing"
            className={`flex h-20 items-center gap-2 px-4 border-b-2 transition-all cursor-pointer ${isActive('/admin/billing') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <CreditCard className="h-4 w-4" />
            Financeiro
          </Link>

          <Link
            href="/admin/settings"
            className={`flex h-20 items-center gap-2 px-4 border-b-2 transition-all cursor-pointer ${isActive('/admin/settings') ? 'border-orange-500 text-white' : 'border-transparent hover:text-white'}`}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-6">
          <Link 
            href="/explore"
            className="group hidden items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors sm:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Sair do Admin
          </Link>

          <div className="h-8 w-px bg-gray-800"></div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Root Admin</span>
                <span className="text-xs font-bold text-white">{user.name}</span>
             </div>
             <ProfileButton user={user} />
          </div>
        </div>

      </div>
    </nav>
  )
}
