"use client"

import { useEffect, useState } from "react"
import {
  RefreshCw,
  Gauge,
  Users,
  Scale,
  Package,
  Map,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  Target,
  Loader2,
  Zap,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { BusinessInputData } from "@/components/hero-input"
import type { PartialAnalysis } from "@/app/analisis/page"

import { BrandIdentityCard } from "@/components/brand-identity-card"
import { ViabilitySection } from "@/components/dashboard/viability-section"
import { MonetizationSection } from "@/components/dashboard/monetization-section"
import { CompetitorsSection } from "@/components/dashboard/competitors-section"
import { ClientsSection } from "@/components/dashboard/clients-section"
import { LegalSection } from "@/components/dashboard/legal-section"
import { KitSection } from "@/components/dashboard/kit-section"
import { RoadmapSection } from "@/components/dashboard/roadmap-section"
import { ObstaclesSection } from "@/components/dashboard/obstacles-section"

interface StartupDashboardProps {
  data: BusinessInputData
  partial: PartialAnalysis
  isStreaming: boolean
  onReset: () => void
}

type SectionKey = "overview" | "viability" | "monetization" | "competitors" | "clients" | "legal" | "kit" | "roadmap" | "obstacles"

function LoadingCard({ className }: { className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StartupDashboard({ data, partial, isStreaming, onReset }: StartupDashboardProps) {
  const v = partial.viability
  const d = partial.details
  const r = partial.research
  const [activeSection, setActiveSection] = useState<SectionKey>("overview")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatInvestment = (amount: number) => `$${amount.toLocaleString("en-US")}`

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-success"
    if (score >= 5) return "text-warning"
    return "text-destructive"
  }

  const getCompetitionLabel = (level: string) => {
    if (level === "Low") return "baja"
    if (level === "Medium") return "moderada"
    return "alta"
  }

  const getTrendLabel = (trend: string) => {
    if (trend === "up") return "en crecimiento"
    if (trend === "stable") return "estable"
    return "en descenso"
  }

  const getSeverityCount = (severity: "High" | "Medium" | "Low") =>
    (d?.obstacles ?? []).filter((o) => o.severity === severity).length

  const handleSectionClick = (section: SectionKey) => {
    if ((section === "competitors" || section === "kit") && !r) return
    if ((section === "obstacles" || section === "roadmap" || section === "legal") && !d) return
    setActiveSection(section)
  }

  const handleBackToOverview = () => setActiveSection("overview")

  if (activeSection !== "overview") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Button>
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {activeSection === "viability" && v && <ViabilitySection data={v.viability} />}
            {activeSection === "monetization" && v && <MonetizationSection data={v.viability} />}
            {activeSection === "competitors" && r && <CompetitorsSection data={r.competitors} city={data.city} />}
            {activeSection === "clients" && v && <ClientsSection data={v.clients} city={data.city} />}
            {activeSection === "legal" && d && <LegalSection data={d.legalStructure} />}
            {activeSection === "kit" && r && <KitSection data={r.startupKit} investment={data.investment} />}
            {activeSection === "roadmap" && d && <RoadmapSection data={d.roadmap} validationPlan={d.validationPlan} />}
            {activeSection === "obstacles" && d && <ObstaclesSection data={d.obstacles} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className={cn("mb-8 space-y-4 transition-all duration-500", isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {v?.appName ? `${v.appName} Analysis` : <Skeleton className="h-8 w-64" />}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">{data.idea}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                  <MapPin className="h-3.5 w-3.5" />{data.city}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />{formatInvestment(data.investment)}
                </span>
                {isStreaming && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />Analizando en tiempo real...
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
              <RefreshCw className="mr-2 h-4 w-4" />Nueva idea
            </Button>
          </div>
        </div>

        <div className={cn("grid gap-4 transition-all duration-700 delay-150 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>

          {v ? (
            <Card className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg sm:col-span-2 lg:row-span-2 animate-in fade-in duration-500" onClick={() => handleSectionClick("viability")}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
              <CardContent className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Gauge className="h-6 w-6 text-primary" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground">Potencial de mercado</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={cn("text-6xl font-bold", getScoreColor(v.viability.marketPotential))}>{v.viability.marketPotential}</span>
                    <span className="text-2xl text-muted-foreground">/10</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">Competencia: {getCompetitionLabel(v.viability.competitionLevel)}</span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">Tendencia: {getTrendLabel(v.viability.trend)}</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-primary">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Primer ingreso: {v.viability.timeToFirstIncome}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden sm:col-span-2 lg:row-span-2">
              <CardContent className="relative flex h-full flex-col justify-between p-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-16 w-32" />
                  <div className="flex gap-2"><Skeleton className="h-6 w-28 rounded-full" /><Skeleton className="h-6 w-24 rounded-full" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {v ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg sm:col-span-2 lg:col-span-2 animate-in fade-in duration-500" onClick={() => handleSectionClick("monetization")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.58 0.15 35 / 0.12)" }}>
                      <DollarSign className="h-5 w-5" style={{ color: "oklch(0.58 0.15 35)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Monetización</p>
                      <p className="text-sm text-muted-foreground">Modelo de negocio y precios sugeridos</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {v.viability.monetization.plans.map((plan, i) => (
                    <div key={i} className="rounded-lg border border-border bg-secondary/20 p-3">
                      <p className="text-xs font-semibold text-foreground">{plan.name}</p>
                      <p className="mt-1 text-sm font-bold text-primary">${plan.monthlyPriceArs.toLocaleString("es-AR")}</p>
                      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{plan.target}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <LoadingCard className="sm:col-span-2 lg:col-span-2" />
          )}

          {r ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("competitors")}>
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.18 270 / 0.1)" }}>
                    <TrendingUp className="h-5 w-5" style={{ color: "oklch(0.55 0.18 270)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{r.competitors.competitors.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Competidores identificados</p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />}

          {v ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("clients")}>
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.18 270 / 0.1)" }}>
                    <Users className="h-5 w-5" style={{ color: "oklch(0.55 0.18 270)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">
                    {v.clients.type === "b2b" ? v.clients.b2bClients?.length || 0 : v.clients.b2cSegments?.length || 0}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {v.clients.type === "b2b" ? "Clientes B2B potenciales" : "Segmentos B2C"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />}

          {d ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("legal")}>
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.6 0.12 160 / 0.1)" }}>
                    <Scale className="h-5 w-5" style={{ color: "oklch(0.6 0.12 160)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold text-foreground">Legal & Impuestos</p>
                  <p className="mt-1 text-sm text-muted-foreground">Estructura recomendada</p>
                  <p className="mt-1 text-xs text-muted-foreground">{d.legalStructure.structures.find((s) => s.recommended)?.name || "SAS"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{d.legalStructure.taxInfo.regime}</p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />}

          {d ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("obstacles")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.18 30 / 0.1)" }}>
                      <AlertTriangle className="h-5 w-5" style={{ color: "oklch(0.55 0.18 30)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Obstáculos y soluciones</p>
                      <p className="text-sm text-muted-foreground">{d.obstacles.length} riesgos identificados</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-2.5 py-1"><div className="h-2 w-2 rounded-full bg-destructive" /><span className="text-xs font-medium text-destructive">{getSeverityCount("High")}</span></div>
                  <div className="flex items-center gap-2 rounded-full bg-warning/10 px-2.5 py-1"><div className="h-2 w-2 rounded-full bg-warning" /><span className="text-xs font-medium text-warning">{getSeverityCount("Medium")}</span></div>
                  <div className="flex items-center gap-2 rounded-full bg-success/10 px-2.5 py-1"><div className="h-2 w-2 rounded-full bg-success" /><span className="text-xs font-medium text-success">{getSeverityCount("Low")}</span></div>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />}

          {r ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg sm:col-span-2 animate-in fade-in duration-500" onClick={() => handleSectionClick("kit")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.6 0.15 80 / 0.1)" }}>
                      <Package className="h-5 w-5" style={{ color: "oklch(0.6 0.15 80)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Kit de inicio</p>
                      <p className="text-sm text-muted-foreground">{r.startupKit.items.length} productos esenciales</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
                  {r.startupKit.budgetDistribution.map((item, i) => (
                    <div key={i} style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {r.startupKit.budgetDistribution.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sm:col-span-2">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-36" /></div>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
                <Skeleton className="mt-4 h-3 w-full rounded-full" />
                <div className="mt-3 flex gap-4"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-20" /></div>
              </CardContent>
            </Card>
          )}

          {d ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg lg:col-span-2 animate-in fade-in duration-500" onClick={() => handleSectionClick("roadmap")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.15 195 / 0.1)" }}>
                      <Map className="h-5 w-5" style={{ color: "oklch(0.55 0.15 195)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Roadmap de lanzamiento</p>
                      <p className="text-sm text-muted-foreground">{d.validationPlan.length} pasos de validación + {d.roadmap.length} fases</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="h-0.5 w-4 bg-border" />
                  {d.roadmap.map((step, i) => (
                    <div key={i} className="flex shrink-0 items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">{i + 1}</div>
                      {i < d.roadmap.length - 1 && <div className="h-0.5 w-6 bg-border" />}
                    </div>
                  ))}
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">{d.roadmap[0].period} - {d.roadmap[d.roadmap.length - 1].period}</span>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard className="lg:col-span-2" />}

        </div>
      </div>
    </div>
  )
}
