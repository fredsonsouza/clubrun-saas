'use client'

import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useEffect } from 'react'

const MapView = dynamic(
  () => import('@/components/map-view').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full animate-pulse items-center justify-center rounded-[3rem] bg-gray-100 font-bold text-gray-400 text-xs">
        Carregando percurso...
      </div>
    ),
  }
)

interface RouteViewModalProps {
  isOpen: boolean
  onClose: () => void
  routeData: any
  title?: string
}

export function RouteViewModal({
  isOpen,
  onClose,
  routeData,
  title,
}: RouteViewModalProps) {
  // Listen for ESC key to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fade-in fixed inset-0 z-[100] flex animate-in items-center justify-center p-4 duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="zoom-in-95 relative flex w-full max-w-4xl animate-in flex-col overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-2xl duration-200 md:p-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="font-black text-[10px] text-orange-600 uppercase tracking-widest">
              Visualização do Trajeto
            </span>
            <h3 className="font-black text-gray-900 text-xl leading-tight md:text-2xl">
              {title || 'Percurso do Treino'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-gray-100">
          <MapView routeData={routeData} />
        </div>
      </div>
    </div>
  )
}
