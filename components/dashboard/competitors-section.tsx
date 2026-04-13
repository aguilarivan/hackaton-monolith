"use client"

import { Users, ThumbsUp, ThumbsDown, MapPin, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompetitorData } from "@/lib/mock-data"

interface CompetitorsSectionProps {
  data: CompetitorData
  city: string
}

function toCanvasPosition(lat: number, lng: number, centerLat: number, centerLng: number) {
  const x = 50 + (lng - centerLng) * 1200
  const y = 50 - (lat - centerLat) * 1200
  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(10, Math.min(90, y)),
  }
}

export function CompetitorsSection({ data, city }: CompetitorsSectionProps) {
  const bestZone = [...data.launchZones].sort((a, b) => b.launchScore - a.launchScore)[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
              <Users className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Competitor Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">{data.competitors.length} main competitors in {city}</p>
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
                      Share: {competitor.marketShare}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{competitor.description}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Strengths</span>
                  </div>
                  <ul className="space-y-1">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Weaknesses</span>
                  </div>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
              <MapPin className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Launch Opportunity Map</CardTitle>
              <p className="text-sm text-muted-foreground">Zone color indicates where it is better to start</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="relative h-72 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 via-emerald-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="absolute left-[8%] top-[10%] h-24 w-24 rounded-full bg-red-400/25" />
              <div className="absolute right-[10%] top-[18%] h-20 w-20 rounded-full bg-amber-400/25" />
              <div className="absolute bottom-[10%] left-[14%] h-24 w-24 rounded-full bg-lime-400/25" />
              <div className="absolute bottom-[16%] right-[12%] h-28 w-28 rounded-full bg-emerald-400/25" />

              {data.competitors.map((competitor, index) => {
                if (!competitor.location) return null
                const point = toCanvasPosition(
                  competitor.location.lat,
                  competitor.location.lng,
                  data.mapCenter.lat,
                  data.mapCenter.lng
                )
                return (
                  <div key={index} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                    <div className="group relative">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-background bg-primary shadow" />
                      <div className="pointer-events-none absolute left-1/2 top-5 z-10 w-44 -translate-x-1/2 rounded-md border border-border bg-card/95 px-2 py-1 text-xs text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                        {competitor.name}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.launchZones.map((zone, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{zone.zone}</p>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: zone.color }}>
                    Score {zone.launchScore}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>Competitor density: {zone.competitorDensity}/10</p>
                  <p>Demand signal: {zone.demandSignal}/10</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-success/30 bg-success/5 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
              <Target className="h-4 w-4" />
              Best launch zone: {bestZone.zone}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This area balances lower competitor pressure with strong demand indicators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
