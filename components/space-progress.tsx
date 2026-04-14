"use client"

import { cn } from "@/lib/utils"

export interface SpaceProgressProps {
  currentStep: 1 | 2 | 3 | 4
  brandName?: string
  /** Fraction of landing items completed, e.g. { done: 3, total: 6 } */
  landingRatio?: { done: number; total: number } | null
}

const STEPS = [
  { id: 1, planet: "🌎", label: "Misión" },
  { id: 2, planet: "🪐", label: "Calibración" },
  { id: 3, planet: "⭐", label: "Despegue" },
  { id: 4, planet: "🌍", label: "Aterrizaje" },
]

export function SpaceProgress({ currentStep, brandName, landingRatio }: SpaceProgressProps) {
  const steps = STEPS.map((s) =>
    s.id === 4 && brandName ? { ...s, label: brandName } : s
  )

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep
        const isActive = step.id === currentStep

        // Step 4 special states
        const isLanding = step.id === 4
        const landingStarted = isLanding && landingRatio && landingRatio.done > 0
        const landingComplete = isLanding && landingRatio && landingRatio.done === landingRatio.total

        return (
          <div key={step.id} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "text-base transition-all duration-300",
                  isActive && "scale-125 drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]",
                  // Step 4: progressive glow based on completion
                  landingComplete && "scale-125 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]",
                  landingStarted && !landingComplete && "scale-110 opacity-70 drop-shadow-[0_0_4px_rgba(139,92,246,0.4)]",
                  !isDone && !isActive && !landingStarted && "opacity-30 grayscale"
                )}
              >
                {isDone ? "✅" : landingComplete ? "✅" : step.planet}
              </span>

              {/* Label + optional progress badge */}
              <span
                className={cn(
                  "hidden text-[10px] font-medium leading-none sm:block",
                  isDone && "text-emerald-400",
                  isActive && "text-foreground",
                  landingComplete && "text-emerald-400",
                  landingStarted && !landingComplete && "text-foreground/70",
                  !isDone && !isActive && !landingStarted && "text-muted-foreground/40"
                )}
              >
                {landingStarted && !landingComplete
                  ? `${landingRatio!.done}/${landingRatio!.total}`
                  : step.label}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1.5 h-px w-8 sm:w-12 transition-colors duration-500",
                  step.id < currentStep ? "bg-emerald-500/60" : "bg-border",
                  // Light up connector before step 4 when landing has started
                  step.id === 3 && landingStarted && "bg-emerald-500/30"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
