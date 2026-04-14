import { NextResponse } from "next/server"
import {
  createFlow,
  getFlow,
  updateFlowAnswers,
  type BusinessInputData,
  type ClaudeAnswer,
} from "@/lib/server/flow-store"
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const flowId = searchParams.get("flowId")

  if (!flowId) {
    return apiError({
      status: 400,
      code: "BAD_REQUEST",
      message: "flowId is required",
    })
  }

  const record = getFlow(flowId)
  if (!record) {
    return apiError({
      status: 404,
      code: "NOT_FOUND",
      message: "Flow not found",
    })
  }

  return apiSuccess({ flow: record })
}

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as { businessInput?: unknown }

    if (!isBusinessInputData(body.businessInput)) {
      return apiError({
        status: 400,
        code: "INVALID_PAYLOAD",
        message: "Invalid businessInput payload",
      })
    }

    const record = createFlow(body.businessInput)
    return apiSuccess({ flowId: record.id, flow: record }, 201)
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

export async function PATCH(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as {
      flowId?: unknown
      claudeAnswers?: unknown
      businessInput?: unknown
    }

    if (typeof body.flowId !== "string") {
      return apiError({ status: 400, code: "BAD_REQUEST", message: "flowId is required" })
    }

    if (!isClaudeAnswerArray(body.claudeAnswers)) {
      return apiError({ status: 400, code: "INVALID_PAYLOAD", message: "Invalid claudeAnswers payload" })
    }

    let updated = updateFlowAnswers(body.flowId, body.claudeAnswers)

    // Flow lost (server restart / hot-reload) — recreate from businessInput if provided
    if (!updated && isBusinessInputData(body.businessInput)) {
      const restored = createFlow(body.businessInput)
      updated = updateFlowAnswers(restored.id, body.claudeAnswers)
      // Return with the new flowId so the client can update localStorage
      if (updated) {
        return apiSuccess({ flow: updated, newFlowId: restored.id })
      }
    }

    if (!updated) {
      return apiError({ status: 404, code: "NOT_FOUND", message: "Flow not found" })
    }

    return apiSuccess({ flow: updated })
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
