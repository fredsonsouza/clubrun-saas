'use client'

import { ChevronDown, LogOut, User } from 'lucide-react'
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
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    // <DropdownMenu>
    //   <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
    //     <div className="flex flex-col items-end">
    //       <span className="text-xs font-medium text-zinc-500">
    //         {user.name ?? 'Usuário'}
    //       </span>
    //       <span className="text-muted-foreground text-xs text-zinc-500">
    //         {user.email}
    //       </span>
    //     </div>
    //     <Avatar className="h-10 w-10">
    //       <AvatarImage src={user.avatarUrl ?? undefined} />
    //       <AvatarFallback className="bg-primary text-primary-foreground">
    //         {getInitials(user.name)}
    //       </AvatarFallback>
    //     </Avatar>
    //     <ChevronDown className="text-muted-foreground h-4 w-4" />
    //   </DropdownMenuTrigger>

    //   <DropdownMenuContent align="end" className="w-56">
    //     <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem asChild>
    //       <a href="/api/auth/sign-out" className="flex items-center">
    //         <LogOut className="mr-2 h-4 w-4" />
    //         Sair
    //       </a>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-all outline-none hover:bg-zinc-800/50">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
            {user.name ?? 'Usuário'}
          </span>
          <span className="text-xs text-zinc-500 transition-colors group-hover:text-zinc-400">
            {user.email}
          </span>
        </div>
        <Avatar className="h-9 w-9 border-2 border-zinc-800 transition-all group-hover:border-orange-500">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-orange-500/20 text-sm font-bold text-orange-500">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-zinc-500 transition-all group-hover:text-zinc-300 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border-zinc-800 p-2"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* User Info Header */}
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-orange-500/20">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-orange-500/20 text-sm font-bold text-orange-500">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {user.name ?? 'Usuário'}
              </span>
              <span className="text-xs text-zinc-400">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-zinc-800" />

        {/* Minha Conta */}
        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md px-3 py-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white"
        >
          <a href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">Minha Conta</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-800" />

        {/* Sair - RED HOVER */}
        <DropdownMenuItem
          asChild
          className="group cursor-pointer rounded-md px-3 py-2 text-zinc-300 transition-colors hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500"
        >
          <a href="/api/auth/sign-out" className="flex items-center gap-2">
            <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            <span className="text-sm font-medium">Sair</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
