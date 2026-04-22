'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, UserPlus, LayoutDashboard, Trophy, Users as UsersIcon, Settings } from 'lucide-react'
import { ProfileButton } from './profile-button'
import { ClubSwitcher } from './club-switcher'
import { useEffect, useState } from 'react'
import { getClubs } from '@/http/get-clubs'
import { getCookie } from 'cookies-next'

interface HeaderProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
  variant?: 'default' | 'onboarding'
}

export function Header({ user, variant = 'default' }: HeaderProps) {
  const pathname = usePathname()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const { clubs } = await getClubs()
        const currentClubSlug = getCookie('club') as string

        const club = clubs.find((c) => c.slug === currentClubSlug) || clubs[0]
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
  }, [variant])

  const isActive = (path: string) => {
    if (!pathname) return false
    // Verifica se o pathname termina com o path ou se o path está contido de forma isolada
    return pathname.endsWith(path) || pathname.includes(`${path}/`)
  }

  // Se for onboarding, renderizamos uma versão super limpa (só Logo e Perfil)
  if (variant === 'onboarding') {
    return (
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Flame className="h-7 w-7 text-orange-500" fill="currentColor" />
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>
          <ProfileButton user={user} />
        </div>
      </nav>
    )
  }

  const isOwner = userRole === 'OWNER'
  const dashboardHref = activeSlug ? `/${activeSlug}/dashboard` : '/'
  const rankingHref = activeSlug ? `/${activeSlug}/ranking` : '#'
  const membersHref = activeSlug ? `/${activeSlug}/members` : '#'
  const settingsHref = activeSlug ? `/${activeSlug}/settings` : '#'

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Flame className="h-7 w-7 text-orange-500" fill="currentColor" />
            <span className="hidden text-xl font-extrabold tracking-tight text-gray-900 sm:block">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-gray-200 md:block"></div>

          <ClubSwitcher />
        </div>

        <div className="hidden items-center gap-6 text-sm font-bold text-gray-500 lg:flex">
          <Link
            href={dashboardHref}
            className={`flex h-16 items-center gap-2 border-b-2 transition-all cursor-pointer ${isActive('/dashboard') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href={rankingHref}
            className={`flex h-16 items-center gap-2 border-b-2 transition-all cursor-pointer ${isActive('/ranking') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </Link>
          <Link
            href={membersHref}
            className={`flex h-16 items-center gap-2 border-b-2 transition-all cursor-pointer ${isActive('/members') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            <UsersIcon className="h-4 w-4" />
            Membros
          </Link>
          {isOwner && (
            <Link
              href={settingsHref}
              className={`flex h-16 items-center gap-2 border-b-2 transition-all cursor-pointer ${isActive('/settings') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 sm:flex">
            <UserPlus className="h-4 w-4" /> Convidar
          </button>

          <ProfileButton user={user} />
        </div>
      </div>
    </nav>
  )
}
