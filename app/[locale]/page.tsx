"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Scale,
  Map,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react"
import { HeroInput, BusinessInputData } from "@/components/hero-input"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { createFlowSession, isApiClientError } from "@/lib/flow-api"
import { saveBusinessInput, saveFlowId } from "@/lib/flow-storage"

const FEATURE_ICONS = [TrendingUp, Users, Scale, Map]
const FEATURE_KEYS = ["marketViability", "localCompetition", "legalFramework", "launchPlan"] as const

const TRUST_ICONS = [MapPin, Sparkles, Zap]
const TRUST_KEYS = ["argentina", "ai", "action"] as const

export default function Home() {
  const router = useRouter()
  const t = useTranslations("home")
  const locale = useLocale()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const handleSubmit = async (data: BusinessInputData) => {
    setSubmitError(null)
    setRequestId(null)

    try {
      const flowId = await createFlowSession(data, locale)
      saveBusinessInput(data)
      saveFlowId(flowId)
      router.push("/preguntas-claude")
    } catch (error) {
      if (isApiClientError(error)) {
        setSubmitError(error.message)
        setRequestId(error.requestId ?? null)
      } else {
        setSubmitError(t("backendError"))
      }
    }
  }

  return (
    <main className="dz-hero-bg relative min-h-screen overflow-hidden">
      {/* Atmospheric background — stars + noise (dark mode) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
        <div className="dz-stars absolute inset-0" />
        <div className="dz-noise absolute inset-0" />
      </div>
      {/* Light mode noise texture for atmospheric depth */}
      <div className="pointer-events-none absolute inset-0 dark:opacity-0">
        <div className="dz-noise absolute inset-0" />
      </div>

      <div className="relative z-10">
        <Header />

        {submitError && (
          <div className="mx-auto w-full max-w-3xl px-4 pt-6">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="space-y-2 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {t("sessionError")}
                </p>
                <p className="text-sm text-foreground/80">{submitError}</p>
                {requestId && (
                  <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Hero Hook ─── */}
        <section className="mx-auto max-w-4xl px-4 pt-16 text-center sm:pt-20">
          <h1 className="dz-enter-1 font-display text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("heroTitle1")}{" "}
            <span className="bg-gradient-to-r from-primary via-[oklch(0.6_0.18_175)] to-[oklch(0.55_0.16_160)] bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>
          <p className="dz-enter-2 mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            {t("heroDescription")}
          </p>
        </section>

        {/* ─── Form Section ─── */}
        <HeroInput onSubmit={handleSubmit} />

        {/* ─── What you get ─── */}
        <section className="dz-enter-5 mx-auto max-w-4xl px-4 pt-4 pb-12 text-center">
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            {t("whatYouGet")}
          </h3>

          {/* Feature pills */}
          <div className="mx-auto mt-4 flex flex-wrap justify-center gap-2">
            {FEATURE_KEYS.map((key, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground backdrop-blur-sm dark:border-primary/10 dark:bg-white/[0.04]"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {t(`featurePills.${key}`)}
                </span>
              )
            })}
          </div>

          {/* Dashboard Preview */}
          <div
            className="mx-auto mt-8 hidden max-w-sm sm:block"
            style={{ perspective: "1200px" }}
          >
            <div className="dz-preview-tilt relative overflow-hidden rounded-2xl border border-border/30 bg-card/70 p-4 shadow-xl backdrop-blur-lg dark:border-primary/[0.06] dark:bg-white/[0.03]">
              {/* Mini header bar */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                <div className="h-1.5 w-16 rounded-full bg-muted-foreground/20" />
                <div className="ml-auto h-1.5 w-10 rounded-full bg-muted-foreground/15" />
              </div>
              {/* Mini bento grid */}
              <div className="grid grid-cols-4 gap-1.5 text-left">
                <div className="col-span-2 row-span-2 rounded-lg bg-primary/10 p-2.5">
                  <div className="text-[10px] text-muted-foreground">{t("preview.viability")}</div>
                  <div className="mt-1 text-xl font-bold text-primary">72%</div>
                  <div className="mt-1.5 h-1 w-full rounded-full bg-primary/20">
                    <div className="h-full w-[72%] rounded-full bg-primary" />
                  </div>
                </div>
                <div className="col-span-2 rounded-lg bg-[oklch(0.55_0.18_270_/_0.08)] p-2 dark:bg-[oklch(0.6_0.18_270_/_0.08)]">
                  <div className="text-[9px] text-muted-foreground">{t("preview.competition")}</div>
                  <div className="mt-0.5 text-xs font-semibold">{t("preview.rivals")}</div>
                </div>
                <div className="col-span-2 rounded-lg bg-[oklch(0.6_0.12_160_/_0.08)] p-2 dark:bg-[oklch(0.65_0.12_160_/_0.08)]">
                  <div className="text-[9px] text-muted-foreground">{t("preview.clients")}</div>
                  <div className="mt-0.5 text-xs font-semibold">{t("preview.segments")}</div>
                </div>
                <div className="col-span-1 rounded-lg bg-[oklch(0.6_0.15_80_/_0.08)] p-1.5 dark:bg-[oklch(0.7_0.15_80_/_0.08)]">
                  <div className="text-[8px] text-muted-foreground">{t("preview.legal")}</div>
                </div>
                <div className="col-span-1 rounded-lg bg-primary/5 p-1.5">
                  <div className="text-[8px] text-muted-foreground">{t("preview.kit")}</div>
                </div>
                <div className="col-span-2 rounded-lg bg-[oklch(0.55_0.18_30_/_0.08)] p-1.5 dark:bg-[oklch(0.6_0.18_30_/_0.08)]">
                  <div className="text-[8px] text-muted-foreground">{t("preview.roadmap")}</div>
                  <div className="mt-0.5 flex gap-0.5">
                    <div className="h-0.5 flex-1 rounded-full bg-foreground/20" />
                    <div className="h-0.5 flex-1 rounded-full bg-foreground/10" />
                    <div className="h-0.5 flex-1 rounded-full bg-foreground/5" />
                  </div>
                </div>
              </div>
              {/* Gradient fade overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl bg-gradient-to-t from-card to-transparent dark:from-[oklch(0.12_0.02_220)]" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("previewCaption")}
            </p>
          </div>
        </section>

        {/* ─── Trust Section ─── */}
        <section className="dz-enter-5 mx-auto max-w-4xl px-4 pb-16 pt-8">
          <h3 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("whyDayZero")}
          </h3>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {TRUST_KEYS.map((key, i) => {
              const Icon = TRUST_ICONS[i]
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-primary/[0.06] dark:bg-white/[0.03] dark:hover:shadow-primary/[0.05]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-display text-base font-semibold">{t(`trustCards.${key}Title`)}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(`trustCards.${key}Desc`)}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("hackathonBadge")}
          </p>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-8 text-center">
            <p className="font-display text-sm font-semibold tracking-tight">
              {t("footerTagline")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t("footerSubtext")}
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
