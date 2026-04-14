"use client"

import { useState } from "react"
import { ArrowRight, MapPin, DollarSign, Rocket, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type BusinessType = "fisica" | "digital" | "ambos"

export interface BusinessInputData {
  idea: string
  city: string
  investment: number
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
  return Number(num).toLocaleString("en-US")
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
      city: city || "Buenos Aires",
      investment: parseNumber(investment) || 500000,
      brandName: brandName.trim() || undefined,
      businessType: businessType ?? undefined,
    })
  }

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value)
    setInvestment(formatted)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Rocket className="h-3.5 w-3.5 text-primary" />
            <span>Paso 1 · Validá tu idea de negocio</span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Empezá el negocio{" "}
            <span className="text-primary">que siempre soñaste</span>
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-base text-muted-foreground">
            Describí tu idea, tu ciudad y tu inversión inicial. La IA analiza todo y genera un informe completo adaptado a tu contexto.
          </p>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-border" />

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
                className="min-h-[100px] w-full resize-none rounded-lg border border-input bg-background p-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Business Type Selector */}
            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-foreground">
                ¿Cómo va a funcionar tu negocio?{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BUSINESS_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setBusinessType(businessType === t.value ? null : t.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all",
                      businessType === t.value
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-secondary/40"
                    )}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className={cn(
                      "text-xs font-semibold leading-tight",
                      businessType === t.value ? "text-primary" : "text-foreground"
                    )}>
                      {t.label}
                    </span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City and Investment Row */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* City Input */}
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-foreground">
                  Ciudad <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Buenos Aires"
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    placeholder="500,000"
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ARS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={!idea.trim()}
              className="h-12 px-8 text-base font-medium"
            >
              Validar mi idea
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              La IA analiza mercado, competencia y arma tu kit de startup personalizado
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
