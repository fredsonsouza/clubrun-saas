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
      className={cn(
        'relative text-lg font-medium transition-colors',
        isActive ? 'text-orange-500' : 'text-zinc-400',
        'hover:text-orange-500',
        // Underline animado
        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-orange-500 after:transition-transform after:duration-300',
        isActive ? 'after:scale-x-100' : 'after:scale-x-0',
        'hover:after:scale-x-100'
      )}
    >
      {children}
    </Link>
  )
}
