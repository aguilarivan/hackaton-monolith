"use client"

import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ViabilityData } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface MonetizationSectionProps {
  data: ViabilityData
}

export function MonetizationSection({ data }: MonetizationSectionProps) {
  const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

  const formatArs = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Plan de Monetización e Ingresos</CardTitle>
              <p className="text-sm text-muted-foreground">Modelo de negocio y estrategia de precios</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-7">
          <p className="text-sm text-muted-foreground">{data.monetization.strategy}</p>

          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Modelo de Negocio</h4>
              <p className="text-xs text-muted-foreground">{data.businessModel.type}</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.businessModel.description}</p>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.businessModel.revenueStreams}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={96}
                    innerRadius={48}
                    stroke="var(--card)"
                    strokeWidth={2}
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {data.businessModel.revenueStreams.map((_, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                    formatter={(value: number) => [`${value}%`, "% de ingresos"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {data.businessModel.revenueStreams.map((stream, index) => (
                <div key={index} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/20 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{stream.name}</p>
                    <p className="text-xs text-muted-foreground">{stream.description}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{stream.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Precios Sugeridos (ARS / mes)</h4>
            <div className="grid gap-3 md:grid-cols-3">
              {data.monetization.plans.map((plan, index) => (
                <div key={index} className="rounded-xl border border-border bg-secondary/20 p-4">
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{formatArs(plan.monthlyPriceArs)}</p>
                  <p className="mt-2 text-xs font-medium text-foreground">{plan.target}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.rationale}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">Referencia de Competidores (estimada)</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <p>
                  Bajo: <span className="font-semibold text-foreground">{formatArs(data.monetization.benchmark.lowArs)}</span>
                </p>
                <p>
                  Mediana: <span className="font-semibold text-foreground">{formatArs(data.monetization.benchmark.medianArs)}</span>
                </p>
                <p>
                  Alto: <span className="font-semibold text-foreground">{formatArs(data.monetization.benchmark.highArs)}</span>
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{data.monetization.benchmark.note}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
