"use client"

import { useState } from "react"
import { ArrowRight, MapPin, DollarSign, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface BusinessInputData {
  idea: string
  city: string
  investment: number
  brandName?: string
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return

    onSubmit({
      idea,
      city: city || "Buenos Aires",
      investment: parseNumber(investment) || 500000,
      brandName: brandName.trim() || undefined,
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
            <span>Tu copiloto de lanzamiento para LATAM</span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Valida tu idea{" "}
            <span className="text-primary">antes del despegue</span>
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-lg text-muted-foreground">
            Describi tu idea, indica tu ciudad e inversion inicial. La IA analiza todo y genera un plan de lanzamiento personalizado.
          </p>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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

            {/* Brand Name */}
            <div className="mt-4 space-y-2">
              <label htmlFor="brandName" className="text-sm font-medium text-foreground">
                Nombre de tu proyecto
              </label>
              <div className="relative">
                <Rocket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="brandName"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ej: MiStartup, TuApp..."
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* City and Investment Row */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* City Input */}
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-foreground">
                  Ciudad (opcional)
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
                  Inversion inicial
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
              Iniciar mision
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              La IA analiza mercado, competencia y arma tu kit de arranque personalizado
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
