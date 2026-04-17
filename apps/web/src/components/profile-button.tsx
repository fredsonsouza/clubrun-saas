'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut, User } from 'lucide-react'

const mockUser = {
  name: 'Fredson Souza',
  email: 'fredson@exemplo.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
}

export function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string) =>
    name ? name.charAt(0).toUpperCase() : 'U'

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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-transparent p-1.5 pr-3 transition-all hover:border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-white shadow-sm">
          {mockUser.avatarUrl ? (
            <img
              src={mockUser.avatarUrl}
              alt={mockUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-extrabold text-gray-500">
              {getInitials(mockUser.name)}
            </span>
          )}
        </div>

        <div className="hidden max-w-[140px] flex-col items-start lg:flex">
          <span className="w-full truncate text-left text-sm leading-tight font-bold text-gray-900">
            {mockUser.name}
          </span>
          <span className="w-full truncate text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            {mockUser.email.split('@')[0]}
          </span>
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl duration-100">
          <div className="space-y-1 px-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-gray-400 transition-colors group-hover:text-orange-500" />{' '}
              Meu Perfil
            </Link>
          </div>

          <div className="my-2 h-px bg-gray-100" />

          <div className="px-2">
            <button
              onClick={() => {
                setIsOpen(false)
                alert('Fazendo logout...')
              }}
              // Adicionamos a classe 'group' no botão
              className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              {/* Adicionamos a transição no ícone reagindo ao hover do botão (group) */}
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />{' '}
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
