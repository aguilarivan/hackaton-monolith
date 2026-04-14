"use client"

import { ExternalLink, MapPin, Search, Target, ThumbsDown, ThumbsUp, TrendingUp, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompetitorData } from "@/lib/mock-data"

interface CompetitorsSectionProps {
  data: CompetitorData
  city?: string
  isMock?: boolean
}

function scoreColor(score: number) {
  if (score >= 7.5) return { bg: "bg-success/10", border: "border-success/30", text: "text-success", bar: "#22c55e" }
  if (score >= 5.5) return { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", bar: "#f59e0b" }
  return { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", bar: "#ef4444" }
}

export function CompetitorsSection({ data, city, isMock }: CompetitorsSectionProps) {
  const sorted = [...data.launchZones].sort((a, b) => b.launchScore - a.launchScore)
  const best = sorted[0]

  if (data.competitors.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium text-foreground">No se encontraron competidores</p>
          <p className="mt-1 text-sm text-muted-foreground">
            La búsqueda web no devolvió resultados para este rubro{city ? ` en ${city}` : ""}.
          </p>
        </CardContent>
      </Card>
    )
  }

  const shareData = data.competitors.map((c) => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
    fullName: c.name,
    share: parseFloat(c.marketShare.replace(/[^0-9.]/g, "")) || 0,
    cityArea: c.cityArea,
  }))

  return (
    <div className="space-y-6">

      {/* Competitor list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
              <Users className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Competidores identificados</CardTitle>
                {isMock && <span className="rounded bg-yellow-400/20 px-1.5 py-0.5 text-xs font-bold text-yellow-600">MOCK</span>}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.competitors.length} competidores{city ? ` en ${city}` : ""}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.competitors.map((competitor, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {competitor.cityArea}
                    </span>
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                      {competitor.marketShare}
                    </span>
                    {competitor.url && (
                      <a
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/5 px-2 py-0.5 text-xs font-medium text-success hover:bg-success/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Verificar
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{competitor.description}</p>
                  {competitor.sourceQuery && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Search className="h-3 w-3" />
                      búsqueda: "{competitor.sourceQuery}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Fortalezas</span>
                  </div>
                  <ul className="space-y-1">
                    {competitor.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Debilidades</span>
                  </div>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Market share bar chart */}
      {shareData.some((d) => d.share > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
                <TrendingUp className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
              </div>
              <div>
                <CardTitle className="text-xl">Participación de mercado estimada</CardTitle>
                <p className="text-sm text-muted-foreground">Distribución relativa entre competidores</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shareData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                    formatter={(value: number) => [`${value}%`, "Cuota de mercado"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  />
                  <Bar dataKey="share" radius={[4, 4, 0, 0]}>
                    {shareData.map((_, i) => (
                      <Cell key={i} fill={`oklch(0.55 0.18 ${270 + i * 30})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch zones */}
      {sorted.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
                <Target className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
              </div>
              <div>
                <CardTitle className="text-xl">Zonas de lanzamiento</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Densidad competidora vs demanda por zona{city ? ` en ${city}` : ""}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {sorted.map((zone, i) => {
                const c = scoreColor(zone.launchScore)
                return (
                  <div key={i} className={`rounded-lg border p-4 ${c.bg} ${c.border}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{zone.zone}</p>
                      <span className={`text-lg font-bold ${c.text}`}>{zone.launchScore}/10</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Demanda</span>
                          <span>{zone.demandSignal}/10</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div className="h-full rounded-full bg-success" style={{ width: `${zone.demandSignal * 10}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Competencia</span>
                          <span>{zone.competitorDensity}/10</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div className="h-full rounded-full bg-destructive" style={{ width: `${zone.competitorDensity * 10}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {best && (
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                  <Target className="h-4 w-4" />
                  Mejor zona para lanzar: {best.zone} (score {best.launchScore}/10)
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Menor presión competidora combinada con mayor señal de demanda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
