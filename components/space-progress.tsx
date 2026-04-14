"use client"

import { cn } from "@/lib/utils"

export interface SpaceProgressProps {
  currentStep: 1 | 2 | 3 | 4
  brandName?: string
}

const STEPS = [
  { id: 1, planet: "🌎", label: "Tu idea" },
  { id: 2, planet: "🪐", label: "Preguntas" },
  { id: 3, planet: "⭐", label: "Análisis" },
  { id: 4, planet: "🌟", label: "Plan" },
]

export function SpaceProgress({ currentStep, brandName }: SpaceProgressProps) {
  const steps = STEPS.map((s) =>
    s.id === 4 && brandName ? { ...s, label: brandName, planet: "🌍" } : s
  )

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep
        const isActive = step.id === currentStep

        return (
          <div key={step.id} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "text-base transition-all duration-300",
                  isActive && "scale-125 drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]",
                  !isDone && !isActive && "opacity-30 grayscale"
                )}
              >
                {isDone ? "✅" : step.planet}
              </span>
              <span
                className={cn(
                  "hidden text-[10px] font-medium leading-none sm:block",
                  isDone && "text-emerald-400",
                  isActive && "text-foreground",
                  !isDone && !isActive && "text-muted-foreground/40"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1.5 h-px w-8 sm:w-12 transition-colors duration-500",
                  step.id < currentStep ? "bg-emerald-500/60" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
