"use client"

import { useTranslations, useLocale } from "next-intl"
import { Gauge, Clock, Database, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function getTrendAccent(trend: "up" | "stable" | "down", trendLabel: string) {
  if (trend === "up") {
    return {
      icon: ArrowUpRight,
      line: "var(--chart-2)",
      area: "color-mix(in oklab, var(--chart-2) 14%, transparent)",
      badge: "bg-success/10 text-success border-success/30",
      label: trendLabel,
    }
  }
  if (trend === "stable") {
    return {
      icon: Minus,
      line: "var(--warning)",
      area: "color-mix(in oklab, var(--warning) 16%, transparent)",
      badge: "bg-warning/10 text-warning border-warning/30",
      label: trendLabel,
    }
  }
  return {
    icon: ArrowDownRight,
    line: "var(--destructive)",
    area: "color-mix(in oklab, var(--destructive) 13%, transparent)",
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    label: trendLabel,
  }
}

export function ViabilitySection({ data }: ViabilitySectionProps) {
  const t = useTranslations("viabilitySection")
  const locale = useLocale()

  const formatSignalTrendLabel = (trend: "up" | "stable" | "down") => {
    if (trend === "up") return t("sourceGrowing")
    if (trend === "stable") return t("sourceStable")
    return t("sourceDeclining")
  }

  const getTrendLabel = (trend: "up" | "stable" | "down") => {
    if (trend === "up") return t("trendGrowing")
    if (trend === "stable") return t("trendStable")
    return t("trendDeclining")
  }

  const getLevelLabel = (level: "Low" | "Medium" | "High") => {
    if (level === "Low") return t("low")
    if (level === "Medium") return t("medium")
    return t("high")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("rounded-lg border p-4 text-center", getScoreColor(data.marketPotential))}>
              <p className="text-3xl font-bold">{data.marketPotential}/10</p>
              <p className="mt-1 text-sm font-medium">{t("dynamicScore")}</p>
            </div>

            <div className={cn("rounded-lg border p-4 text-center", getLevelColor(data.competitionLevel))}>
              <p className="text-2xl font-bold">{getLevelLabel(data.competitionLevel)}</p>
              <p className="mt-1 text-sm font-medium">{t("competitionLevel")}</p>
            </div>

            <div className={cn("rounded-lg border p-4 text-center", getLevelColor(data.entryBarrier))}>
              <p className="text-2xl font-bold">{getLevelLabel(data.entryBarrier)}</p>
              <p className="mt-1 text-sm font-medium">{t("entryBarrier")}</p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-lg font-bold text-primary">{data.timeToFirstIncome}</p>
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{t("timeToIncome")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">{t("keyFindings")}</h4>
            {data.findings.map((finding, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", getFindingColor(finding.type))} />
                <p className="text-sm leading-relaxed text-muted-foreground">{finding.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("signalSources")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("signalSourcesDesc")}</p>
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
                    {t("scoreImpact", { impact: signal.scoreImpact })}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                      getTrendAccent(signal.trend, getTrendLabel(signal.trend)).badge
                    )}
                  >
                    {(() => {
                      const TrendIcon = getTrendAccent(signal.trend, getTrendLabel(signal.trend)).icon
                      return <TrendIcon className="h-3.5 w-3.5" />
                    })()}
                    {formatSignalTrendLabel(signal.trend)}
                  </span>
                </div>
              </div>
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
                      formatter={(value: number) => [`${value.toFixed(1)} pts`, t("signalStrength")]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getTrendAccent(signal.trend, getTrendLabel(signal.trend)).line}
                      fill={getTrendAccent(signal.trend, getTrendLabel(signal.trend)).area}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{signal.value}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{t("updated")}: {signal.lastUpdated}</span>
                  <a href={signal.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {t("source")}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("successfulIdeas")}</CardTitle>
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
                  {t("similarity", { score: idea.matchScore })}
                </span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t("growth")}</span> {idea.annualGrowth}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t("traction")}</span> {idea.traction}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
