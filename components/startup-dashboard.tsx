"use client"

import { useEffect, useState } from "react"
import {
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
  Loader2,
  ShieldAlert,
  ArrowUpRight,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { BusinessInputData } from "@/components/hero-input"
import type { PartialAnalysis } from "@/app/analisis/page"
import type { SectionPlan, AnalysisSectionKey } from "@/lib/server/section-plan-prompt"

import { ViabilitySection } from "@/components/dashboard/viability-section"
import { MonetizationSection } from "@/components/dashboard/monetization-section"
import { CompetitorsSection } from "@/components/dashboard/competitors-section"
import { ClientsSection } from "@/components/dashboard/clients-section"
import { LegalSection } from "@/components/dashboard/legal-section"
import { KitSection } from "@/components/dashboard/kit-section"
import { RoadmapSection } from "@/components/dashboard/roadmap-section"
import { ObstaclesSection } from "@/components/dashboard/obstacles-section"
import { FinancialProjectionSection } from "@/components/dashboard/financial-projection-section"

interface StartupDashboardProps {
  data: BusinessInputData
  partial: PartialAnalysis
  isStreaming: boolean
  sectionPlan?: SectionPlan
  onReset: () => void
}

type SectionKey = "overview" | "viability" | "monetization" | "competitors" | "clients" | "legal" | "kit" | "roadmap" | "obstacles" | "proyeccion"

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

export function StartupDashboard({ data, partial, isStreaming, sectionPlan, onReset }: StartupDashboardProps) {
  const v = partial.viability
  const d = partial.details
  const r = partial.research
  const displayName = data.brandName || v?.appName || "Tu proyecto"
  const [activeSection, setActiveSection] = useState<SectionKey>("overview")
  const [isLoaded, setIsLoaded] = useState(false)

  const isSectionEnabled = (key: AnalysisSectionKey) =>
    !sectionPlan || sectionPlan[key].enabled

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatInvestment = (amount: number) => `$${amount.toLocaleString("es-AR")}`

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-success"
    if (score >= 5) return "text-warning"
    return "text-destructive"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return "bg-success/15 border-success/30"
    if (score >= 5) return "bg-warning/15 border-warning/30"
    return "bg-destructive/15 border-destructive/30"
  }

  const getVerdictSentence = (score: number) => {
    const cityLabel = data.city ? ` en ${data.city}` : ""
    if (score >= 7) return `${displayName} tiene órbita alta${cityLabel} — las condiciones de lanzamiento son favorables.`
    if (score >= 5) return `${displayName} tiene trayectoria viable${cityLabel} — hay turbulencia pero el camino existe.`
    return `${displayName} enfrenta gravedad fuerte${cityLabel} — necesitás repensar la misión.`
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

  const topOpportunity = v?.viability.findings.find((f) => f.type === "opportunity")
  const topRisk = d?.obstacles.find((o) => o.severity === "High")

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
            Volver al panel
          </Button>
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {activeSection === "viability" && v && <ViabilitySection data={v.viability} />}
            {activeSection === "monetization" && v && <MonetizationSection data={v.viability} />}
            {activeSection === "competitors" && r && <CompetitorsSection data={r.competitors} city={data.city} isMock={r._isMock} />}
            {activeSection === "clients" && v && <ClientsSection data={v.clients} city={data.city} />}
            {activeSection === "legal" && d && <LegalSection data={d.legalStructure} />}
            {activeSection === "kit" && r && <KitSection data={r.startupKit} investment={data.investment} />}
            {activeSection === "roadmap" && d && <RoadmapSection data={d.roadmap} validationPlan={d.validationPlan} />}
            {activeSection === "obstacles" && d && <ObstaclesSection data={d.obstacles} />}
            {activeSection === "proyeccion" && (
              <FinancialProjectionSection
                investment={data.investment ?? 0}
                businessType={data.businessType}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Verdict */}
        <div
          className={cn(
            "mb-8 transition-all duration-500",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {isStreaming && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />Analizando en tiempo real...
                </span>
              )}
            </div>
          </div>

          {v ? (
            <Card className={cn("mt-4 border", getScoreBgColor(v.viability.marketPotential))}>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                  {/* Score circle */}
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex h-24 w-24 items-center justify-center rounded-full border-4",
                        v.viability.marketPotential >= 7
                          ? "border-success/40 bg-success/10"
                          : v.viability.marketPotential >= 5
                          ? "border-warning/40 bg-warning/10"
                          : "border-destructive/40 bg-destructive/10"
                      )}
                    >
                      <div className="text-center">
                        <span className={cn("text-4xl font-bold", getScoreColor(v.viability.marketPotential))}>
                          {v.viability.marketPotential}
                        </span>
                        <span className="text-sm text-muted-foreground">/10</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Potencial</span>
                  </div>

                  {/* Verdict text */}
                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {getVerdictSentence(v.viability.marketPotential)}
                      </h1>
                      <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                        Mercado {getTrendLabel(v.viability.trend)}, competencia {getCompetitionLabel(v.viability.competitionLevel)}.
                        {" "}Tiempo estimado al primer ingreso: {v.viability.timeToFirstIncome}.
                      </p>
                    </div>

                    {/* Quick stats row */}
                    <div className="flex flex-wrap gap-3">
                      {data.city && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {data.city}
                        </span>
                      )}
                      {data.investment && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {formatInvestment(data.investment)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {v.viability.timeToFirstIncome}
                      </span>
                    </div>

                    {/* Opportunity and risk highlights */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {topOpportunity && (
                        <div className="flex items-start gap-2.5 rounded-lg bg-background/60 p-3 ring-1 ring-border">
                          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <div>
                            <p className="text-xs font-semibold text-success">Oportunidad clave</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{topOpportunity.text}</p>
                          </div>
                        </div>
                      )}
                      {topRisk && (
                        <div className="flex items-start gap-2.5 rounded-lg bg-background/60 p-3 ring-1 ring-border">
                          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          <div>
                            <p className="text-xs font-semibold text-destructive">Riesgo principal</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{topRisk.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4 border">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                  <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <div className="flex gap-3">
                      <Skeleton className="h-8 w-28 rounded-full" />
                      <Skeleton className="h-8 w-28 rounded-full" />
                      <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Command Center Widgets */}
        <div className={cn(
          "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150",
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          {/* Viabilidad */}
          {isSectionEnabled("viability") && (v ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("viability")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold text-foreground">Viabilidad</p>
                    <span className={cn("text-sm font-bold", getScoreColor(v.viability.marketPotential))}>{v.viability.marketPotential}/10</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Señales de mercado, modelo de negocio y proyecciones de crecimiento
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}

          {/* Monetización */}
          {isSectionEnabled("monetization") && (v ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("monetization")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.58 0.15 35 / 0.12)" }}>
                    <DollarSign className="h-5 w-5" style={{ color: "oklch(0.58 0.15 35)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Monetización</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.viability.monetization.plans.length} planes de precio sugeridos y referencia de mercado
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}

          {/* Competidores */}
          {isSectionEnabled("competitors") && (r ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("competitors")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.18 270 / 0.1)" }}>
                    <TrendingUp className="h-5 w-5" style={{ color: "oklch(0.55 0.18 270)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Competidores</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.competitors.competitors.length} identificados — fortalezas, debilidades y mapa de zonas
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}

          {/* Clientes */}
          {isSectionEnabled("clients") && (v ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("clients")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.18 270 / 0.1)" }}>
                    <Users className="h-5 w-5" style={{ color: "oklch(0.55 0.18 270)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Clientes</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.clients.type === "b2b"
                      ? `${v.clients.b2bClients?.length || 0} clientes B2B — perfiles y cómo abordarlos`
                      : `${v.clients.b2cSegments?.length || 0} segmentos — perfiles y canales de llegada`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}

          {/* Legal */}
          {isSectionEnabled("legal") && (d ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("legal")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.6 0.12 160 / 0.1)" }}>
                    <Scale className="h-5 w-5" style={{ color: "oklch(0.6 0.12 160)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Legal e Impuestos</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.legalStructure.structures.find((s) => s.recommended)?.name || "SAS"} recomendada — régimen fiscal y trámites
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}

          {/* Kit de inicio */}
          {isSectionEnabled("kit") && (r ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("kit")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.6 0.15 80 / 0.1)" }}>
                    <Package className="h-5 w-5" style={{ color: "oklch(0.6 0.15 80)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Kit de inicio</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.startupKit.items.length} elementos esenciales — qué comprar, dónde y a qué precio
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}

          {/* Proyección financiera */}
          <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("proyeccion")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.58 0.18 145 / 0.1)" }}>
                  <BarChart3 className="h-5 w-5" style={{ color: "oklch(0.58 0.18 145)" }} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-foreground">Proyección financiera</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Registrá gastos, simulá ingresos y calculá cuándo recuperás la inversión
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Obstáculos */}
          {isSectionEnabled("obstacles") && (d ? (
            <Card className="group cursor-pointer transition-all hover:shadow-lg animate-in fade-in duration-500" onClick={() => handleSectionClick("obstacles")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.18 30 / 0.1)" }}>
                    <AlertTriangle className="h-5 w-5" style={{ color: "oklch(0.55 0.18 30)" }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Obstáculos</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.obstacles.length} riesgos ({getSeverityCount("High")} críticos) — mitigación y casos reales
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : <LoadingCard />)}
        </div>

        {/* Roadmap Strip */}
        {isSectionEnabled("roadmap") && (d ? (
          <div className={cn(
            "mt-8 transition-all duration-700 delay-300",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <Card className="group cursor-pointer transition-all hover:shadow-lg" onClick={() => handleSectionClick("roadmap")}>
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.55 0.15 195 / 0.1)" }}>
                      <Map className="h-5 w-5" style={{ color: "oklch(0.55 0.15 195)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Hoja de ruta de lanzamiento</p>
                      <p className="text-sm text-muted-foreground">{d.roadmap.length} fases &middot; {d.validationPlan.length} pasos de validación</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>

                {/* Horizontal timeline */}
                <div className="relative flex items-start gap-0 overflow-x-auto pb-1">
                  {d.roadmap.map((step, i) => (
                    <div key={i} className="flex shrink-0 items-center">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <p className="mt-1.5 max-w-[100px] text-xs font-medium leading-tight text-foreground line-clamp-2">{step.title}</p>
                      </div>
                      {i < d.roadmap.length - 1 && <div className="mx-2 mt-[-20px] h-0.5 w-8 shrink-0 bg-border" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <Skeleton className="mt-5 h-8 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
