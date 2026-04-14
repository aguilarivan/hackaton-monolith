import { generateAnalysis } from "@/lib/mock-data"
import type { BusinessInputData, ClaudeAnswer } from "@/lib/server/flow-store"
import { apiError, apiSuccess, parseJsonBody } from "@/lib/server/api-response"

function isBusinessInputData(value: unknown): value is BusinessInputData {
  if (!value || typeof value !== "object") return false

  const payload = value as Record<string, unknown>
  return (
    typeof payload.idea === "string" &&
    typeof payload.city === "string" &&
    typeof payload.investment === "number"
  )
}

function isClaudeAnswerArray(value: unknown): value is ClaudeAnswer[] {
  if (!Array.isArray(value)) return false

  return value.every((item) => {
    if (!item || typeof item !== "object") return false
    const answer = item as Record<string, unknown>
    return (
      typeof answer.questionId === "string" &&
      typeof answer.option === "string" &&
      (answer.details === undefined || typeof answer.details === "string")
    )
  })
}

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as {
      businessInput?: unknown
      claudeAnswers?: unknown
    }

    if (!isBusinessInputData(body.businessInput)) {
      return apiError({
        status: 400,
        code: "INVALID_PAYLOAD",
        message: "Invalid businessInput payload",
      })
    }

    if (!isClaudeAnswerArray(body.claudeAnswers)) {
      return apiError({
        status: 400,
        code: "INVALID_PAYLOAD",
        message: "Invalid claudeAnswers payload",
      })
    }

    const analysis = generateAnalysis(body.businessInput)

    return apiSuccess({
      analysis,
      metadata: {
        clarificationsReceived: body.claudeAnswers.length,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON_BODY") {
      return apiError({
        status: 400,
        code: "BAD_REQUEST",
        message: "Invalid JSON body",
      })
    }

    return apiError({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    })
  }
}
