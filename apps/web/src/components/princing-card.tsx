import { Check } from 'lucide-react'
import { motion } from 'motion/react'

export interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  delay: number
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  highlighted,
  delay,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex h-full flex-col rounded-3xl border p-8 transition-all duration-300 ${
        highlighted
          ? 'border-brand bg-brand/5 shadow-brand/10 z-10 scale-105 shadow-2xl'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase">
          Mais Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-400">{description}</p>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-lg font-medium text-gray-400">R$</span>
        <span className="text-4xl font-extrabold">{price}</span>
        <span className="text-sm text-gray-500">/mês</span>
      </div>

      <ul className="mb-10 grow space-y-4">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm text-gray-300"
          >
            <Check className="h-5 w-5 shrink-0 text-orange-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full cursor-pointer rounded-2xl py-4 font-bold transition-all active:scale-95 ${
          highlighted
            ? 'shadow-brand/20 bg-orange-500 text-white shadow-lg hover:bg-orange-600/90'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        Assinar Agora
      </button>
    </motion.div>
  )
}
