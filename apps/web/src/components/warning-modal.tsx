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
    <div className="fade-in fixed inset-0 z-[100] flex animate-in items-center justify-center p-4 duration-200">
      <button
        type="button"
        aria-label="Fechar aviso"
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="zoom-in-95 relative w-full max-w-md animate-in overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl duration-200">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="text-center">
          <h3 className="mb-2 font-black text-2xl text-gray-900">{title}</h3>
          <p className="mb-8 font-medium text-gray-500 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-pointer rounded-2xl bg-gray-900 py-4 font-black text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
        >
          ENTENDI, VOU AJUSTAR
        </button>

        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer rounded-full bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
