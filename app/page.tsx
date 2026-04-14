"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { HeroInput, BusinessInputData } from "@/components/hero-input"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { createFlowSession, isApiClientError } from "@/lib/flow-api"
import { saveBusinessInput, saveFlowId } from "@/lib/flow-storage"

export default function Home() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const handleSubmit = async (data: BusinessInputData) => {
    setSubmitError(null)
    setRequestId(null)

    try {
      const flowId = await createFlowSession(data)
      saveBusinessInput(data)
      saveFlowId(flowId)
      router.push("/preguntas-claude")
    } catch (error) {
      if (isApiClientError(error)) {
        setSubmitError(error.message)
        setRequestId(error.requestId ?? null)
      } else {
        setSubmitError("No se pudo iniciar el flujo en backend.")
      }
    }
  }

  return (
    <main className="dz-hero-bg relative min-h-screen overflow-hidden">
      {/* Atmospheric background — stars + noise (dark mode only) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
        <div className="dz-stars absolute inset-0" />
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
                  Error al iniciar tu sesión
                </p>
                <p className="text-sm text-foreground/80">{submitError}</p>
                {requestId && (
                  <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        <HeroInput onSubmit={handleSubmit} />
      </div>
    </main>
  )
}
