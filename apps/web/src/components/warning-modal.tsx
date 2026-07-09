'use client'

import { AlertTriangle, X } from 'lucide-react'
import React from 'react'

interface WarningModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
}

export function WarningModal({
  isOpen,
  title,
  message,
  onClose,
}: WarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 duration-200">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl duration-200">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 mx-auto">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="text-center">
          <h3 className="mb-2 text-2xl font-black text-gray-900">{title}</h3>
          <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full cursor-pointer rounded-2xl bg-gray-900 py-4 font-black text-white transition-all hover:bg-gray-800 active:scale-95 shadow-lg"
        >
          ENTENDI, VOU AJUSTAR
        </button>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer rounded-full bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
