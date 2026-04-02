'use client'

import { Users, MapPin, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import clubrunIcon from '@/app/assets/brand/clubrun-icon.png'
import Image from 'next/image'

import FeatureCard from '@/components/feature-card'
import PricingCard from '@/components/princing-card'

export default function HomePage() {
  return (
    <div className="selection:bg-brand/30 min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex gap-1 text-2xl font-bold tracking-tight">
          <Image src={clubrunIcon} alt="ClubRun" className="h-8 w-auto" />
          Club Run
        </div>
        <div className="flex items-center gap-8">
          <Link
            href="/auth/sign-in"
            className="cursor-pointer text-sm font-medium transition-colors hover:text-orange-500"
          >
            Entrar
          </Link>
          <button className="cursor-pointer rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-500/90">
            Cadastrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-20 pb-32">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl leading-[1.1] font-extrabold tracking-tight md:text-7xl"
          >
            Gerencie Seu Clube de <br />
            <span className="text-white">Corrida com Confiança</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
          >
            Autenticação segura, gestão completa do clube e acompanhamento
            avançado de treinos em uma única plataforma. Simplifique a
            administração e concentre-se na corrida.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button className="cursor-pointer rounded-full bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-amber-700/30 transition-all hover:bg-orange-500/90 active:scale-95">
              Comece Agora
            </button>
          </motion.div>
        </div>

        {/* Features Section */}
        <section className="mt-40 space-y-12">
          <h2 className="text-3xl font-bold">Vantagens</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-white" />}
              title="Gerenciamento de Clube"
              description="Organize membros, crie clubes e gerencie funções com facilidade.."
              delay={0.3}
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8 text-white" />}
              title="Acompanhamento de Treinos"
              description="Registre rotas, distâncias, tempos e analise dados de desempenho."
              delay={0.4}
            />
            <FeatureCard
              icon={<Mail className="h-8 w-8 text-white" />}
              title="Convites & Comunidade"
              description="Convide novos membros facilmente e construa uma comunidade de corrida próspera."
              delay={0.5}
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mt-40 space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-bold">Planos e Assinaturas</h2>
            <p className="mx-auto max-w-xl text-gray-400">
              Escolha o plano ideal para o seu ritmo e alcance seus objetivos
              com o Club Run.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <PricingCard
              title="Plano Pipoca"
              price="9,90"
              description="Ideal para quem está dando os primeiros passos na corrida."
              features={[
                'Rastreamento básico de treinos',
                'Acesso à comunidade',
                'Participação em 1 clube',
                'Histórico de 30 dias',
              ]}
              delay={0.1}
            />
            <PricingCard
              title="Plano Intermediário"
              price="14,90"
              description="Para corredores que já possuem uma base e querem evoluir."
              features={[
                'Análise avançada de performance',
                'Planilhas de treino básicas',
                'Participação em até 5 clubes',
                'Histórico ilimitado',
                'Descontos em parceiros',
              ]}
              highlighted={true}
              delay={0.2}
            />
            <PricingCard
              title="Plano Elite"
              price="19,90"
              description="Para quem busca alta performance ou profissionalização."
              features={[
                'Ferramentas de coaching profissional',
                'Biomecânica detalhada',
                'Clubes ilimitados',
                'Suporte prioritário 24/7',
                'Consultoria mensal inclusa',
              ]}
              delay={0.3}
            />
          </div>
        </section>
      </main>

      {/* Footer (Optional but good for completeness) */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-gray-500 md:flex-row">
          <div>© 2026 Club Run. Todos os direitos reservados.</div>
          <div className="flex gap-8">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
