"use client"

import { useTranslations, useLocale } from "next-intl"
import { Package, ExternalLink, Wallet, Columns3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StartupKitData } from "@/lib/mock-data"

interface KitSectionProps {
  data: StartupKitData
  investment?: number
}

export function KitSection({ data, investment }: KitSectionProps) {
  const t = useTranslations("kitSection")
  const locale = useLocale()
  const formatPrice = (price: number) => `ARS ${price.toLocaleString(locale === "es" ? "es-AR" : "en-US")}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.6_0.15_80_/_0.1)]">
            <Package className="h-5 w-5 text-[oklch(0.6_0.15_80)]" />
          </div>
          <div>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            {investment && <p className="mt-1 text-sm text-muted-foreground">{t("subtitle", { investment: investment.toLocaleString(locale === "es" ? "es-AR" : "en-US") })}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex h-6 w-full overflow-hidden rounded-lg">
            {data.budgetDistribution.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center text-xs font-medium text-white"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              >
                {item.percentage >= 15 && `${item.percentage}%`}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {data.budgetDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">
                  {item.category} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.reason}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-primary">{formatPrice(item.price)}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}% del presupuesto</p>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-border bg-background p-3">
                <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Columns3 className="h-3.5 w-3.5 text-primary" />
                  {t("productComparison")}
                </p>
                <div className="space-y-2">
                  {item.offers.map((offer, offerIndex) => (
                    <div key={offerIndex} className="grid gap-2 rounded-md border border-border bg-card p-2.5 text-xs sm:grid-cols-5 sm:items-center">
                      <p className="font-medium text-foreground">{offer.platform}</p>
                      <p className="text-muted-foreground">{offer.title}</p>
                      <p className="font-semibold text-primary">{formatPrice(offer.price)}</p>
                      <p className="text-muted-foreground">{t("ratingDelivery", { rating: offer.rating.toFixed(1), delivery: offer.delivery })}</p>
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {t("view")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border-2 border-info/30 bg-info/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
              <Wallet className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("operatingReserve")}</p>
              <p className="text-xl font-bold text-info">{formatPrice(data.operationalReserve)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
