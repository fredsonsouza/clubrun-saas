'use client'

import { ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface User {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
}

interface ProfileButtonProps {
  user: User
}

export function ProfileButton({ user }: ProfileButtonProps) {
  const getInitials = (name: string | null) => {
    if (!name) return 'CR'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group flex items-center gap-3 rounded-full border border-transparent bg-transparent p-1 pr-3 transition-all outline-none hover:border-zinc-200 hover:bg-zinc-100/80 focus:ring-2 focus:ring-orange-500/20 dark:border-transparent dark:bg-zinc-900/50 dark:hover:border-zinc-800 dark:hover:bg-zinc-800">
        <Avatar className="h-8 w-8 border border-zinc-200 transition-transform group-hover:scale-105 dark:border-zinc-800">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-zinc-100 text-xs font-bold text-orange-600 dark:bg-zinc-800 dark:text-orange-500">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden flex-col items-start sm:flex">
          <span className="text-xs font-medium text-zinc-700 group-hover:text-black dark:text-zinc-200 dark:group-hover:text-white">
            {user.name?.split(' ')[0] ?? 'Atleta'}
          </span>
        </div>

        <ChevronDown className="h-3 w-3 text-zinc-400 transition-transform duration-300 group-data-[state=open]:rotate-180 dark:text-zinc-500" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="mt-2 w-64 border-zinc-200 bg-white/95 p-2 text-zinc-700 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-200"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm leading-none font-medium text-zinc-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
        >
          <a
            href="/profile"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2"
          >
            <UserIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Perfil</span>
          </a>
        </DropdownMenuItem>

        {/* ... Resto do menu ... */}

        <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

        <DropdownMenuItem
          asChild
          className="group cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
        >
          <a
            href="/api/auth/sign-out"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Sair</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
