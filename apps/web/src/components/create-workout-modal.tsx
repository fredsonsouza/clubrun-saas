'use client'

import { useState } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from './ui/button'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { cn } from '@/lib/utils'

interface CreateWorkoutModalProps {
  open: boolean
  onClose: () => void
  showAthleteSelect?: boolean
}

export function CreateWorkoutModal({
  open,
  onClose,
  showAthleteSelect = false,
}: CreateWorkoutModalProps) {
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    athleteId: '',
    type: '',
    distance: '',
    pace: '',
    duration: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Create workout:', { ...formData, date })
    // TODO: Enviar para API
    onClose()
    // Reset form
    setFormData({
      athleteId: '',
      type: '',
      distance: '',
      pace: '',
      duration: '',
      notes: '',
    })
    setDate(undefined)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl border-zinc-800 sm:max-w-[600px]"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold text-white">
            {showAthleteSelect ? 'Criar Novo Treino' : 'Registrar Treino'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {showAthleteSelect
              ? 'Adicione um novo treino para um atleta do clube'
              : 'Registre seu treino e acompanhe sua evolução'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Atleta (apenas para owner/coach) */}
          {showAthleteSelect && (
            <div className="space-y-2">
              <Label
                htmlFor="athlete"
                className="text-sm font-medium text-zinc-200"
              >
                Atleta
              </Label>
              <Select
                value={formData.athleteId}
                onValueChange={(value) => handleChange('athleteId', value)}
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <SelectValue placeholder="Selecione o atleta" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="1">João Silva</SelectItem>
                  <SelectItem value="2">Maria Santos</SelectItem>
                  <SelectItem value="3">Pedro Alves</SelectItem>
                  <SelectItem value="4">Ana Costa</SelectItem>
                  <SelectItem value="5">Carlos Lima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Grid: Tipo + Data */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Tipo de Treino */}
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="text-sm font-medium text-zinc-200"
              >
                Tipo de Treino
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="run">Rodagem</SelectItem>
                  <SelectItem value="long-run">Longão</SelectItem>
                  <SelectItem value="interval">Intervalado</SelectItem>
                  <SelectItem value="recovery">Recuperação</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="race">Corrida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-200">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start border-zinc-700 bg-zinc-900 text-left font-normal text-white hover:bg-zinc-800 hover:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500',
                      !date && 'text-zinc-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-zinc-800 bg-zinc-950 p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Grid: Distância + Pace + Duração */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Distância */}
            <div className="space-y-2">
              <Label
                htmlFor="distance"
                className="text-sm font-medium text-zinc-200"
              >
                Distância (km)
              </Label>
              <input
                id="distance"
                type="number"
                step="0.01"
                placeholder="10.5"
                value={formData.distance}
                onChange={(e) => handleChange('distance', e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Pace */}
            <div className="space-y-2">
              <Label
                htmlFor="pace"
                className="text-sm font-medium text-zinc-200"
              >
                Pace (min/km)
              </Label>
              <input
                id="pace"
                type="text"
                placeholder="5:30"
                value={formData.pace}
                onChange={(e) => handleChange('pace', e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Duração */}
            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-sm font-medium text-zinc-200"
              >
                Duração
              </Label>
              <input
                id="duration"
                type="text"
                placeholder="55:15"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-zinc-200"
            >
              Observações (opcional)
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Ex: Treino leve, recuperação ativa..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 font-semibold text-white hover:bg-orange-600"
            >
              {showAthleteSelect ? 'Criar Treino' : 'Registrar Treino'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
