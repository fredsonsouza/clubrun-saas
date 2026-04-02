'use client'

import {
  Calendar,
  MapPin,
  Ruler,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from './ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import clubrunIcon from '@/app/assets/brand/clubrun-icon.png'
import Image from 'next/image'

interface RaceCardProps {
  id: string
  name: string
  date: Date
  time: string
  location: string
  distance: number
  distanceLabel: string
  currentParticipants: number
  maxParticipants?: number
  registrationOpen: boolean
  registrationDeadline?: Date
  isUserRegistered: boolean
  isPast?: boolean
  hasResults?: boolean
  onViewDetails?: (id: string) => void
  onRegister?: (id: string) => void
  onViewResults?: (id: string) => void
}

export function RaceCard({
  id,
  name,
  date,
  time,
  location,
  distance,
  distanceLabel,
  currentParticipants,
  maxParticipants,
  registrationOpen,
  registrationDeadline,
  isUserRegistered,
  isPast,
  hasResults,
  onViewDetails,
  onRegister,
  onViewResults,
}: RaceCardProps) {
  const isAlmostFull =
    maxParticipants && currentParticipants / maxParticipants >= 0.9

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/90"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={() => onViewDetails?.(id)}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-heading mb-2 text-xl font-bold text-white">
            {name}
          </h3>
          {isUserRegistered && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
              <CheckCircle2 className="h-3 w-3" />
              Você está inscrito
            </div>
          )}
        </div>
        <div className="text-5xl">
          {' '}
          <Image src={clubrunIcon} alt="ClubRun" className="h-10 w-auto" />
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 space-y-2 text-sm">
        {/* Data e Hora */}
        <div className="flex items-center gap-2 text-zinc-300">
          <Calendar className="h-4 w-4 text-zinc-500" />
          <span>
            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} • {time}
          </span>
        </div>

        {/* Local */}
        <div className="flex items-center gap-2 text-zinc-300">
          <MapPin className="h-4 w-4 text-zinc-500" />
          <span>{location}</span>
        </div>

        {/* Distância */}
        <div className="flex items-center gap-2 text-zinc-300">
          <Ruler className="h-4 w-4 text-zinc-500" />
          <span>
            {distance} km {distanceLabel && `(${distanceLabel})`}
          </span>
        </div>

        {/* Participantes */}
        <div className="flex items-center gap-2 text-zinc-300">
          <Users className="h-4 w-4 text-zinc-500" />
          <span>
            {currentParticipants}
            {maxParticipants && ` / ${maxParticipants}`} participantes
          </span>
          {isAlmostFull && (
            <span className="text-xs text-yellow-500">(Quase lotado!)</span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        {!isPast && registrationOpen && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-500">
              Inscrições abertas
              {registrationDeadline &&
                ` até ${format(registrationDeadline, 'dd/MM', { locale: ptBR })}`}
            </span>
          </div>
        )}

        {!isPast && !registrationOpen && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500">Inscrições encerradas</span>
          </div>
        )}

        {isPast && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span className="text-blue-500">Corrida realizada</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 cursor-pointer rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails?.(id)
          }}
        >
          Ver Detalhes
        </Button>

        {!isPast && registrationOpen && !isUserRegistered && (
          <Button
            className="flex-1 cursor-pointer rounded-full bg-orange-500 font-semibold text-white hover:bg-orange-600"
            onClick={(e) => {
              e.stopPropagation()
              onRegister?.(id)
            }}
          >
            Inscrever-se
          </Button>
        )}

        {isPast && hasResults && (
          <Button
            className="flex-1 cursor-pointer rounded-full bg-blue-500 font-semibold text-white hover:bg-blue-600"
            onClick={(e) => {
              e.stopPropagation()
              onViewResults?.(id)
            }}
          >
            Ver Resultados
          </Button>
        )}

        {isUserRegistered && !isPast && (
          <Button
            disabled
            className="flex-1 bg-green-500/20 font-semibold text-green-500"
          >
            Inscrito ✓
          </Button>
        )}
      </div>
    </div>
  )
}
