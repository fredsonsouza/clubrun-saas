import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay: number
  className?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay,
  className = '',
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`group flex cursor-default flex-col rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/8 ${className}`}
    >
      <div className="mb-6 w-fit rounded-xl bg-white/5 p-3 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="leading-relaxed text-gray-400">{description}</p>
    </motion.div>
  )
}
