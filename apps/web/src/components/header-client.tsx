'use client'

import clubrunIcon from '@/app/assets/brand/clubrun-icon.png'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink } from './nav-link'
import { ProfileButton } from './profile-button'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
}

interface HeaderClientProps {
  user: User
}

export function HeaderClient({ user }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    // <header className="sticky top-0 z-50 w-full border-b border-zinc-700 bg-zinc-950/95 backdrop-blur supports-backdrop-filter:bg-zinc-950/80">
    //   <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    //     {/* Logo */}
    //     <Link href="/dashboard" className="flex items-center gap-2">
    //       <Image src={clubrunIcon} alt="" className="h-8 w-auto" />
    //       <span className="text-2xl font-bold text-orange-500">ClubRun</span>
    //     </Link>

    //     {/* Desktop Navigation */}
    //     <nav className="hidden items-center gap-6 lg:flex">
    //       <NavLink href="/clubs">Clubes</NavLink>
    //       <NavLink href="/workouts">Treinos</NavLink>
    //       <NavLink href="/runs">Corridas</NavLink>
    //       <NavLink href="/rankings">Rankings</NavLink>
    //       <NavLink href="/athletes">Atletas</NavLink>
    //     </nav>

    //     {/* Right Section */}
    //     <div className="flex items-center gap-3">
    //       <ProfileButton user={user} />

    //       {/* Mobile Menu Button */}
    //       <Button
    //         variant="ghost"
    //         size="icon"
    //         className="lg:hidden"
    //         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    //       >
    //         {mobileMenuOpen ? (
    //           <X className="h-6 w-6" />
    //         ) : (
    //           <Menu className="h-6 w-6" />
    //         )}
    //       </Button>
    //     </div>
    //   </div>

    //   {/* Mobile Navigation */}
    //   {mobileMenuOpen && (
    //     <div className="border-border bg-background border-t lg:hidden">
    //       <nav className="flex flex-col space-y-1 px-4 py-4">
    //         <NavLink
    //           href="/clubs"
    //           className="w-full rounded-md px-3 py-2"
    //           onClick={() => setMobileMenuOpen(false)}
    //         >
    //           Clubes
    //         </NavLink>
    //         <NavLink
    //           href="/workouts"
    //           className="w-full rounded-md px-3 py-2"
    //           onClick={() => setMobileMenuOpen(false)}
    //         >
    //           Treinos
    //         </NavLink>
    //         <NavLink
    //           href="/runs"
    //           className="w-full rounded-md px-3 py-2"
    //           onClick={() => setMobileMenuOpen(false)}
    //         >
    //           Corridas
    //         </NavLink>
    //         <NavLink
    //           href="/rankings"
    //           className="w-full rounded-md px-3 py-2"
    //           onClick={() => setMobileMenuOpen(false)}
    //         >
    //           Rankings
    //         </NavLink>
    //         <NavLink
    //           href="/athletes"
    //           className="w-full rounded-md px-3 py-2"
    //           onClick={() => setMobileMenuOpen(false)}
    //         >
    //           Atletas
    //         </NavLink>
    //       </nav>
    //     </div>
    //   )}
    // </header>
    <header className="blur-header sticky top-0 z-50 w-full border-b border-zinc-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image src={clubrunIcon} alt="ClubRun" className="h-8 w-auto" />
          <span className="text-2xl font-bold text-orange-500">ClubRun</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink href="/clubs">Clubes</NavLink>
          <NavLink href="/workouts">Treinos</NavLink>
          <NavLink href="/runs">Corridas</NavLink>
          <NavLink href="/rankings">Rankings</NavLink>
          <NavLink href="/athletes">Atletas</NavLink>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ProfileButton user={user} />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white lg:hidden"
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

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="blur-header border-t border-zinc-800 lg:hidden">
          <nav className="flex flex-col space-y-1 px-4 py-4">
            <NavLink
              href="/clubs"
              className="w-full rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Clubes
            </NavLink>
            <NavLink
              href="/workouts"
              className="w-full rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Treinos
            </NavLink>
            <NavLink
              href="/runs"
              className="w-full rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Corridas
            </NavLink>
            <NavLink
              href="/rankings"
              className="w-full rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rankings
            </NavLink>
            <NavLink
              href="/athletes"
              className="w-full rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Atletas
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
