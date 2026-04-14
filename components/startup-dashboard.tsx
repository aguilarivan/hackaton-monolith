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
  Rocket,
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { generateAnalysis, type StartupAnalysis } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { BusinessInputData } from "@/components/hero-input"

// Import section detail components
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
  analysisOverride?: StartupAnalysis
  onReset: () => void
}

type SectionKey = "overview" | "viability" | "monetization" | "competitors" | "clients" | "legal" | "kit" | "roadmap" | "obstacles"

export function StartupDashboard({ data, analysisOverride, onReset }: StartupDashboardProps) {
  const analysis = analysisOverride ?? generateAnalysis(data)
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

  const getSeverityCount = (severity: "High" | "Medium" | "Low") =>
    analysis.obstacles.filter((o) => o.severity === severity).length

  // Handle section navigation
  const handleSectionClick = (section: SectionKey) => {
    setActiveSection(section)
  }

  const handleBackToOverview = () => {
    setActiveSection("overview")
  }

  // Detail view for each section
  if (activeSection !== "overview") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>

          {/* Section Detail Content */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {activeSection === "viability" && <ViabilitySection data={analysis.viability} />}
            {activeSection === "monetization" && <MonetizationSection data={analysis.viability} />}
            {activeSection === "competitors" && <CompetitorsSection data={analysis.competitors} city={data.city} />}
            {activeSection === "clients" && <ClientsSection data={analysis.clients} city={data.city} />}
            {activeSection === "legal" && <LegalSection data={analysis.legalStructure} />}
            {activeSection === "kit" && <KitSection data={analysis.startupKit} investment={data.investment} />}
            {activeSection === "roadmap" && <RoadmapSection data={analysis.roadmap} validationPlan={analysis.validationPlan} />}
            {activeSection === "obstacles" && <ObstaclesSection data={analysis.obstacles} />}
          </div>
        </div>
      </div>
    )
  }

  // Overview Dashboard with Bento Grid
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            "mb-8 transition-all duration-500",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {analysis.appName} Analysis
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
                {data.idea}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  {data.city}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  {formatInvestment(data.investment)}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
              <RefreshCw className="mr-2 h-4 w-4" />
              New idea
            </Button>
          </div>
        </div>

        {/* Bento Grid Dashboard */}
        <div
          className={cn(
            "grid gap-4 transition-all duration-700 delay-150",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          {/* Main Viability Score - Large Card */}
          <Card
            className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg sm:col-span-2 lg:row-span-2"
            onClick={() => handleSectionClick("viability")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <CardContent className="relative flex h-full flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground">Market Potential</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={cn("text-6xl font-bold", getScoreColor(analysis.viability.marketPotential))}>
                    {analysis.viability.marketPotential}
                  </span>
                  <span className="text-2xl text-muted-foreground">/10</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    Competition: {analysis.viability.competitionLevel}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    Barrier: {analysis.viability.entryBarrier}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Score based on live-like source signals
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  First income: {analysis.viability.timeToFirstIncome}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monetization Card - Same level as Viability */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg sm:col-span-2 lg:col-span-2"
            onClick={() => handleSectionClick("monetization")}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "oklch(0.58 0.15 35 / 0.12)" }}
                  >
                    <DollarSign className="h-5 w-5" style={{ color: "oklch(0.58 0.15 35)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Monetization</p>
                    <p className="text-sm text-muted-foreground">Business model + suggested pricing</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {analysis.viability.monetization.plans.map((plan, index) => (
                  <div key={index} className="rounded-lg border border-border bg-secondary/20 p-3">
                    <p className="text-xs font-semibold text-foreground">{plan.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      ${plan.monthlyPriceArs.toLocaleString("es-AR")}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{plan.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitors Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleSectionClick("competitors")}
          >
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "oklch(0.55 0.18 270 / 0.1)" }}
                >
                  <TrendingUp className="h-5 w-5" style={{ color: "oklch(0.55 0.18 270)" }} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {analysis.competitors.competitors.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Main competitors
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clients Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleSectionClick("clients")}
          >
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "oklch(0.55 0.18 270 / 0.1)" }}
                >
                  <Users className="h-5 w-5" style={{ color: "oklch(0.55 0.18 270)" }} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {analysis.clients.type === "b2b"
                    ? analysis.clients.b2bClients?.length || 0
                    : analysis.clients.b2cSegments?.length || 0}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {analysis.clients.type === "b2b" ? "Potential B2B clients" : "B2C segments"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleSectionClick("legal")}
          >
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "oklch(0.6 0.12 160 / 0.1)" }}
                >
                  <Scale className="h-5 w-5" style={{ color: "oklch(0.6 0.12 160)" }} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4">
                <p className="text-lg font-bold text-foreground">
                  Legal & Taxes
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Recommended path</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {analysis.legalStructure.structures.find((s) => s.recommended)?.name || "SAS"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.legalStructure.taxInfo.regime}</p>
              </div>
            </CardContent>
          </Card>

          {/* Obstacles Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleSectionClick("obstacles")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "oklch(0.55 0.18 30 / 0.1)" }}
                  >
                    <AlertTriangle className="h-5 w-5" style={{ color: "oklch(0.55 0.18 30)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Obstacles & Solutions</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.obstacles.length} risks identified
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-2.5 py-1">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-xs font-medium text-destructive">{getSeverityCount("High")}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-warning/10 px-2.5 py-1">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span className="text-xs font-medium text-warning">{getSeverityCount("Medium")}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-success/10 px-2.5 py-1">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs font-medium text-success">{getSeverityCount("Low")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kit de Arranque - Medium Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg sm:col-span-2"
            onClick={() => handleSectionClick("kit")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "oklch(0.6 0.15 80 / 0.1)" }}
                  >
                    <Package className="h-5 w-5" style={{ color: "oklch(0.6 0.15 80)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Starter Kit</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.startupKit.items.length} essential products
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              {/* Budget Bar */}
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
                {analysis.startupKit.budgetDistribution.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {analysis.startupKit.budgetDistribution.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Roadmap Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg lg:col-span-2"
            onClick={() => handleSectionClick("roadmap")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "oklch(0.55 0.15 195 / 0.1)" }}
                  >
                    <Map className="h-5 w-5" style={{ color: "oklch(0.55 0.15 195)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Launch Roadmap</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.validationPlan.length} validation steps + {analysis.roadmap.length} launch phases
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              {/* Timeline Preview */}
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                  <Target className="h-4 w-4" />
                </div>
                <div className="h-0.5 w-4 bg-border" />
                {analysis.roadmap.map((step, index) => (
                  <div key={index} className="flex shrink-0 items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    {index < analysis.roadmap.length - 1 && (
                      <div className="h-0.5 w-6 bg-border" />
                    )}
                  </div>
                ))}
                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                  {analysis.roadmap[0].period} - {analysis.roadmap[analysis.roadmap.length - 1].period}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
