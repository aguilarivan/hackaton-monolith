"use client"

import { cn } from "@/lib/utils"

const steps = [
  { label: "Tu idea", path: "/" },
  { label: "Preguntas", path: "/preguntas-claude" },
  { label: "Analisis", path: "/analisis" },
]

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isDone = stepNumber < currentStep

        return (
          <div key={step.path} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-primary/20 text-primary",
                  !isActive && !isDone && "bg-muted text-muted-foreground"
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  isActive && "font-medium text-foreground",
                  isDone && "text-primary",
                  !isActive && !isDone && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  isDone ? "bg-primary/40" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
