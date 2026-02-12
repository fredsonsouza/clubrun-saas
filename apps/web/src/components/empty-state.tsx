import { LucideIcon } from 'lucide-react'
import { Button } from './ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/50">
        <Icon className="h-10 w-10 text-zinc-500" />
      </div>

      {/* Title */}
      <h3 className="font-heading mb-2 text-2xl font-bold text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-zinc-400">{description}</p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
