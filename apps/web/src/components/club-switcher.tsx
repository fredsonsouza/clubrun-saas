'use client'

import { getClubsAction } from '@/app/private-actions'
import { getCookie, setCookie } from 'cookies-next'
import { Building2, Check, ChevronDown, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface Club {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  role: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
}

export function ClubSwitcher() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [currentClub, setCurrentClub] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadClubs() {
      try {
        const { clubs } = await getClubsAction()
        setClubs(clubs)

        const currentClubSlug = getCookie('club')

        if (currentClubSlug) {
          const club = clubs.find((c) => c.slug === currentClubSlug)
          if (club) {
            setCurrentClub(club)
          } else if (clubs.length > 0) {
            setCurrentClub(clubs[0])
            setCookie('club', clubs[0].slug)
          }
        } else if (clubs.length > 0) {
          setCurrentClub(clubs[0])
          setCookie('club', clubs[0].slug)
        }
      } catch (error) {
        console.error('Failed to load clubs', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadClubs()
  }, [])

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

  function handleSelectClub(club: Club) {
    setCurrentClub(club)
    setCookie('club', club.slug)
    setIsOpen(false)
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex h-9 w-[200px] animate-pulse items-center gap-2 rounded-lg bg-gray-100 px-3" />
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden items-center gap-2 rounded-xl border border-transparent px-3 py-1.5 font-bold text-gray-700 text-sm transition-all hover:border-gray-200 hover:bg-gray-50 focus:outline-none md:flex"
      >
        {currentClub ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentClub.avatarUrl || ''} />
              <AvatarFallback className="text-[10px]">
                {currentClub.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[120px] truncate md:max-w-[150px]">
              {currentClub.name}
            </span>
          </>
        ) : (
          <span>Selecionar clube</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="fade-in zoom-in-95 absolute left-0 z-50 mt-2 w-64 animate-in rounded-2xl border border-gray-100 bg-white/95 py-2 shadow-2xl backdrop-blur-md duration-100">
          <div className="px-3 py-1.5">
            <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
              Seus Clubes
            </span>
          </div>

          <div className="space-y-1 px-2">
            {clubs.map((club) => (
              <button
                type="button"
                key={club.id}
                onClick={() => handleSelectClub(club)}
                className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left font-bold text-sm transition-colors hover:bg-gray-50 ${
                  currentClub?.id === club.id
                    ? 'bg-orange-50/50 text-orange-600'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={club.avatarUrl || ''} />
                    <AvatarFallback className="text-[10px]">
                      {club.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{club.name}</span>
                </div>
                {currentClub?.id === club.id && (
                  <Check className="h-4 w-4 text-orange-500" />
                )}
              </button>
            ))}
          </div>

          <div className="my-2 h-px bg-gray-100" />

          <div className="px-2">
            <Link
              href="/create-club"
              onClick={() => setIsOpen(false)}
              className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold text-gray-700 text-sm transition-colors hover:bg-gray-50"
            >
              <PlusCircle className="h-4 w-4 text-gray-400 transition-colors group-hover:text-orange-500" />
              <span>Criar novo clube</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
