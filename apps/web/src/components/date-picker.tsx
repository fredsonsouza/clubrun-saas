'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Calendar as CalendarIcon, X } from 'lucide-react'

interface DatePickerProps {
  value: string // dd/mm/yyyy
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

export function DatePicker({ value, onChange, label, required }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close calendar on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length > 4) val = val.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
    else if (val.length > 2) val = val.replace(/(\d{2})(\d{2})/, '$1/$2')
    onChange(val)
  }

  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, 'dd/MM/yyyy'))
      setShowCalendar(false)
    }
  }

  const selectedDay = React.useMemo(() => {
    if (!value || value.length !== 10) return undefined
    const parsed = parse(value, 'dd/MM/yyyy', new Date())
    return isValid(parsed) ? parsed : undefined
  }, [value])

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
          <CalendarIcon className="h-3.5 w-3.5 text-orange-500" /> {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          onChange={handleMaskChange}
          placeholder="DD/MM/AAAA"
          className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
      </div>

      {showCalendar && (
        <div className="absolute top-full left-0 z-[110] mt-2 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={handleDaySelect}
            locale={ptBR}
            className="!m-0"
            classNames={{
              day_selected: "bg-orange-500 text-white hover:bg-orange-600 rounded-lg",
              day_today: "text-orange-500 font-black",
              button: "hover:bg-orange-50 rounded-lg transition-colors p-2",
              caption: "flex justify-between items-center mb-4 px-2 font-black text-gray-900",
              nav_button: "text-gray-400 hover:text-orange-500",
              table: "w-full border-collapse",
              head_cell: "text-gray-400 font-black text-[10px] uppercase tracking-widest p-2",
              cell: "p-0.5",
              day: "h-9 w-9 text-sm font-bold text-gray-700",
            }}
          />
        </div>
      )}

      <style jsx global>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #f97316;
          --rdp-background-color: #fff7ed;
          margin: 0;
        }
        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
          background-color: var(--rdp-accent-color);
          color: white;
        }
      `}</style>
    </div>
  )
}
