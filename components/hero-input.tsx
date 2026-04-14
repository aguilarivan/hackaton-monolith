"use client"

import { useState } from "react"
import { Rocket, MapPin, DollarSign, Tag } from "lucide-react"

export type BusinessType = "fisica" | "digital" | "ambos"

export interface BusinessInputData {
  idea: string
  city?: string
  investment?: number
  brandName?: string
  businessType?: BusinessType
}

const BUSINESS_TYPES: { value: BusinessType; emoji: string; label: string; desc: string }[] = [
  { value: "fisica",  emoji: "🏪", label: "Local físico",      desc: "Tienda, restaurante, taller..." },
  { value: "digital", emoji: "💻", label: "Digital / Online",  desc: "App, e-commerce, servicio web..." },
  { value: "ambos",   emoji: "🔄", label: "Físico y digital",  desc: "Presencia en ambos canales" },
]

interface HeroInputProps {
  onSubmit: (data: BusinessInputData) => void
}

function formatNumber(value: string): string {
  const num = value.replace(/\D/g, "")
  if (!num) return ""
  return Number(num).toLocaleString("es-AR")
}

function parseNumber(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0
}

export function HeroInput({ onSubmit }: HeroInputProps) {
  const [idea, setIdea] = useState("")
  const [city, setCity] = useState("")
  const [investment, setInvestment] = useState("")
  const [brandName, setBrandName] = useState("")
  const [businessType, setBusinessType] = useState<BusinessType | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return

    onSubmit({
      idea,
      city: city.trim() || undefined,
      investment: parseNumber(investment) || undefined,
      brandName: brandName.trim() || undefined,
      businessType: businessType ?? undefined,
    })
  }

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value)
    setInvestment(formatted)
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="relative mx-auto w-full max-w-3xl">
        {/* Decorative twinkling dots */}
        <span className="dz-twinkle pointer-events-none absolute -left-4 top-6 hidden h-1.5 w-1.5 rounded-full bg-primary/50 sm:block" />
        <span
          className="dz-twinkle pointer-events-none absolute -right-3 top-20 hidden h-1 w-1 rounded-full bg-primary/40 sm:block"
          style={{ animationDelay: "2s" }}
        />
        <span className="dz-float pointer-events-none absolute right-10 -top-2 hidden h-2 w-2 rounded-full bg-primary/20 sm:block" />

        {/* Heading */}
        <div className="dz-enter-1 text-center">
          <h1 className="font-display text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Lanzá el negocio{" "}
            <span className="bg-gradient-to-r from-primary via-[oklch(0.6_0.18_175)] to-[oklch(0.55_0.16_160)] bg-clip-text text-transparent">
              que siempre soñaste
            </span>
          </h1>
        </div>

        <p className="dz-enter-2 mx-auto mt-5 max-w-xl text-pretty text-center text-base text-muted-foreground sm:text-lg">
          Describí tu idea, tu ciudad y tu inversión inicial. La IA analiza
          todo y genera un informe completo adaptado a tu contexto.
        </p>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="dz-enter-3 mt-10">
          <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-primary/[0.08] dark:bg-white/[0.03] dark:shadow-2xl dark:shadow-primary/[0.05]">
            {/* Brand Name Input */}
            <div className="space-y-2">
              <label htmlFor="brandName" className="text-sm font-medium text-foreground">
                ¿Tenés un nombre para tu marca?{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="brandName"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ej: Empanadas La Abuela"
                  className="dz-input w-full rounded-xl border border-input bg-background/50 py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground dark:bg-white/[0.02]"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-border/50 dark:border-white/[0.06]" />

            {/* Idea Textarea */}
            <div className="space-y-2">
              <label htmlFor="idea" className="text-sm font-medium text-foreground">
                Tu idea de negocio
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ej: servicio de catering corporativo en Buenos Aires"
                className="dz-input min-h-[110px] w-full resize-none rounded-xl border border-input bg-background/50 p-4 text-base text-foreground placeholder:text-muted-foreground dark:bg-white/[0.02]"
              />
            </div>

            {/* City and Investment Row */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* City Input */}
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-foreground">
                  Ciudad
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Buenos Aires"
                    className="dz-input w-full rounded-xl border border-input bg-background/50 py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground dark:bg-white/[0.02]"
                  />
                </div>
              </div>

              {/* Investment Input */}
              <div className="space-y-2">
                <label htmlFor="investment" className="text-sm font-medium text-foreground">
                  Inversión inicial
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="investment"
                    type="text"
                    value={investment}
                    onChange={handleInvestmentChange}
                    placeholder="Ej: 500.000"
                    className="dz-input w-full rounded-xl border border-input bg-background/50 py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground dark:bg-white/[0.02]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ARS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="dz-enter-4 mt-8 flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={!idea.trim()}
              className="dz-cta group inline-flex h-14 items-center justify-center gap-3 rounded-xl px-10 text-lg font-semibold text-white"
            >
              Iniciar misión
              <Rocket className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-12" />
            </button>
            <p className="text-center text-sm text-muted-foreground">
              La IA analiza mercado, competencia y arma tu plan de lanzamiento personalizado
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
