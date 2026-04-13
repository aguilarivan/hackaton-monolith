"use client"

import { useMemo, useState } from "react"
import { Scale, Check, ArrowRight, Receipt, FileText, Calculator, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LegalStructure } from "@/lib/mock-data"

interface LegalSectionProps {
  data: LegalStructure
}

function formatArs(value: number): string {
  return `ARS ${Math.round(value).toLocaleString("en-US")}`
}

export function LegalSection({ data }: LegalSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState(data.taxCategories[0]?.name ?? "")
  const [monthlyRevenue, setMonthlyRevenue] = useState(1200000)

  const selectedTaxCategory = useMemo(
    () => data.taxCategories.find((category) => category.name === selectedCategory) ?? data.taxCategories[0],
    [data.taxCategories, selectedCategory]
  )

  const simulated = useMemo(() => {
    if (!selectedTaxCategory) return null

    const vat = monthlyRevenue * selectedTaxCategory.vatRate
    const income = monthlyRevenue * selectedTaxCategory.incomeTaxRate
    const social = monthlyRevenue * selectedTaxCategory.socialChargeRate
    const monthlyTotal = selectedTaxCategory.fixedMonthlyArs + vat + income + social

    return {
      vat,
      income,
      social,
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
    }
  }, [monthlyRevenue, selectedTaxCategory])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.6_0.12_160_/_0.1)]">
              <Scale className="h-5 w-5 text-[oklch(0.6_0.12_160)]" />
            </div>
            <CardTitle className="text-xl">Recommended Legal Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {data.structures.map((structure, index) => (
              <div
                key={index}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  structure.recommended
                    ? "border-success/50 bg-success/10 text-success"
                    : "border-border bg-secondary/30 text-muted-foreground"
                )}
              >
                {structure.recommended && <Check className="h-4 w-4" />}
                {structure.name}
              </div>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{data.explanation}</p>

          <div className="rounded-lg border border-border bg-secondary/20 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Recommended Evolution</p>
            <div className="flex flex-wrap items-center gap-3">
              {data.timeline.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      M{step.month}
                    </span>
                    <span className="text-sm text-muted-foreground">{step.action}</span>
                  </div>
                  {index < data.timeline.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.6_0.12_160_/_0.1)]">
              <Calculator className="h-5 w-5 text-[oklch(0.6_0.12_160)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Tax Charges Simulator</CardTitle>
              <p className="text-sm text-muted-foreground">Estimate taxes by category and monthly revenue</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tax category</label>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                {data.taxCategories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Monthly revenue (ARS)</label>
              <input
                type="number"
                min={0}
                value={monthlyRevenue}
                onChange={(event) => setMonthlyRevenue(Number(event.target.value) || 0)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {selectedTaxCategory && simulated && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Fixed monthly</p>
                <p className="text-sm font-semibold text-foreground">{formatArs(selectedTaxCategory.fixedMonthlyArs)}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">VAT estimate</p>
                <p className="text-sm font-semibold text-foreground">{formatArs(simulated.vat)}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Income tax estimate</p>
                <p className="text-sm font-semibold text-foreground">{formatArs(simulated.income)}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Social charges</p>
                <p className="text-sm font-semibold text-foreground">{formatArs(simulated.social)}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">Total monthly taxes</p>
                <p className="text-sm font-semibold text-primary">{formatArs(simulated.monthlyTotal)}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">Projected annual taxes</p>
                <p className="text-sm font-semibold text-primary">{formatArs(simulated.annualTotal)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.6_0.12_160_/_0.1)]">
              <Receipt className="h-5 w-5 text-[oklch(0.6_0.12_160)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Tax Obligations</CardTitle>
              <p className="text-sm text-muted-foreground">{data.taxInfo.regime}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Estimate</p>
              <p className="mt-1 text-xl font-bold text-foreground">{data.taxInfo.monthlyEstimate}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Annual Estimate</p>
              <p className="mt-1 text-xl font-bold text-foreground">{data.taxInfo.annualEstimate}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Benefits of this regime</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.taxInfo.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Start legal and tax bureaucracy</h4>
            <div className="grid gap-2">
              {data.bureaucracyLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-secondary/30"
                >
                  <div>
                    <p className="font-medium text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">Important Note</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tax estimates are simplified simulations for decision support. Confirm exact obligations with a certified accountant.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
