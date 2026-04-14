"use client"

import { cn } from "@/lib/utils"

export interface SpaceProgressProps {
  currentStep: 1 | 2 | 3 | 4
  brandName?: string
}

const STEPS = [
  {
    id: 1,
    planet: "🌎",
    label: "Contaste tu idea",
    color: "from-emerald-500/30 to-emerald-600/20",
    ring: "ring-emerald-500",
    glow: "shadow-emerald-500/40",
  },
  {
    id: 2,
    planet: "🪐",
    label: "Respondé las preguntas",
    color: "from-violet-500/30 to-violet-600/20",
    ring: "ring-violet-500",
    glow: "shadow-violet-500/40",
  },
  {
    id: 3,
    planet: "⭐",
    label: "Analizamos tu idea",
    color: "from-amber-500/30 to-amber-600/20",
    ring: "ring-amber-500",
    glow: "shadow-amber-500/40",
  },
  {
    id: 4,
    planet: "🌟",
    label: "Tu plan de negocio",
    color: "from-sky-500/30 to-sky-600/20",
    ring: "ring-sky-500",
    glow: "shadow-sky-500/40",
  },
]

const STARS = [
  { x: "5%",  y: "18%", size: 1.5 },
  { x: "12%", y: "72%", size: 1 },
  { x: "19%", y: "38%", size: 2 },
  { x: "28%", y: "85%", size: 1 },
  { x: "34%", y: "12%", size: 1.5 },
  { x: "47%", y: "60%", size: 1 },
  { x: "53%", y: "28%", size: 2 },
  { x: "61%", y: "80%", size: 1 },
  { x: "70%", y: "20%", size: 1.5 },
  { x: "78%", y: "68%", size: 1 },
  { x: "85%", y: "40%", size: 2 },
  { x: "93%", y: "15%", size: 1 },
  { x: "97%", y: "78%", size: 1.5 },
]

export function SpaceProgress({ currentStep, brandName }: SpaceProgressProps) {
  const steps = STEPS.map((s) =>
    s.id === 4 && brandName ? { ...s, label: brandName, planet: "🌍" } : s
  )

  // Rocket sits between completed and current planet
  // Position it roughly at (currentStep - 1) gap
  const rocketLeftPct = currentStep === 1
    ? 0
    : `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 1.5rem)`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#06061a] px-6 py-6 shadow-xl">
      {/* Stars */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              left: star.x,
              top: star.y,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0.5 + (i % 3) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Connecting line */}
      <div className="absolute left-10 right-10 top-[3.15rem] h-0.5 bg-white/10" />
      {/* Progress fill */}
      <div
        className="absolute left-10 top-[3.15rem] h-0.5 bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-400 transition-all duration-700"
        style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% * (100% - 5rem) / 100% )` }}
      />

      {/* Rocket */}
      <div
        className="absolute top-5 z-20 text-2xl transition-all duration-700"
        style={{ left: rocketLeftPct }}
      >
        <span className="inline-block animate-bounce drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
          🚀
        </span>
      </div>

      {/* Planets row */}
      <div className="relative z-10 flex items-start justify-between pt-2">
        {steps.map((step) => {
          const isDone = step.id < currentStep
          const isActive = step.id === currentStep

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center gap-2">
              {/* Planet */}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-2xl shadow-lg ring-2 transition-all duration-500",
                  isDone && `${step.color} ${step.ring} ${step.glow} shadow-md opacity-100`,
                  isActive && `${step.color} ${step.ring} ${step.glow} shadow-lg scale-110`,
                  !isDone && !isActive && "bg-white/5 ring-white/10 opacity-40 grayscale"
                )}
              >
                {isDone ? "✅" : step.planet}
              </div>

              {/* Label */}
              <p
                className={cn(
                  "text-center text-[0.68rem] font-medium leading-tight transition-all duration-300",
                  isDone && "text-emerald-400",
                  isActive && "text-white",
                  !isDone && !isActive && "text-white/30"
                )}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
