import { getFlow, type BusinessInputData } from "@/lib/server/flow-store"
import { generateClarificationQuestions } from "@/lib/server/question-generator"
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

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as {
      flowId?: unknown
      businessInput?: unknown
    }

    let input: BusinessInputData | null = null

    if (typeof body.flowId === "string") {
      const flow = getFlow(body.flowId)
      if (flow) {
        input = flow.businessInput
      }
    }

    if (!input && isBusinessInputData(body.businessInput)) {
      input = body.businessInput
    }

    if (!input) {
      return apiError({
        status: 400,
        code: "BAD_REQUEST",
        message: "flowId or businessInput is required",
      })
    }

    const questions = generateClarificationQuestions(input)

    if (questions.length === 0) {
      return apiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "No clarification questions were generated",
      })
    }

    return apiSuccess({ questions })
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
