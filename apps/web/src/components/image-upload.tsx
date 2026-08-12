'use client'

import { Loader2, Upload, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  label?: string
  aspectRatio?: 'square' | 'video'
}

export function ImageUpload({
  value,
  onChange,
  label,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Falha no upload')
      }

      const { url } = await response.json()
      onChange(url)
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
        >
          {label}
        </label>
      )}

      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 border-dashed bg-gray-50 transition-all hover:border-orange-500/50 hover:bg-orange-50/10 ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video w-full'}`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Remover imagem"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-transform hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 text-gray-400 transition-colors hover:text-orange-500"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="font-bold text-xs">Clique para enviar</span>
              </>
            )}
          </button>
        )}

        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    </div>
  )
}
