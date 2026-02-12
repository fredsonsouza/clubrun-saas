'use client'

import { ArrowLeft, Mail, Phone, Edit2, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AthleteProfileHeaderProps {
  name: string
  email: string
  phone?: string
  avatarUrl: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
  status: 'active' | 'inactive'
  joinedAt: Date
  canEdit?: boolean
  onBack?: () => void
  onEdit?: () => void
}

const roleConfig = {
  OWNER: {
    label: 'Proprietário',
    badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: '👑',
    borderColor: 'border-yellow-500/50',
  },
  ADMIN: {
    label: 'Administrador',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: '⚡',
    borderColor: 'border-purple-500/50',
  },
  COACH: {
    label: 'Coach',
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: '🎯',
    borderColor: 'border-blue-500/50',
  },
  MEMBER: {
    label: 'Atleta',
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: '🏃',
    borderColor: 'border-orange-500/50',
  },
  BILLING: {
    label: 'Financeiro',
    badge: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: '💳',
    borderColor: 'border-green-500/50',
  },
}

export function AthleteProfileHeader({
  name,
  email,
  phone,
  avatarUrl,
  role,
  status,
  joinedAt,
  canEdit = false,
  onBack,
  onEdit,
}: AthleteProfileHeaderProps) {
  const config = roleConfig[role]
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 lg:p-8"
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className={`h-28 w-28 rounded-2xl border-4 object-cover ${config.borderColor}`}
              />
            ) : (
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-2xl border-4 bg-orange-500/20 ${config.borderColor}`}
              >
                <span className="font-display text-4xl font-bold text-orange-500">
                  {initials}
                </span>
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute -right-2 -bottom-2">
              <div
                className={`rounded-full border-2 border-zinc-900 px-3 py-1 text-xs font-semibold ${
                  status === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {status === 'active' ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-heading mb-2 text-3xl font-bold text-white">
              {name}
            </h1>

            {/* Role Badge */}
            <div className="${config.badge} mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold">
              <span>{config.icon}</span>
              {config.label}
            </div>

            {/* Contact Info */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-zinc-400 sm:justify-start">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
              {phone && (
                <div className="flex items-center justify-center gap-2 text-zinc-400 sm:justify-start">
                  <Phone className="h-4 w-4" />
                  <span>{phone}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-zinc-400 sm:justify-start">
                <Calendar className="h-4 w-4" />
                <span>
                  Membro desde{' '}
                  {format(joinedAt, "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          {canEdit && (
            <Button
              onClick={onEdit}
              className="bg-orange-500 font-semibold text-white hover:bg-orange-600"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          )}
          <Button
            onClick={onBack}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}
