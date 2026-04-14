"use client"

import { Gauge, Clock, Database, ArrowUpRight, ArrowDownRight, Minus, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ViabilityData } from "@/lib/mock-data"
import {
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface ViabilitySectionProps {
  data: ViabilityData
  isStreaming?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-success bg-success/10 border-success/30"
  if (score >= 5) return "text-warning bg-warning/10 border-warning/30"
  return "text-destructive bg-destructive/10 border-destructive/30"
}

function getLevelColor(level: "Low" | "Medium" | "High"): string {
  switch (level) {
    case "Low":
      return "bg-success/10 text-success border-success/30"
    case "Medium":
      return "bg-warning/10 text-warning border-warning/30"
    case "High":
      return "bg-destructive/10 text-destructive border-destructive/30"
  }
}

function getFindingColor(type: "opportunity" | "caution" | "risk"): string {
  switch (type) {
    case "opportunity":
      return "bg-success"
    case "caution":
      return "bg-warning"
    case "risk":
      return "bg-destructive"
  }
}

function getTrendAccent(trend: "up" | "stable" | "down") {
  if (trend === "up") {
    return {
      icon: ArrowUpRight,
      line: "var(--chart-2)",
      area: "color-mix(in oklab, var(--chart-2) 14%, transparent)",
      badge: "bg-success/10 text-success border-success/30",
      label: "Tendencia: Creciendo",
    }
  }
  if (trend === "stable") {
    return {
      icon: Minus,
      line: "var(--warning)",
      area: "color-mix(in oklab, var(--warning) 16%, transparent)",
      badge: "bg-warning/10 text-warning border-warning/30",
      label: "Tendencia: Estable",
    }
  }
  return {
    icon: ArrowDownRight,
    line: "var(--destructive)",
    area: "color-mix(in oklab, var(--destructive) 13%, transparent)",
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    label: "Tendencia: Bajando",
  }
}

export function ViabilitySection({ data, isStreaming }: ViabilitySectionProps) {
  const signalsLoading = isStreaming && data.sourceSignals.length === 0
  const similarLoading = isStreaming && data.similarIdeas.length === 0

  const formatSignalTrendLabel = (trend: "up" | "stable" | "down") => {
    if (trend === "up") return "Fuente: Creciendo"
    if (trend === "stable") return "Fuente: Estable"
    return "Fuente: Bajando"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Potencial de Mercado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("rounded-lg border p-4 text-center", getScoreColor(data.marketPotential))}>
              <p className="text-3xl font-bold">{data.marketPotential}/10</p>
              <p className="mt-1 text-sm font-medium">Puntaje Dinámico de Potencial</p>
            </div>

            <div className={cn("rounded-lg border p-4 text-center", getLevelColor(data.competitionLevel))}>
              <p className="text-2xl font-bold">{data.competitionLevel === "Low" ? "Baja" : data.competitionLevel === "Medium" ? "Media" : "Alta"}</p>
              <p className="mt-1 text-sm font-medium">Nivel de Competencia</p>
            </div>

            <div className={cn("rounded-lg border p-4 text-center", getLevelColor(data.entryBarrier))}>
              <p className="text-2xl font-bold">{data.entryBarrier === "Low" ? "Baja" : data.entryBarrier === "Medium" ? "Media" : "Alta"}</p>
              <p className="mt-1 text-sm font-medium">Barrera de Entrada</p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-lg font-bold text-primary">{data.timeToFirstIncome}</p>
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Tiempo al Primer Ingreso</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Hallazgos Clave</h4>
            {data.findings.map((finding, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", getFindingColor(finding.type))} />
                <p className="text-sm leading-relaxed text-muted-foreground">{finding.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {signalsLoading ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Fuentes del Puntaje</CardTitle>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Buscando datos en Google Trends, MercadoLibre e INDEC...
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-md" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : data.sourceSignals.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Fuentes del Puntaje</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {data.sourceSignals.map(s => s.source).join(" · ")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sourceSignals.map((signal, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{signal.source}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{signal.metric}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                      +{signal.scoreImpact} score
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                        getTrendAccent(signal.trend).badge
                      )}
                    >
                      {(() => {
                        const TrendIcon = getTrendAccent(signal.trend).icon
                        return <TrendIcon className="h-3.5 w-3.5" />
                      })()}
                      {formatSignalTrendLabel(signal.trend)}
                    </span>
                  </div>
                </div>
                {signal.history.length >= 2 && (
                  <div className="mt-3 h-20 w-full rounded-md border border-border bg-secondary/20 p-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={signal.history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "var(--foreground)" }}
                          formatter={(value: number) => [`${value.toFixed(1)} pts`, "Fuerza de señal"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={getTrendAccent(signal.trend).line}
                          fill={getTrendAccent(signal.trend).area}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{signal.value}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Actualizado: {signal.lastUpdated}</span>
                    <a href={signal.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Fuente
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {similarLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ideas Similares Exitosas</CardTitle>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Buscando emprendimientos similares...
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : data.similarIdeas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ideas Similares Exitosas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.similarIdeas.map((idea, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{idea.idea}</p>
                    <p className="text-xs text-muted-foreground">{idea.market}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Similitud: {idea.matchScore}/100
                  </span>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Crecimiento:</span> {idea.annualGrowth}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Tracción:</span> {idea.traction}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
