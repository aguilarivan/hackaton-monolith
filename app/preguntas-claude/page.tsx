"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  getClarificationQuestionsFromApi,
  isApiClientError,
  saveFlowAnswers,
  type ClarificationQuestion,
} from "@/lib/flow-api"
import { getBusinessInput, getFlowId, saveClaudeAnswers, saveFlowId, type ClaudeAnswer } from "@/lib/flow-storage"

const QUESTIONS_PER_PAGE = 5

export default function ClaudeQuestionsPage() {
  const router = useRouter()

  const loadingMessages = [
    "Reading your idea carefully...",
    "Identifying the key points of your mission...",
    "Calibrating the most important questions for you...",
  ]
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
  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE))

  const pageQuestions = useMemo(
    () => questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE),
    [questions, currentPage]
  )

  const isCurrentPageValid = useMemo(
    () => pageQuestions.every((question) => {
      const selected = answers[question.id]
      if (!selected) return false
      if (selected !== "expand") return true
      return Boolean(details[question.id]?.trim())
    }),
    [answers, details, pageQuestions]
  )

  const isLastPage = currentPage === totalPages - 1

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
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1700)

    const reveal = setTimeout(() => {
      setIsPreparing(false)
    }, loadingMessages.length * 1700)

    return () => {
      clearInterval(interval)
      clearTimeout(reveal)
    }
  }, [businessData])

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    if (option !== "expand") {
      setDetails((prev) => ({ ...prev, [questionId]: "" }))
    }
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
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
        setSubmitError("No active session found. Go back to the initial mission to restart the flow.")
        return
      }

      const { newFlowId } = await saveFlowAnswers(flowId, payload, businessData ?? undefined)
      if (newFlowId) saveFlowId(newFlowId)
      saveClaudeAnswers(payload)
      router.push("/analisis")
    } catch (error) {
      if (isApiClientError(error)) {
        setSubmitError(error.message)
        setRequestId(error.requestId ?? null)
      } else {
        setSubmitError("Could not save your answers to the backend.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!businessData) return null

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isPreparing) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col items-center justify-center gap-8 px-4 py-16">
          <Card className="w-full border-border/60">
            <CardContent className="space-y-5 p-8 text-center">
              <div className="mx-auto text-5xl">🚀</div>
              <div className="space-y-1.5">
                <p className="text-lg font-semibold text-foreground">
                  {"Calibrating your mission"}
                </p>
                <p className="text-sm text-muted-foreground">{loadingMessages[messageIndex]}...</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {"This only takes a few seconds"}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {"Something went wrong loading the questions"}
              </CardTitle>
              <p className="text-sm text-foreground/80">{loadError}</p>
              {requestId && (
                <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {"Back to start"}
              </Button>
              <Button onClick={() => businessData && loadQuestions(businessData)}>
                {"Retry"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">

        {/* Warm intro */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="shrink-0 text-4xl">🌎</div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">
                  {"Before generating your analysis, we need to better understand your idea."}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {"Answer these questions so AI can give you a more precise and personalized analysis."}
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-muted-foreground">
                    {`Page ${currentPage + 1} of ${totalPages}`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {pageQuestions.map((question) => {
          const globalIndex = questions.indexOf(question)
          const selected = answers[question.id]
          return (
            <Card key={question.id} className="border-border/70 transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {globalIndex + 1}
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-base leading-snug">{question.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{question.helper}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pl-10">
                <RadioGroup
                  value={selected ?? ""}
                  onValueChange={(value) => handleOptionChange(question.id, value)}
                >
                  {question.options.map((option) => (
                    <Label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3.5 text-sm transition-all hover:border-primary/40 hover:bg-primary/5 has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={option.value} className="mt-0.5 shrink-0" />
                      <span className="leading-snug">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>

                {selected === "expand" && (
                  <div className="space-y-2 pt-1">
                    <Label htmlFor={`${question.id}-details`} className="text-sm font-medium">
                      {"Tell us more \ud83d\udcac"}
                    </Label>
                    <Textarea
                      id={`${question.id}-details`}
                      placeholder="Write all the context you want to share..."
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

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={currentPage === 0 ? () => router.push("/") : handlePrevPage}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentPage === 0 ? "Back to start" : "Previous"}
          </Button>

          {isLastPage ? (
            <Button onClick={handleContinue} disabled={!isCurrentPageValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {"Saving..."}
                </>
              ) : (
                <>
                  {"Continue to analysis"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNextPage} disabled={!isCurrentPageValid}>
              {"Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {submitError && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="space-y-1 p-4">
              <p className="text-sm font-medium text-destructive">{"Could not continue"}</p>
              <p className="text-sm text-foreground/80">{submitError}</p>
              {requestId && (
                <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
              )}
            </CardContent>
          </Card>
        )}

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 shrink-0" />
          {'You can choose "I want to expand on this point" to give more context on any question.'}
        </p>
      </div>
    </main>
  )
}
