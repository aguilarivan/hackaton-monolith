"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Bot, Loader2, Rocket } from "lucide-react"
import { Header } from "@/components/header"
import { StartupDashboard } from "@/components/startup-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { streamAnalysis, fetchSectionPlan, isApiClientError, getFlowSession } from "@/lib/flow-api"
import type { ViabilitySection, DetailsSection, ResearchSection } from "@/lib/server/section-generators"
import type { SectionPlan } from "@/lib/server/section-plan-prompt"
import { clearFlowStorage, getBusinessInput, getClaudeAnswers, getFlowId, saveSectionPlan, getSectionPlan } from "@/lib/flow-storage"
import type { BusinessInputData } from "@/components/hero-input"

const planningMessages = [
  "Evaluando qué secciones aplican a tu idea...",
  "Determinando el alcance del análisis...",
]

const loadingMessages = [
  "Analizando las condiciones de lanzamiento...",
  "Evaluando viabilidad y modelo de negocio...",
  "Investigando competencia y mercado...",
  "Armando tu plan de lanzamiento personalizado...",
]

export interface PartialAnalysis {
  viability?: ViabilitySection
  details?: DetailsSection
  research?: ResearchSection
}

export default function AnalysisPage() {
  const router = useRouter()
  const [businessData, setBusinessData] = useState<BusinessInputData | null>(null)
  const [sectionPlan, setSectionPlan] = useState<SectionPlan | null>(null)
  const [isPlanning, setIsPlanning] = useState(true)
  const [partial, setPartial] = useState<PartialAnalysis>({})
  const [isStreaming, setIsStreaming] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cycle loading messages immediately on mount, independent of data
  useEffect(() => {
    messageIntervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2200)
    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoadError(null)
      setRequestId(null)
      setIsPlanning(true)
      setIsStreaming(true)
      setPartial({})

      const flowId = getFlowId()
      if (!flowId) {
        if (!isMounted) return
        setLoadError("No hay una sesión activa para generar el análisis.")
        setIsPlanning(false)
        setIsStreaming(false)
        return
      }

      try {
        let input: BusinessInputData | null = null
        let answers: import("@/lib/flow-storage").ClaudeAnswer[] = []

        try {
          const session = await getFlowSession(flowId)
          if (!isMounted) return
          input = session.businessInput
          answers = session.claudeAnswers
        } catch (sessionError) {
          // Flow lost (server restart) — recover from localStorage
          if (isApiClientError(sessionError) && sessionError.status === 404) {
            input = getBusinessInput()
            answers = getClaudeAnswers()
          } else {
            throw sessionError
          }
        }

        if (!isMounted) return

        if (!input || answers.length === 0) {
          router.replace("/preguntas-claude")
          return
        }

        setBusinessData(input)

        // ── Phase 1: Section plan (fast Haiku call) ──────────────────────
        let plan: SectionPlan | null = null
        try {
          plan = await fetchSectionPlan(input, answers)
          if (!isMounted) return
          setSectionPlan(plan)
          saveSectionPlan(plan)
        } catch {
          // On failure, proceed with all sections enabled
        }
        setIsPlanning(false)

        // ── Phase 2: Stream analysis (only enabled sections) ─────────────
        const stream = streamAnalysis(input, answers, plan ?? undefined)

        for await (const event of stream) {
          if (!isMounted) break

          if (event.type === "viability") {
            setPartial((prev) => ({ ...prev, viability: event.data }))
          } else if (event.type === "market-data") {
            // Merge real market signals + similar ideas into viability
            setPartial((prev) => {
              if (!prev.viability) return prev
              return {
                ...prev,
                viability: {
                  ...prev.viability,
                  viability: {
                    ...prev.viability.viability,
                    sourceSignals: event.data.sourceSignals,
                    similarIdeas: event.data.similarIdeas.length > 0
                      ? event.data.similarIdeas
                      : prev.viability.viability.similarIdeas,
                    ...(event.data.marketPotential !== null
                      ? { marketPotential: event.data.marketPotential }
                      : {}),
                  },
                },
              }
            })
          } else if (event.type === "details") {
            setPartial((prev) => ({ ...prev, details: event.data }))
          } else if (event.type === "research") {
            setPartial((prev) => ({ ...prev, research: event.data }))
          } else if (event.type === "error") {
            setLoadError(event.message)
            setIsStreaming(false)
            return
          } else if (event.type === "complete") {
            setIsStreaming(false)
          }
        }

        if (isMounted) setIsStreaming(false)
      } catch (error) {
        if (!isMounted) return

        if (isApiClientError(error) && error.status === 404) {
          setLoadError("La sesión de análisis no existe o expiró. Iniciá una nueva idea.")
          setRequestId(error.requestId ?? null)
        } else if (isApiClientError(error)) {
          setLoadError(error.message)
          setRequestId(error.requestId ?? null)
        } else {
          setLoadError("No se pudo generar el análisis desde backend.")
        }
        setIsPlanning(false)
        setIsStreaming(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleReset = () => {
    clearFlowStorage()
    router.push("/")
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Error al construir el análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">{loadError}</p>
              {requestId && (
                <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={handleReset}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Button>
                <Button onClick={() => router.refresh()}>Reintentar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!businessData || !partial.viability) {
    const messages = isPlanning ? planningMessages : loadingMessages
    const currentMessage = messages[messageIndex % messages.length]

    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full border-border/70">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                {isPlanning ? <Bot className="h-7 w-7 text-primary" /> : <Rocket className="h-7 w-7 text-primary" />}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {isPlanning ? "Preparando el análisis" : "Generando tu análisis"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentMessage}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isPlanning ? "Esto toma solo unos segundos" : "Esto puede tardar unos segundos"}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <StartupDashboard
        data={businessData}
        partial={partial}
        isStreaming={isStreaming}
        sectionPlan={sectionPlan ?? undefined}
        onReset={handleReset}
      />
    </main>
  )
}
