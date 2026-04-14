"use client"

import { useState } from "react"
import { ArrowRight, MapPin, DollarSign, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        {/* Heading */}
        <div className="space-y-2 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Lanzá el negocio{" "}
            <span className="text-primary">que siempre soñaste</span>
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-sm text-muted-foreground">
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

            {/* City and Investment Row */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                    placeholder="Ej: 500,000"
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
              La IA analiza mercado, competencia y arma tu plan de lanzamiento personalizado
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
