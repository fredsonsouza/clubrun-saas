'use client'

import { getClubsAction } from '@/app/private-actions'
import { getCookie } from 'cookies-next'
import {
  BarChart,
  ChevronDown,
  Compass,
  Flag,
  Flame,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  UserPlus,
  Users as UsersIcon,
  X,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Logo } from './brand/logo'
import { ClubSwitcher } from './club-switcher'
import { ProfileButton } from './profile-button'

interface HeaderProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    isSystemAdmin?: boolean
    role?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
  }
  variant?: 'default' | 'onboarding'
}

export function Header({ user, variant = 'default' }: HeaderProps) {
  const pathname = usePathname()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const systemMenuRef = useRef<HTMLDivElement>(null)

  const [clubs, setClubs] = useState<{ slug: string; role: string }[]>([])

  const isSuperAdmin = user.isSystemAdmin === true

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const { clubs: fetchedClubs } = await getClubsAction()
        setClubs(fetchedClubs)
        const currentClubSlug = getCookie('club') as string

        const club =
          fetchedClubs.find((c) => c.slug === currentClubSlug) ||
          fetchedClubs[0]
        if (club) {
          setActiveSlug(club.slug)
          setUserRole(club.role)
        }
      } catch (error) {
        console.error('Failed to load header data', error)
      }
    }

    if (variant === 'default') {
      loadHeaderData()
    }

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
  }, [variant])

  const isActive = (path: string) => {
    if (!pathname) return false
    return pathname.endsWith(path) || pathname.includes(`${path}/`)
  }

  if (variant === 'onboarding') {
    return (
      <nav className="sticky top-0 z-40 border-gray-200 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex cursor-pointer items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-md shadow-orange-500/20">
              <Flame className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-gray-900 text-xl tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>
          <ProfileButton user={user} />
        </div>
      </nav>
    )
  }

  const effectiveRole = userRole || user.role
  const isAnyOwner =
    clubs.some((c) => c.role === 'OWNER') || user.role === 'OWNER'
  const canManage =
    effectiveRole === 'OWNER' ||
    effectiveRole === 'MANAGER' ||
    effectiveRole === 'ADMIN' ||
    isSuperAdmin ||
    isAnyOwner

  const dashboardHref = activeSlug ? `/${activeSlug}/dashboard` : '/explore'
  const rankingHref = activeSlug ? `/${activeSlug}/ranking` : '/explore'
  const membersHref = activeSlug ? `/${activeSlug}/members` : '/explore'
  const invitesHref = activeSlug ? `/${activeSlug}/invites` : '/create-club'
  const settingsHref = activeSlug
    ? `/${activeSlug}/settings`
    : isAnyOwner
      ? '/create-club'
      : '/explore'
  const racesHref = activeSlug ? `/${activeSlug}/races` : '/explore'

  const showClubSwitcher =
    isSuperAdmin || isAnyOwner || effectiveRole === 'OWNER'

  return (
    <nav className="sticky top-0 z-40 border-gray-200 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" fill="currentColor" />
              {/* <Logo size={22} /> */}
            </div>
            <span className="hidden font-black text-2xl text-gray-900 tracking-tighter sm:block">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          {showClubSwitcher && (
            <>
              <div className="h-8 w-px bg-gray-200" />
              <ClubSwitcher />
            </>
          )}
        </div>

        {/* NAVEGAÇÃO CENTRAL */}
        <div
          className={`hidden items-center gap-0.5 ${effectiveRole === 'ATHLETE' || effectiveRole === 'COACH' ? 'text-[16px]' : 'text-[13px]'} font-bold text-gray-500 xl:flex`}
        >
          <Link
            href="/explore"
            className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${pathname === '/explore' ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Compass className="h-4 w-4" />
            Explorar
          </Link>

          <Link
            href={dashboardHref}
            className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${isActive('/dashboard') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {effectiveRole === 'ATHLETE' || effectiveRole === 'COACH'
              ? 'Feed do Clube'
              : 'Painel'}
          </Link>

          {(effectiveRole === 'ATHLETE' || effectiveRole === 'COACH') && (
            <Link
              href={`/profile/${user.id}`}
              className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${pathname?.startsWith('/profile') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
            >
              <Target className="h-4 w-4" />
              Meus Treinos
            </Link>
          )}

          <Link
            href={rankingHref}
            className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${isActive('/ranking') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </Link>

          <Link
            href={racesHref}
            className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${isActive('/races') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Flag className="h-4 w-4" />
            Provas
          </Link>

          <Link
            href={membersHref}
            className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${isActive('/members') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <UsersIcon className="h-4 w-4" />
            Pelotão
          </Link>

          {canManage && (
            <Link
              href={settingsHref}
              className={`flex h-20 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 transition-all ${isActive('/settings') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
            >
              <Settings className="h-4 w-4" />
              Gestão
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* BOTÃO DO SUPER ADMIN */}
          {isSuperAdmin && (
            <div className="relative" ref={systemMenuRef}>
              <button
                type="button"
                onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
                className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 font-black text-[10px] text-white tracking-widest shadow-lg transition-all hover:bg-gray-800 active:scale-95"
              >
                <Zap className="h-3 w-3 text-orange-500" fill="currentColor" />
                SYSTEM
                <ChevronDown
                  className={`h-2.5 w-2.5 transition-transform ${isSystemMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isSystemMenuOpen && (
                <div className="fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 animate-in rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-2xl backdrop-blur-md duration-150">
                  <div className="mb-1 px-3 py-2">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                      Administração Global
                    </span>
                  </div>
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-700 text-sm transition-colors hover:bg-gray-50"
                  >
                    <BarChart className="h-4 w-4 text-orange-500" /> Métricas do
                    Sistema
                  </Link>
                  <Link
                    href="/admin/clubs"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-700 text-sm transition-colors hover:bg-gray-50"
                  >
                    <ShieldCheck className="h-4 w-4 text-orange-500" /> Gerir
                    Todos os Clubes
                  </Link>
                  <Link
                    href="/admin/billing"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-gray-700 text-sm transition-colors hover:bg-gray-50"
                  >
                    <Zap className="h-4 w-4 text-orange-500" /> Faturação Global
                  </Link>
                </div>
              )}
            </div>
          )}

          {canManage && (
            <Link
              href={invitesHref}
              className="hidden cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-[13px] text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 sm:flex"
            >
              <UserPlus className="h-4 w-4" /> Convidar
            </Link>
          )}

          <div className="h-8 w-px bg-gray-200 xl:hidden" />

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-600 transition-all hover:bg-gray-100 active:scale-95 xl:hidden"
            title="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="h-8 w-px bg-gray-200" />

          <ProfileButton user={user} />
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="border-gray-100 border-t bg-white/95 px-4 py-4 shadow-xl backdrop-blur-md xl:hidden">
          <div className="flex flex-col gap-2 font-bold text-gray-600">
            <Link
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${pathname === '/explore' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
            >
              <Compass className="h-5 w-5" />
              Explorar
            </Link>

            <Link
              href={dashboardHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive('/dashboard') ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              {effectiveRole === 'ATHLETE' || effectiveRole === 'COACH'
                ? 'Feed do Clube'
                : 'Painel'}
            </Link>

            {(effectiveRole === 'ATHLETE' || effectiveRole === 'COACH') && (
              <Link
                href={`/profile/${user.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${pathname?.startsWith('/profile') ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
              >
                <Target className="h-5 w-5" />
                Meus Treinos
              </Link>
            )}

            <Link
              href={rankingHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive('/ranking') ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
            >
              <Trophy className="h-5 w-5" />
              Ranking
            </Link>

            <Link
              href={racesHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive('/races') ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
            >
              <Flag className="h-5 w-5" />
              Provas
            </Link>

            <Link
              href={membersHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive('/members') ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
            >
              <UsersIcon className="h-5 w-5" />
              Pelotão
            </Link>

            {canManage && (
              <Link
                href={settingsHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive('/settings') ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
              >
                <Settings className="h-5 w-5" />
                Gestão
              </Link>
            )}

            {canManage && (
              <Link
                href={invitesHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-bold text-white shadow-md shadow-orange-500/20"
              >
                <UserPlus className="h-4 w-4" /> Convidar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
