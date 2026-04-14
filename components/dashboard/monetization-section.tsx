"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { DollarSign, Check, Pencil, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ViabilityData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface MonetizationSectionProps {
  data: ViabilityData
}

export function MonetizationSection({ data }: MonetizationSectionProps) {
  const t = useTranslations("monetizationSection")
  const locale = useLocale()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [confirmedStreams, setConfirmedStreams] = useState<Set<number>>(new Set())
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({})
  const [editingModel, setEditingModel] = useState(false)
  const [customModel, setCustomModel] = useState(data.businessModel.description)

  const formatArs = (value: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-AR" : "en-US", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)

  const toggleStream = (index: number) => {
    setConfirmedStreams((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const getPrice = (plan: (typeof data.monetization.plans)[0], index: number) =>
    customPrices[index] ?? plan.monthlyPriceArs

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("title")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-7">
          <p className="text-sm text-muted-foreground">{data.monetization.strategy}</p>

          {/* Tipo de modelo + fuentes de ingreso */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">{t("modelType")}</h4>
              <p className="text-xs text-muted-foreground">{data.businessModel.type}</p>

              {editingModel ? (
                <div className="mt-2 flex gap-2">
                  <textarea
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full resize-none rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setEditingModel(false)}
                      className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCustomModel(data.businessModel.description)
                        setEditingModel(false)
                      }}
                      className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-secondary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-start justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{customModel}</p>
                  <button
                    onClick={() => setEditingModel(true)}
                    className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Editar descripción"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Fuentes de ingreso interactivas */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("revenueStreams")}
              </p>
              <div className="space-y-2">
                {data.businessModel.revenueStreams.map((stream, index) => (
                  <button
                    key={index}
                    onClick={() => toggleStream(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-all",
                      confirmedStreams.has(index)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/20 hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          confirmedStreams.has(index)
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {confirmedStreams.has(index) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{stream.name}</p>
                        <p className="text-xs text-muted-foreground">{stream.description}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      {stream.percentage}{t("revenuePercent")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Planes de precio — seleccionables y editables */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">{t("pricingTitle")}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Estos son los precios que <span className="font-medium text-foreground">vos le cobrarías</span> a las personas que usen tu negocio — no lo que pagás vos. Seleccioná el modelo de entrada que más te cierra.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {data.monetization.plans.map((plan, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPlan(selectedPlan === index ? null : index)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedPlan(selectedPlan === index ? null : index)}
                  className={cn(
                    "relative cursor-pointer rounded-xl border p-4 text-left transition-all",
                    selectedPlan === index
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-secondary/20 hover:border-primary/40"
                  )}
                >
                  {selectedPlan === index && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>

                  {editingPrice === index ? (
                    <div
                      className="mt-1 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-sm text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={customPrices[index] ?? plan.monthlyPriceArs}
                        onChange={(e) =>
                          setCustomPrices((prev) => ({ ...prev, [index]: Number(e.target.value) }))
                        }
                        className="w-28 rounded-md border border-primary bg-background px-2 py-1 text-lg font-bold text-primary focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingPrice(null)}
                        className="rounded-md bg-primary p-1 text-primary-foreground"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-2xl font-bold text-primary">
                        {formatArs(getPrice(plan, index))}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPrice(index)
                        }}
                        className="rounded-md border border-border p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Ajustar precio"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">{t("pricePerMonth")}</p>
                  <p className="mt-2 text-xs font-medium text-foreground">{plan.target}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.rationale}</p>
                </div>
              ))}
            </div>

            {selectedPlan !== null && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                <p className="text-sm text-foreground">
                  Elegiste el plan{" "}
                  <span className="font-semibold text-primary">
                    {data.monetization.plans[selectedPlan].name}
                  </span>{" "}
                  — {formatArs(getPrice(data.monetization.plans[selectedPlan], selectedPlan))} por mes.{" "}
                  <span className="text-muted-foreground">Podés cambiarlo en cualquier momento.</span>
                </p>
              </div>
            )}
          </div>

          {/* Benchmark de la competencia */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">{t("benchmarkTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{data.monetization.benchmark.note}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-secondary/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("priceLow")}</p>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatArs(data.monetization.benchmark.lowArs)}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center ring-1 ring-primary/30">
                <p className="text-xs font-medium text-primary">{t("priceAverage")}</p>
                <p className="mt-0.5 font-semibold text-primary">
                  {formatArs(data.monetization.benchmark.medianArs)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("priceHigh")}</p>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatArs(data.monetization.benchmark.highArs)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
