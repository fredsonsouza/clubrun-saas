import { ForbiddenError } from '@/http/routes/_errors/forbidden-error'

const SIMULATION_ENVIRONMENTS = new Set(['development', 'test'])

export function isSimulatedFlowAllowed(nodeEnv: string | undefined) {
  return !!nodeEnv && SIMULATION_ENVIRONMENTS.has(nodeEnv)
}

export function assertSimulatedFlowAllowed(
  nodeEnv: string | undefined = process.env.NODE_ENV
) {
  if (!isSimulatedFlowAllowed(nodeEnv)) {
    throw new ForbiddenError(
      'Fluxo de simulação indisponível fora de development/test.'
    )
  }
}
