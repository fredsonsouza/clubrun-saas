import { Target, Plus, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: 'km' | 'workouts' | 'pace'
}

interface AthleteGoalsProps {
  goals: Goal[]
  canEdit?: boolean
  onAddGoal?: () => void
}

export function AthleteGoals({
  goals,
  canEdit = false,
  onAddGoal,
}: AthleteGoalsProps) {
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getUnitLabel = (unit: string) => {
    if (unit === 'km') return 'km'
    if (unit === 'workouts') return 'treinos'
    if (unit === 'pace') return 'min/km'
    return ''
  }

  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
            <Target className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              Metas do Mês
            </h2>
            <p className="text-sm text-zinc-500">Acompanhe seu progresso</p>
          </div>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="ghost"
            className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
            onClick={onAddGoal}
          >
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-5">
          {goals.map((goal) => {
            const progress = getProgress(goal.current, goal.target)
            const isCompleted = progress >= 100

            return (
              <div key={goal.id} className="space-y-2">
                {/* Goal Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">
                    {goal.title}
                  </h3>
                  {isCompleted && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-green-500'
                        : 'bg-linear-to-r from-orange-500 to-orange-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Progress Text */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    {goal.current} / {goal.target} {getUnitLabel(goal.unit)}
                  </span>
                  <span
                    className={`font-semibold ${
                      isCompleted ? 'text-green-500' : 'text-orange-500'
                    }`}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Target className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
          <p className="mb-2 text-sm font-medium text-zinc-400">
            Nenhuma meta definida
          </p>
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
              onClick={onAddGoal}
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar primeira meta
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
