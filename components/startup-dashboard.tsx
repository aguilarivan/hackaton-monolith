"use client"

import { useEffect, useState } from "react"
import {
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { BusinessInputData } from "@/components/hero-input"
import type { PartialAnalysis } from "@/app/analisis/page"
import type { SectionPlan, AnalysisSectionKey } from "@/lib/server/section-plan-prompt"

import { BrandIdentityCard } from "@/components/brand-identity-card"
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
            {activeSection === "viability" && v && <ViabilitySection data={v.viability} isStreaming={isStreaming} />}
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

        {/* ── Hero: Marca + Veredicto integrados ──────────────── */}
        <div className={cn("mb-8 transition-all duration-500", isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
          {isStreaming && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />Analizando en tiempo real...
              </span>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
            {/* Izquierda: Marca */}
            <div className="lg:w-72 shrink-0 flex flex-col">
              <BrandIdentityCard
                businessData={data}
                businessLabel={v?.viability.businessModel.type}
                description={(() => {
                  const parts: string[] = []
                  if (data.idea) parts.push(data.idea)
                  if (data.city) parts.push(data.city)
                  if (data.businessType === "fisica") parts.push("local físico")
                  else if (data.businessType === "digital") parts.push("digital")
                  else if (data.businessType === "ambos") parts.push("físico y digital")
                  return parts.length ? parts.join(" · ") : undefined
                })()}
                className="flex-1"
              />
            </div>
            {/* Derecha: Veredicto */}
            <div className="flex-1">
              {v ? (
                <Card className={cn("h-full border", getScoreBgColor(v.viability.marketPotential))}>
                  <CardContent className="flex h-full flex-col justify-center p-6 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
                      <div className="flex shrink-0 flex-col items-center gap-2">
                        <div className={cn("flex h-24 w-24 items-center justify-center rounded-full border-4",
                          v.viability.marketPotential >= 7 ? "border-success/40 bg-success/10"
                          : v.viability.marketPotential >= 5 ? "border-warning/40 bg-warning/10"
                          : "border-destructive/40 bg-destructive/10")}>
                          <div className="text-center">
                            <span className={cn("text-4xl font-bold", getScoreColor(v.viability.marketPotential))}>{v.viability.marketPotential}</span>
                            <span className="text-sm text-muted-foreground">/10</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Potencial</span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-4">
                        <div>
                          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{getVerdictSentence(v.viability.marketPotential)}</h1>
                          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                            Mercado {getTrendLabel(v.viability.trend)}, competencia {getCompetitionLabel(v.viability.competitionLevel)}.{" "}
                            Tiempo estimado al primer ingreso: {v.viability.timeToFirstIncome}.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {data.city && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
                              <MapPin className="h-3.5 w-3.5 text-primary" />{data.city}
                            </span>
                          )}
                          {data.investment && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
                              <DollarSign className="h-3.5 w-3.5 text-primary" />{formatInvestment(data.investment)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
                            <Clock className="h-3.5 w-3.5 text-primary" />{v.viability.timeToFirstIncome}
                          </span>
                        </div>
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
                <Card className="h-full border">
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
          </div>
        </div>

        {/* ── Sección 1: Entendé tu idea ─────────────────────────── */}
        <div className={cn("mt-8 transition-all duration-700 delay-150", isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Entendé tu idea</h2>
              <p className="text-xs text-muted-foreground">Mercado, competencia y quiénes son tus clientes</p>
            </div>
            <div className="ml-2 h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {/* Viabilidad */}
            {isSectionEnabled("viability") && (v ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(79,70,229,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("viability")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #312e81, #4f46e5)" }}>🚀</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Calculamos un puntaje de potencial con señales reales: Google Trends, publicaciones en Mercado Libre y datos del INDEC.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-foreground">Viabilidad</h3>
                      <span className={cn("text-base font-bold", getScoreColor(v.viability.marketPotential))}>{v.viability.marketPotential}/10</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">Potencial de mercado, modelo de negocio y proyecciones de crecimiento</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}

            {/* Competidores */}
            {isSectionEnabled("competitors") && (r ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(29,78,216,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("competitors")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)" }}>🏆</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Mapeamos quiénes ya juegan en tu mercado, dónde están ubicados, sus puntos fuertes y sus puntos débiles.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground">Competidores</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.competitors.competitors.length} identificados con fortalezas, debilidades y mapa de zonas</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}

            {/* Clientes */}
            {isSectionEnabled("clients") && (v ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(8,145,178,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("clients")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #164e63, #0891b2)" }}>🤝</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Identificamos quiénes son tus primeros clientes, cómo llegar a ellos y qué los motiva a comprarte.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground">Clientes</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {v.clients.type === "b2b"
                        ? `${v.clients.b2bClients?.length || 0} perfiles B2B con estrategia de abordaje`
                        : `${v.clients.b2cSegments?.length || 0} segmentos con perfiles y canales de llegada`}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}
          </div>
        </div>

        {/* ── Sección 2: Tomá decisiones ──────────────────────────── */}
        <div className={cn("mt-8 transition-all duration-700 delay-300", isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Tomá decisiones</h2>
              <p className="text-xs text-muted-foreground">Definí precios, proyectá costos e ingresos</p>
            </div>
            <div className="ml-2 h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Monetización */}
            {isSectionEnabled("monetization") && (v ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(217,119,6,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("monetization")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #78350f, #d97706)" }}>💰</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Sugerimos planes de precio basados en tu modelo de negocio y los precios reales de la competencia en tu mercado.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground">Monetización</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{v.viability.monetization.plans.length} planes de precio sugeridos con referencia de mercado y competencia</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}

            {/* Proyección financiera */}
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(5,150,105,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("proyeccion")}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #14532d, #059669)" }}>📊</div>
                  <div className="relative group/tip">
                    <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                    <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                      Registrá tus gastos e ingresos estimados para saber exactamente cuándo recuperás la inversión inicial.
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex-1">
                  <h3 className="text-xl font-bold text-foreground">Proyección financiera</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">Registrá gastos, simulá ingresos y calculá cuándo recuperás la inversión</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Sección 3: Tu plan de acción ────────────────────────── */}
        <div className={cn("mt-8 transition-all duration-700 delay-500", isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Tu plan de acción</h2>
              <p className="text-xs text-muted-foreground">Estructura legal, herramientas, hoja de ruta y riesgos</p>
            </div>
            <div className="ml-2 h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {/* Legal */}
            {isSectionEnabled("legal") && (d ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(67,56,202,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("legal")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #1e1b4b, #4338ca)" }}>⚖️</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Qué estructura societaria conviene, en qué categoría de monotributo inscribirte y cuáles son los trámites iniciales clave.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground">Legal e Impuestos</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{d.legalStructure.structures.find((s) => s.recommended)?.name || "SAS"} recomendada — régimen fiscal y trámites iniciales</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}

            {/* Kit de inicio */}
            {isSectionEnabled("kit") && (r ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(162,28,175,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("kit")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #4a044e, #a21caf)" }}>🧰</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Los productos y herramientas esenciales para arrancar, con opciones de compra reales en Mercado Libre.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground">Kit de inicio</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.startupKit.items.length} elementos esenciales — qué comprar, dónde y a qué precio</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}

            {/* Obstáculos */}
            {isSectionEnabled("obstacles") && (d ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.05) 0%, transparent 50%)" }} onClick={() => handleSectionClick("obstacles")}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #7f1d1d, #ef4444)" }}>☄️</div>
                    <div className="relative group/tip">
                      <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>?</button>
                      <div className="pointer-events-none absolute right-0 top-8 z-20 w-56 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-xl opacity-0 translate-y-1 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-0">
                        Los riesgos más frecuentes para este tipo de negocio y cómo otros emprendedores los superaron.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground">Obstáculos</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{d.obstacles.length} riesgos detectados ({getSeverityCount("High")} críticos) con estrategias de mitigación</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ) : <LoadingCard />)}
          </div>

          {/* Roadmap — full width */}
          <div className="mt-4">
            {isSectionEnabled("roadmap") && (d ? (
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl" style={{ background: "linear-gradient(145deg, rgba(2,132,199,0.05) 0%, transparent 40%)" }} onClick={() => handleSectionClick("roadmap")}>
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg" style={{ background: "linear-gradient(135deg, #0c4a6e, #0284c7)" }}>🧭</div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Hoja de ruta</h3>
                        <p className="text-sm text-muted-foreground">{d.roadmap.length} fases &middot; {d.validationPlan.length} pasos de validación</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="relative flex items-start gap-0 overflow-x-auto pb-1">
                    {d.roadmap.map((step, i) => (
                      <div key={i} className="flex shrink-0 items-center">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">{i + 1}</div>
                          <p className="mt-1.5 max-w-[100px] text-xs font-medium leading-tight text-foreground line-clamp-2">{step.title}</p>
                        </div>
                        {i < d.roadmap.length - 1 && <div className="mx-2 mt-[-20px] h-0.5 w-8 shrink-0 bg-border" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                  <Skeleton className="mt-5 h-8 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
