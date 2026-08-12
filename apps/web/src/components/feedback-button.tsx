'use client'

import { submitFeedbackAction } from '@/app/private-actions'
import { AlertCircle, CheckCircle2, MessageSquarePlus, X } from 'lucide-react'
import type React from 'react'
import { useState, useTransition } from 'react'

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'BUG' | 'SUGGESTION' | 'OTHER'>('SUGGESTION')
  const [comment, setComment] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim().length < 10) {
      setError('Por favor, escreva um comentário com pelo menos 10 caracteres.')
      return
    }

    setError('')
    startTransition(async () => {
      try {
        await submitFeedbackAction({ type, comment })
        setSuccess(true)
        setComment('')
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 2500)
      } catch (err) {
        console.error(err)
        setError('Ocorreu um erro ao enviar seu feedback. Tente novamente.')
      }
    })
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-[80] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gray-900 text-orange-500 shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-orange-500 hover:text-white"
        title="Enviar Feedback"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Background Blur */}
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-gray-900/60 backdrop-blur-sm"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Card do Modal */}
          <div className="fade-in zoom-in-95 relative z-10 w-full max-w-lg animate-in rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-2xl duration-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="absolute top-6 right-6 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="font-black text-2xl text-gray-900">
                  Muito obrigado!
                </h3>
                <p className="mt-2 font-medium text-gray-500 text-sm">
                  Seu feedback foi registrado e nos ajudará a melhorar o
                  ClubRun.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-black text-2xl text-gray-900">
                    O que podemos melhorar?
                  </h3>
                  <p className="mt-1 font-medium text-gray-500 text-sm">
                    Sua opinião é fundamental para a evolução da plataforma de
                    testes.
                  </p>
                </div>

                {/* Seleção do Tipo */}
                <div className="space-y-2">
                  <span className="block font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    Categoria do Feedback
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        { id: 'SUGGESTION', label: 'Sugestão' },
                        { id: 'BUG', label: 'Bug / Erro' },
                        { id: 'OTHER', label: 'Outro' },
                      ] as const
                    ).map((opt) => {
                      const active = type === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setType(opt.id)}
                          className={`rounded-2xl border py-3 text-center font-bold text-xs transition-all ${
                            active
                              ? 'border-orange-200 bg-orange-50 text-orange-600'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Comentário */}
                <div className="space-y-2">
                  <label
                    htmlFor="feedback-comment"
                    className="font-black text-[10px] text-gray-400 uppercase tracking-widest"
                  >
                    Sua mensagem
                  </label>
                  <textarea
                    id="feedback-comment"
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Descreva seu feedback ou relate o bug em detalhes..."
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-bold text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 font-bold text-red-600 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-orange-500/10 shadow-xl transition-all hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Enviar Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
