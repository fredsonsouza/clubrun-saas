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
    <div className="animate-in fade-in fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
      <div className="animate-in zoom-in-95 w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h3 className="text-2xl font-black text-gray-900">Excluir Corrida?</h3>
        <p className="mt-4 text-sm font-medium leading-relaxed text-gray-500">
          Você está prestes a excluir a corrida{' '}
          <span className="font-bold text-gray-900">"{raceName}"</span>. Esta
          ação é irreversível e removerá todos os dados e inscrições vinculados
          a ela.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-2xl bg-gray-100 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-[1.5] flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
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
