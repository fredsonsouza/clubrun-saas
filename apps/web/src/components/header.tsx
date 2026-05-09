'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Flame, 
  UserPlus, 
  LayoutDashboard, 
  Trophy, 
  Users as UsersIcon, 
  Settings, 
  Compass, 
  Flag,
  ChevronDown,
  Zap,
  BarChart,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { ProfileButton } from './profile-button'
import { ClubSwitcher } from './club-switcher'
import { useEffect, useState, useRef } from 'react'
import { getClubs } from '@/http/get-clubs'
import { getCookie } from 'cookies-next'

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
  const systemMenuRef = useRef<HTMLDivElement>(null)

  const [clubs, setClubs] = useState<{slug: string, role: string}[]>([])

  const isSuperAdmin = user.isSystemAdmin || user.email === 'admin@clubrun.com'

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const { clubs: fetchedClubs } = await getClubs()
        setClubs(fetchedClubs)
        const currentClubSlug = getCookie('club') as string

        const club = fetchedClubs.find((c) => c.slug === currentClubSlug) || fetchedClubs[0]
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
      if (systemMenuRef.current && !systemMenuRef.current.contains(event.target as Node)) {
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
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-md shadow-orange-500/20">
              <Flame className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>
          <ProfileButton user={user} />
        </div>
      </nav>
    )
  }

  const effectiveRole = userRole || user.role
  const isAnyOwner = clubs.some(c => c.role === 'OWNER') || user.role === 'OWNER'
  const canManage = effectiveRole === 'OWNER' || effectiveRole === 'MANAGER' || effectiveRole === 'ADMIN' || isSuperAdmin || isAnyOwner
  
  const dashboardHref = activeSlug ? `/${activeSlug}/dashboard` : '/explore'
  const rankingHref = activeSlug ? `/${activeSlug}/ranking` : '/explore'
  const membersHref = activeSlug ? `/${activeSlug}/members` : '/explore'
  const invitesHref = activeSlug ? `/${activeSlug}/invites` : '/create-club'
  const settingsHref = activeSlug ? `/${activeSlug}/settings` : (isAnyOwner ? '/create-club' : '/explore')
  const racesHref = activeSlug ? `/${activeSlug}/races` : '/explore'

  const showClubSwitcher = isSuperAdmin || isAnyOwner || effectiveRole === 'OWNER'

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="hidden text-2xl font-black tracking-tighter text-gray-900 sm:block">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          {showClubSwitcher && (
            <>
              <div className="h-8 w-px bg-gray-200"></div>
              <ClubSwitcher />
            </>
          )}
        </div>

        {/* NAVEGAÇÃO CENTRAL */}
        <div className={`hidden items-center gap-0.5 ${effectiveRole === 'ATHLETE' || effectiveRole === 'COACH' ? 'text-[16px]' : 'text-[13px]'} font-bold text-gray-500 xl:flex`}>
          <Link
            href="/explore"
            className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${pathname === '/explore' ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Compass className="h-4 w-4" />
            Explorar
          </Link>

          <Link
            href={dashboardHref}
            className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${isActive('/dashboard') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {effectiveRole === 'ATHLETE' || effectiveRole === 'COACH' ? 'Feed do Clube' : 'Painel'}
          </Link>

          {(effectiveRole === 'ATHLETE' || effectiveRole === 'COACH') && (
            <Link
              href={`/profile/${user.id}`}
              className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${pathname?.startsWith('/profile') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
            >
              <Target className="h-4 w-4" />
              Meus Treinos
            </Link>
          )}

          <Link
            href={rankingHref}
            className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${isActive('/ranking') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </Link>

          <Link
            href={racesHref}
            className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${isActive('/races') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Flag className="h-4 w-4" />
            Provas
          </Link>

          <Link
            href={membersHref}
            className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${isActive('/members') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <UsersIcon className="h-4 w-4" />
            Pelotão
          </Link>

          {canManage && (
            <Link
              href={settingsHref}
              className={`flex h-20 items-center gap-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${isActive('/settings') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
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
                onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
                className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-[10px] font-black tracking-widest text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
              >
                <Zap className="h-3 w-3 text-orange-500" fill="currentColor" />
                SYSTEM
                <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isSystemMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSystemMenuOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-2xl backdrop-blur-md duration-150">
                  <div className="px-3 py-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Administração Global</span>
                  </div>
                  <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <BarChart className="h-4 w-4 text-orange-500" /> Métricas do Sistema
                  </Link>
                  <Link href="/admin/clubs" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <ShieldCheck className="h-4 w-4 text-orange-500" /> Gerir Todos os Clubes
                  </Link>
                  <Link href="/admin/billing" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <Zap className="h-4 w-4 text-orange-500" /> Faturação Global
                  </Link>
                </div>
              )}
            </div>
          )}

          {canManage && (
            <Link 
              href={invitesHref}
              className="hidden cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 sm:flex"
            >
              <UserPlus className="h-4 w-4" /> Convidar
            </Link>
          )}

          <div className="h-8 w-px bg-gray-200"></div>

          <ProfileButton user={user} />
        </div>
      </div>
    </nav>
  )
}
