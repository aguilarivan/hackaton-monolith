"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { StartupDashboard } from "@/components/startup-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { clearFlowStorage, getBusinessInput, getClaudeAnswers } from "@/lib/flow-storage"
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
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const data = getBusinessInput()
    const answers = getClaudeAnswers()

    if (!data) {
      router.replace("/")
      return
    }

    if (answers.length === 0) {
      router.replace("/preguntas-claude")
      return
    }

    setBusinessData(data)
  }, [router])

  useEffect(() => {
    if (!businessData) return

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
  }, [businessData])

  const handleReset = () => {
    clearFlowStorage()
    router.push("/")
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
      <StartupDashboard data={businessData} onReset={handleReset} />
    </main>
  )
}
