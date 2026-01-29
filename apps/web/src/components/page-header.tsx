import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-(--gray-700) pb-6">
      <div className="space-y-1">
        <h1 className="text-[20px] leading-8 font-bold text-(--gray-100)">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-(--gray-300)">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  )
}
