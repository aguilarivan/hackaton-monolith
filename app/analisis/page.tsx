"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  DollarSign,
  Gauge,
  Loader2,
  Map,
  Package,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react"
import { Header } from "@/components/header"
import { StartupDashboard } from "@/components/startup-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateAnalysisFromApi, getFlowSession, isApiClientError } from "@/lib/flow-api"
import type { StartupAnalysis } from "@/lib/mock-data"
import { clearFlowStorage, getBusinessInput, getFlowId } from "@/lib/flow-storage"
import type { BusinessInputData } from "@/components/hero-input"
import { cn } from "@/lib/utils"
import { StepIndicator } from "@/components/step-indicator"

const analysisSteps = [
  { icon: Gauge, label: "Analizando mercado y demanda" },
  { icon: TrendingUp, label: "Evaluando competencia" },
  { icon: Users, label: "Identificando clientes ideales" },
  { icon: DollarSign, label: "Diseñando modelo de monetizacion" },
  { icon: Scale, label: "Revisando estructura legal" },
  { icon: Package, label: "Calculando kit de arranque" },
  { icon: Map, label: "Armando roadmap de lanzamiento" },
  { icon: AlertTriangle, label: "Priorizando riesgos y soluciones" },
]

const STEP_INTERVAL_MS = 1400

export default function AnalysisPage() {
  const router = useRouter()
  const [businessData, setBusinessData] = useState<BusinessInputData | null>(null)
  const [analysisData, setAnalysisData] = useState<StartupAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const dataReadyRef = useRef(false)
  const animationDoneRef = useRef(false)

  const tryReveal = () => {
    if (dataReadyRef.current && animationDoneRef.current) {
      setIsAnalyzing(false)
    }
  }

  // Start message cycling immediately on mount (decoupled from data)
  useEffect(() => {
    const data = getBusinessInput()
    if (data) setBusinessData(data)

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, STEP_INTERVAL_MS)

    const reveal = setTimeout(() => {
      animationDoneRef.current = true
      tryReveal()
    }, analysisSteps.length * STEP_INTERVAL_MS)

    return () => {
      clearInterval(interval)
      clearTimeout(reveal)
    }
  }, [])

  // Load data from API (independent of animation)
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoadError(null)
      setRequestId(null)

      const flowId = getFlowId()
      if (!flowId) {
        if (!isMounted) return
        setLoadError("No hay una sesion activa para generar el analisis.")
        setIsAnalyzing(false)
        return
      }

      try {
        const session = await getFlowSession(flowId)
        if (!isMounted) return

        if (session.claudeAnswers.length === 0) {
          router.replace("/preguntas-claude")
          return
        }

        setBusinessData(session.businessInput)

        const analysis = await generateAnalysisFromApi(session.businessInput, session.claudeAnswers)
        if (!isMounted) return
        setAnalysisData(analysis)
        dataReadyRef.current = true
        tryReveal()
      } catch (error) {
        if (!isMounted) return

        if (isApiClientError(error) && error.status === 404) {
          setLoadError("La sesion de analisis no existe o expiro. Inicia una nueva idea.")
          setRequestId(error.requestId ?? null)
          setIsAnalyzing(false)
          return
        }

        if (isApiClientError(error)) {
          setLoadError(error.message)
          setRequestId(error.requestId ?? null)
        } else {
          setLoadError("No se pudo generar el analisis desde backend.")
        }
        setIsAnalyzing(false)
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
        <StepIndicator currentStep={3} />
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Error al construir el analisis
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

  if (!businessData) {
    return null
  }

  if (isAnalyzing) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <StepIndicator currentStep={3} />
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full border-border/70">
            <CardContent className="space-y-8 p-8">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Claude esta construyendo tu analisis
                </p>
                <p className="text-sm text-muted-foreground">
                  Analizando datos para {businessData.city || "tu ciudad"}
                </p>
              </div>

              <div className="space-y-3">
                {analysisSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isDone = index < activeStep
                  const isActive = index === activeStep
                  const isPending = index > activeStep

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500",
                        isDone && "opacity-60",
                        isActive && "bg-primary/5",
                        isPending && "opacity-30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                          isDone && "bg-success/15 text-success",
                          isActive && "bg-primary/15 text-primary",
                          isPending && "bg-muted text-muted-foreground"
                        )}
                      >
                        {isDone ? (
                          <Check className="h-4 w-4" />
                        ) : isActive ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm transition-all duration-500",
                          isDone && "text-muted-foreground",
                          isActive && "font-medium text-foreground",
                          isPending && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                        {isActive && "..."}
                      </span>
                    </div>
                  )
                })}
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
      <StepIndicator currentStep={3} />
      <StartupDashboard data={businessData} analysisOverride={analysisData ?? undefined} onReset={handleReset} />
    </main>
  )
}
