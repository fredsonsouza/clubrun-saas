'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, ChevronDown, UserPlus } from 'lucide-react'
import { ProfileButton } from './profile-button'

export function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (!pathname) return false
    return pathname.includes(path)
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-orange-500" fill="currentColor" />
            <span className="hidden text-xl font-extrabold tracking-tight text-gray-900 sm:block">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-gray-200 md:block"></div>

          <button className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 md:flex">
            Macuxi Runner <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="hidden items-center gap-6 text-sm font-bold text-gray-500 lg:flex">
          <Link
            href="/dashboard"
            className={`flex h-16 items-center border-b-2 transition-colors ${isActive('/dashboard') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/ranking"
            className={`flex h-16 items-center border-b-2 transition-colors ${isActive('/ranking') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            Ranking
          </Link>
          <Link
            href="/members"
            className={`flex h-16 items-center border-b-2 transition-colors ${isActive('/members') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            Membros
          </Link>
          <Link
            href="/settings"
            className={`flex h-16 items-center border-b-2 transition-colors ${isActive('/settings') ? 'border-orange-500 text-orange-600' : 'border-transparent hover:text-gray-900'}`}
          >
            Configurações
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 sm:flex">
            <UserPlus className="h-4 w-4" /> Convidar
          </button>

          {/* Aqui injetamos o componente de Perfil */}
          <ProfileButton />
        </div>
      </div>
    </nav>
  )
}
