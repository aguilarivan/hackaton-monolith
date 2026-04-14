"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Bot, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { StartupDashboard } from "@/components/startup-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateAnalysisFromApi, getFlowSession, isApiClientError } from "@/lib/flow-api"
import type { StartupAnalysis } from "@/lib/mock-data"
import { clearFlowStorage, getFlowId } from "@/lib/flow-storage"
import type { BusinessInputData } from "@/components/hero-input"

const analysisMessages = [
  "Claude esta evaluando mercado y competencia",
  "Claude esta ajustando monetizacion con tus respuestas",
  "Claude esta priorizando riesgos y roadmap",
  "Claude esta preparando la recomendacion final",
]

export default function AnalysisPage() {
  const router = useRouter()
  const [businessData, setBusinessData] = useState<BusinessInputData | null>(null)
  const [analysisData, setAnalysisData] = useState<StartupAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [messageIndex, setMessageIndex] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoadError(null)
      setRequestId(null)
      setIsAnalyzing(true)

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

  useEffect(() => {
    if (!analysisData) return

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= analysisMessages.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1800)

    const reveal = setTimeout(() => {
      setIsAnalyzing(false)
    }, analysisMessages.length * 1800)

    return () => {
      clearInterval(interval)
      clearTimeout(reveal)
    }
  }, [analysisData])

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
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full border-border/70">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Claude esta construyendo tu analisis final</p>
                <p className="text-sm text-muted-foreground">{analysisMessages[messageIndex]}...</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando datos de tu idea
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
      <StartupDashboard data={businessData} analysisOverride={analysisData ?? undefined} onReset={handleReset} />
    </main>
  )
}
