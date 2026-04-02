'use client'

import clubrunIcon from '@/app/assets/brand/clubrun-icon.png'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink } from './nav-link'
import { ProfileButton } from './profile-button'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './theme/theme-switcher'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
}

interface HeaderClientProps {
  user: User
  clubSwitcher?: ReactNode
}

export function HeaderClient({ user, clubSwitcher }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Trava o scroll quando mobile open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full border-b transition-all duration-300',
          // LIGHT MODE: Fundo Branco Sólido / DARK MODE: Preto Translúcido
          scrolled
            ? 'border-zinc-200 bg-white shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80'
            : 'border-transparent bg-white/50 backdrop-blur-none dark:bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1300px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LADO ESQUERDO */}
          <div className="flex items-center gap-10">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <Image src={clubrunIcon} alt="ClubRun" className="h-9 w-auto" />
              {/* Texto PRETO no Light, BRANCO no Dark */}
              <span className="hidden text-xl font-bold tracking-tight text-zinc-950 md:block dark:text-white">
                Club<span className="text-orange-500">Run</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <NavLink href="/club-dashboard">Clubes</NavLink>
              <NavLink href="/workouts">Treinos</NavLink>
              <NavLink href="/runs">Corridas</NavLink>
              <NavLink href="/rankings">Rankings</NavLink>
              <NavLink href="/athletes">Atletas</NavLink>
            </nav>
          </div>

          {/* LADO DIREITO */}
          <div className="flex items-center gap-5">
            {clubSwitcher && (
              <div className="hidden md:block">{clubSwitcher}</div>
            )}

            <div className="hidden h-6 w-px bg-zinc-200 sm:block dark:bg-zinc-800" />

            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>

            <ProfileButton user={user} />

            {/* Mobile Menu Button - Escuro no Light / Claro no Dark */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-900 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 flex flex-col transition-all duration-300 lg:hidden',
          // FUNDO: Branco no Light / Preto no Dark
          'bg-white dark:bg-zinc-950',
          mobileMenuOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-4 opacity-0'
        )}
        style={{ top: '0', paddingTop: '80px' }}
      >
        <nav className="flex flex-col space-y-4 px-6 pt-4">
          {clubSwitcher && (
            <div className="mb-2 border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <span className="mb-3 block text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Organização atual
              </span>
              {/* No mobile, o switcher precisa de contraste também */}
              <div className="pointer-events-auto">{clubSwitcher}</div>
            </div>
          )}

          {/* Links do Mobile - Forçando cores explícitas */}
          <div className="flex flex-col space-y-4">
            <MobileLink href="/clubs" onClick={() => setMobileMenuOpen(false)}>
              Clubes
            </MobileLink>
            <MobileLink
              href="/workouts"
              onClick={() => setMobileMenuOpen(false)}
            >
              Treinos
            </MobileLink>
            <MobileLink href="/runs" onClick={() => setMobileMenuOpen(false)}>
              Corridas
            </MobileLink>
            <MobileLink
              href="/rankings"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rankings
            </MobileLink>
            <MobileLink
              href="/athletes"
              onClick={() => setMobileMenuOpen(false)}
            >
              Atletas
            </MobileLink>
          </div>
        </nav>
      </div>
    </>
  )
}

// Pequeno componente auxiliar para link mobile
function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-2xl font-semibold text-zinc-900 transition-colors hover:text-orange-500 dark:text-zinc-100"
    >
      {children}
    </Link>
  )
}
