"use client"

import { ExternalLink, MapPin, Search, ThumbsDown, ThumbsUp, TrendingUp, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompetitorData } from "@/lib/mock-data"

interface CompetitorsSectionProps {
  data: CompetitorData
  city?: string
  isMock?: boolean
}


export function CompetitorsSection({ data, city, isMock }: CompetitorsSectionProps) {
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

  const shareData = data.competitors.map((c) => {
    // Extract a percentage: look for "XX%" pattern first, otherwise take first number
    const pctMatch = c.marketShare.match(/(\d+(?:\.\d+)?)\s*%/)
    const raw = pctMatch
      ? parseFloat(pctMatch[1])
      : parseFloat(c.marketShare.replace(/[^0-9.]/g, "")) || 0
    return {
      name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
      fullName: c.name,
      share: Math.min(100, Math.max(0, raw)),
      cityArea: c.cityArea,
    }
  })

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

    </div>
  )
}
