import { ChevronsUpDown, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getClubs } from '@/http/get-clubs'

export async function ClubSwitcher() {
  const { clubs } = await getClubs()
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group /* Trigger Light Mode */ /* Trigger Dark Mode */ flex w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-all outline-none hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-orange-500/20 md:w-[200px] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800">
        <span className="flex-1 truncate text-left">Selecione um clube</span>

        <ChevronsUpDown className="ml-auto size-4 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-16}
        sideOffset={8}
        className="/* MENU LIGHT: Forçando Branco */ /* MENU DARK: Forçando Preto */ z-50 w-[220px] rounded-md border border-zinc-200 bg-white p-1 text-zinc-900 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Clubs
          </DropdownMenuLabel>
          {clubs.map((club) => {
            return (
              <DropdownMenuItem
                key={club.id}
                className="cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors outline-none hover:bg-zinc-100 focus:bg-zinc-100 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"
              >
                <Avatar className="mr-2 size-4 border border-zinc-200 dark:border-zinc-700">
                  {club.avatarUrl && <AvatarImage src={club.avatarUrl} />}
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <span className="line-clamp-1 font-medium">{club.name}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-sm px-2 py-1.5 text-sm text-zinc-600 transition-colors outline-none hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600 dark:text-zinc-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-500 dark:focus:bg-orange-500/10 dark:focus:text-orange-500"
        >
          <Link href="/create-club" className="flex items-center">
            <PlusCircle className="mr-2 size-4" />
            Create new
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
