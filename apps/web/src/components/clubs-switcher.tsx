'use client'

import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

interface Club {
  id: string
  name: string
  memberCount: number
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
}

interface ClubSwitcherProps {
  clubs: Club[]
  currentClubId: string
  onClubChange: (clubId: string) => void
}

const roleLabels = {
  OWNER: 'Proprietário',
  ADMIN: 'Admin',
  COACH: 'Coach',
  MEMBER: 'Membro',
  BILLING: 'Financeiro',
}

export function ClubSwitcher({
  clubs,
  currentClubId,
  onClubChange,
}: ClubSwitcherProps) {
  const [open, setOpen] = useState(false)

  const currentClub = clubs.find((club) => club.id === currentClubId)

  if (!currentClub) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-zinc-700 bg-zinc-900 text-left hover:bg-zinc-800 sm:w-[300px]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Building2 className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white">
                {currentClub.name}
              </span>
              <span className="text-xs text-zinc-500">
                {roleLabels[currentClub.role]} • {currentClub.memberCount}{' '}
                membros
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] border-zinc-800 bg-zinc-950 p-0">
        <Command className="bg-zinc-950">
          <CommandInput
            placeholder="Buscar clube..."
            className="border-zinc-800"
          />
          <CommandEmpty>Nenhum clube encontrado.</CommandEmpty>
          <CommandGroup>
            {clubs.map((club) => (
              <CommandItem
                key={club.id}
                value={club.id}
                onSelect={() => {
                  onClubChange(club.id)
                  setOpen(false)
                }}
                className="cursor-pointer data-[selected=true]:bg-zinc-800"
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Building2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{club.name}</span>
                    <span className="text-xs text-zinc-500">
                      {roleLabels[club.role]} • {club.memberCount} membros
                    </span>
                  </div>
                </div>
                {currentClubId === club.id && (
                  <Check className="ml-2 h-4 w-4 text-orange-500" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
