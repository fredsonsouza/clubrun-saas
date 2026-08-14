import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useState } from 'react'

interface DeleteRaceModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  raceName: string
}

export function DeleteRaceModal({
  isOpen,
  onClose,
  onConfirm,
  raceName,
}: DeleteRaceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fade-in fixed inset-0 z-[60] flex animate-in items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md">
      <div className="zoom-in-95 w-full max-w-md animate-in rounded-[2.5rem] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h3 className="font-black text-2xl text-gray-900">Excluir Corrida?</h3>
        <p className="mt-4 font-medium text-gray-500 text-sm leading-relaxed">
          Você está prestes a excluir a corrida{' '}
          <span className="font-bold text-gray-900">"{raceName}"</span>. Esta
          ação é irreversível e removerá todos os dados e inscrições vinculados
          a ela.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-2xl bg-gray-100 py-4 font-bold text-gray-600 text-sm transition-all hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-black text-sm text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'EXCLUIR AGORA'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
