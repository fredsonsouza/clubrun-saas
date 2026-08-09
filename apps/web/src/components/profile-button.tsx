'use client'

import { ChevronDown, CreditCard, LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface ProfileButtonProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

export function ProfileButton(props: ProfileButtonProps) {
  if (!props.user) return null

  return <ProfileButtonContent user={props.user} />
}

function ProfileButtonContent({ user }: ProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')

    return initials
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-transparent p-1.5 pr-3 transition-all hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
      >
        <Avatar>
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          {user.name && (
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          )}
        </Avatar>

        <div className="hidden max-w-[140px] flex-col items-start lg:flex">
          <span className="w-full truncate text-left font-bold text-gray-900 text-sm leading-tight">
            {user.name}
          </span>
          <span className="w-full truncate text-left font-bold text-[9px] text-gray-500 tracking-wider">
            {user.email}
          </span>
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-48 animate-in rounded-2xl border border-gray-100 bg-white/95 py-2 shadow-2xl backdrop-blur-md duration-100">
          <div className="space-y-1 px-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold text-gray-700 text-sm transition-colors hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-gray-400 transition-colors group-hover:text-orange-500" />{' '}
              Meu Perfil
            </Link>

            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold text-gray-700 text-sm transition-colors hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 text-gray-400 transition-colors group-hover:text-orange-500" />{' '}
              Minha Conta
            </Link>
          </div>

          <div className="my-2 h-px bg-gray-100" />

          <div className="px-2">
            <a
              href="/api/auth/sign-out"
              onClick={() => setIsOpen(false)}
              className="group flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left font-bold text-red-600 text-sm transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />{' '}
              Sair
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
