// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { cn } from '@/lib/utils'

// interface NavLinkProps {
//   href: string
//   children: React.ReactNode
//   className?: string
//   onClick?: () => void
// }

// export function NavLink({ href, children, className, onClick }: NavLinkProps) {
//   const pathname = usePathname()
//   const isActive = pathname === href || pathname.startsWith(`${href}/`)

//   return (
//     <Link
//       href={href}
//       className={cn(
//         'relative text-lg font-medium transition-colors',
//         isActive ? 'text-orange-500' : 'text-zinc-400',
//         'hover:text-orange-500',
//         // Underline animado
//         'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-orange-500 after:transition-transform after:duration-300',
//         isActive ? 'after:scale-x-100' : 'after:scale-x-0',
//         'hover:after:scale-x-100'
//       )}
//     >
//       {children}
//     </Link>
//   )
// }

// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { cn } from '@/lib/utils'

// interface NavLinkProps {
//   href: string
//   children: React.ReactNode
//   className?: string
//   onClick?: () => void
// }

// export function NavLink({ href, children, className, onClick }: NavLinkProps) {
//   const pathname = usePathname()
//   // Verifica se é a rota exata ou uma sub-rota
//   const isActive = pathname === href || pathname.startsWith(`${href}/`)

//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={cn(
//         'group relative flex items-center justify-center rounded-full px-4 py-2 font-medium transition-all duration-300 ease-out text-shadow-md',
//         isActive
//           ? 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20'
//           : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
//         className
//       )}
//     >
//       {/* Pequeno ponto indicador apenas se ativo (opcional, dá um toque tech) */}
//       {isActive && (
//         <span className="absolute left-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
//       )}

//       <span className={cn(isActive && 'ml-2')}>{children}</span>
//     </Link>
//   )
// }
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group text-md relative flex items-center justify-center rounded-full px-4 py-2 font-medium transition-all duration-200 ease-out',
        isActive
          ? // ATIVO: Laranja suave no light / Laranja neon no dark
            'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500'
          : // INATIVO: Cinza escuro no light / Cinza claro no dark
            'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
        className
      )}
    >
      {/* Indicador visual (ponto) apenas se ativo */}
      {isActive && (
        <span className="absolute left-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
      )}

      <span className={cn(isActive && 'ml-2')}>{children}</span>
    </Link>
  )
}
