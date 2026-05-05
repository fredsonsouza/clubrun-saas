'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  label?: string
  aspectRatio?: 'square' | 'video'
  token?: string
}

export function ImageUpload({ value, onChange, label, aspectRatio = 'square', token }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/uploads`, {
        method: 'POST',
        body: formData,
        headers,
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
        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
          {label}
        </label>
      )}
      
      <div 
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-orange-500/50 hover:bg-orange-50/10 ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video w-full'}`}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <button
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
                <span className="text-xs font-bold">Clique para enviar</span>
              </>
            )}
          </button>
        )}
        
        <input
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
