'use client'

import { motion, AnimatePresence } from 'motion/react'
import { AlertCircle } from 'lucide-react'

interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-xs font-bold text-red-500"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
