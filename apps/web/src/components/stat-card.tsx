import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  subtitle?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const variantStyles = {
  default: 'border-zinc-700 bg-zinc-900/70',
  primary: 'border-orange-500/20 bg-orange-500/5',
  success: 'border-green-500/20 bg-green-500/5',
  warning: 'border-blue-500/20 bg-blue-500/5',
}

const iconVariantStyles = {
  default: 'bg-zinc-800 text-zinc-400',
  primary: 'bg-orange-500/10 text-orange-500',
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-blue-500/10 text-blue-500',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  subtitle,
  variant = 'default',
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend?.direction === 'up')
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      )
    if (trend?.direction === 'down')
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      )
    return null
  }

  const trendColorClass =
    trend?.direction === 'up'
      ? 'text-green-500'
      : trend?.direction === 'down'
        ? 'text-red-500'
        : 'text-zinc-500'

  return (
    <div
      className={`hover:border-opacity-100 rounded-2xl border p-6 transition-all ${variantStyles[variant]}`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Icon */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconVariantStyles[variant]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <h3 className="font-display text-4xl font-bold text-white">{value}</h3>
      </div>

      {/* Label */}
      <p className="mb-3 text-sm font-medium text-zinc-400">{label}</p>

      {/* Trend or Subtitle */}
      {trend && (
        <div
          className={`flex items-center gap-1 text-sm font-medium ${trendColorClass}`}
        >
          {getTrendIcon()}
          <span>{trend.value}</span>
        </div>
      )}

      {subtitle && !trend && (
        <p className="text-sm text-zinc-500">{subtitle}</p>
      )}
    </div>
  )
}
