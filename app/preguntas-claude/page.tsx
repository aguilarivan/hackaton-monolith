"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, ArrowRight, Brain, Loader2, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  getClarificationQuestionsFromApi,
  isApiClientError,
  saveFlowAnswers,
  type ClarificationQuestion,
} from "@/lib/flow-api"
import { getBusinessInput, getFlowId, saveClaudeAnswers, type ClaudeAnswer } from "@/lib/flow-storage"

const askMessages = [
  "Claude esta leyendo tu idea y detectando riesgos",
  "Claude esta armando preguntas para reducir incertidumbre",
  "Claude esta priorizando lo importante para tu caso",
]

export default function ClaudeQuestionsPage() {
  const router = useRouter()
  const [isPreparing, setIsPreparing] = useState(true)
  const [messageIndex, setMessageIndex] = useState(0)
  const [businessData, setBusinessData] = useState<ReturnType<typeof getBusinessInput>>(null)
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [details, setDetails] = useState<Record<string, string>>({})

  useEffect(() => {
    const data = getBusinessInput()
    if (!data) {
      router.replace("/")
      return
    }
    setBusinessData(data)
  }, [router])

  const loadQuestions = async (input: NonNullable<typeof businessData>) => {
    setLoadError(null)
    setSubmitError(null)
    setRequestId(null)

    try {
      const flowId = getFlowId()
      const apiQuestions = await getClarificationQuestionsFromApi(input, flowId ?? undefined)
      setQuestions(apiQuestions)
    } catch (error) {
      setQuestions([])
      if (isApiClientError(error)) {
        setLoadError(error.message)
        setRequestId(error.requestId ?? null)
      } else {
        setLoadError("No se pudieron cargar las preguntas desde el backend.")
      }
    }
  }

  useEffect(() => {
    if (!businessData) return

    loadQuestions(businessData)

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= askMessages.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1700)

    const reveal = setTimeout(() => {
      setIsPreparing(false)
    }, askMessages.length * 1700)

    return () => {
      clearInterval(interval)
      clearTimeout(reveal)
    }
  }, [businessData])

  const isValid = useMemo(
    () => questions.length > 0 && questions.every((question) => {
      const selected = answers[question.id]
      if (!selected) return false
      if (selected !== "expand") return true
      return Boolean(details[question.id]?.trim())
    }),
    [answers, details, questions]
  )

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    if (option !== "expand") {
      setDetails((prev) => ({ ...prev, [questionId]: "" }))
    }
  }

  const handleContinue = async () => {
    setSubmitError(null)
    setRequestId(null)
    setIsSubmitting(true)

    const payload: ClaudeAnswer[] = questions.map((question) => ({
      questionId: question.id,
      option: answers[question.id],
      details: details[question.id]?.trim() || undefined,
    }))

    try {
      const flowId = getFlowId()

      if (!flowId) {
        setSubmitError("No existe una sesion activa. Volve al paso 1 para reiniciar el flujo.")
        return
      }

      await saveFlowAnswers(flowId, payload)
      saveClaudeAnswers(payload)
      router.push("/analisis")
    } catch (error) {
      if (isApiClientError(error)) {
        setSubmitError(error.message)
        setRequestId(error.requestId ?? null)
      } else {
        setSubmitError("No se pudieron guardar tus respuestas en el backend.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!businessData) {
    return null
  }

  if (isPreparing) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center px-4 py-16">
          <Card className="w-full border-border/70">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Claude esta preparando preguntas</p>
                <p className="text-sm text-muted-foreground">{askMessages[messageIndex]}...</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Afinando el contexto de tu idea
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
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
                Error al cargar preguntas de Claude
              </CardTitle>
              <CardDescription className="text-foreground/80">
                {loadError}
              </CardDescription>
              {requestId && (
                <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al paso 1
              </Button>
              <Button onClick={() => businessData && loadQuestions(businessData)}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Paso 2: responde las dudas de Claude</CardTitle>
            <CardDescription>
              Idea: {businessData.idea} | Ciudad: {businessData.city} | Inversion inicial: ${businessData.investment.toLocaleString("es-AR")}
            </CardDescription>
          </CardHeader>
        </Card>

        {questions.map((question, index) => {
          const selected = answers[question.id]
          return (
            <Card key={question.id} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">
                  {index + 1}. {question.title}
                </CardTitle>
                <CardDescription>{question.helper}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={selected}
                  onValueChange={(value) => handleOptionChange(question.id, value)}
                >
                  {question.options.map((option) => (
                    <Label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-secondary/40"
                    >
                      <RadioGroupItem value={option.value} className="mt-0.5" />
                      <span>{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>

                {selected === "expand" && (
                  <div className="space-y-2">
                    <Label htmlFor={`${question.id}-details`} className="text-sm font-medium">
                      Ampliar respuesta
                    </Label>
                    <Textarea
                      id={`${question.id}-details`}
                      placeholder="Conta el contexto que necesites para que Claude afine el analisis..."
                      value={details[question.id] || ""}
                      onChange={(event) =>
                        setDetails((prev) => ({ ...prev, [question.id]: event.target.value }))
                      }
                      className="min-h-24"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al paso 1
          </Button>
          <Button onClick={handleContinue} disabled={!isValid || isSubmitting}>
            Continuar al analisis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {submitError && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-medium text-destructive">No se pudo continuar</p>
              <p className="text-sm text-foreground/80">{submitError}</p>
              {requestId && (
                <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
              )}
            </CardContent>
          </Card>
        )}

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Siempre podes usar "Quiero ampliar este punto" para darle mas contexto a Claude.
        </p>
      </div>
    </main>
  )
}
