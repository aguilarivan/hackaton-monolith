import type { StartupAnalysis } from "@/lib/mock-data"
import type { BusinessInputData } from "@/components/hero-input"
import type { ClaudeAnswer } from "@/lib/flow-storage"

type ApiErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "INVALID_PAYLOAD" | "INTERNAL_ERROR"

interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  requestId: string
  details?: unknown
}

interface ApiSuccessResponse<T> {
  ok: true
  data: T
}

interface ApiFailureResponse {
  ok: false
  error: ApiErrorPayload
}

class ApiClientError extends Error {
  status: number
  code: ApiErrorCode | "UNKNOWN"
  requestId?: string
  details?: unknown

  constructor(params: {
    message: string
    status: number
    code?: ApiErrorCode | "UNKNOWN"
    requestId?: string
    details?: unknown
  }) {
    super(params.message)
    this.name = "ApiClientError"
    this.status = params.status
    this.code = params.code ?? "UNKNOWN"
    this.requestId = params.requestId
    this.details = params.details
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

export interface QuestionOption {
  value: string
  label: string
}

export interface ClarificationQuestion {
  id: string
  title: string
  helper: string
  options: QuestionOption[]
}

interface FlowPayload {
  id: string
  businessInput: BusinessInputData
  claudeAnswers: ClaudeAnswer[]
  createdAt: string
  updatedAt: string
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const body = (await response.json()) as ApiSuccessResponse<T> | ApiFailureResponse

  if (!response.ok) {
    if (!body.ok) {
      throw new ApiClientError({
        message: body.error.message,
        status: response.status,
        code: body.error.code,
        requestId: body.error.requestId,
        details: body.error.details,
      })
    }

    throw new ApiClientError({
      message: `API request failed (${response.status})`,
      status: response.status,
      code: "UNKNOWN",
    })
  }

  if (!body.ok) {
    throw new ApiClientError({
      message: body.error.message,
      status: response.status,
      code: body.error.code,
      requestId: body.error.requestId,
      details: body.error.details,
    })
  }

  return body.data
}

export async function createFlowSession(businessInput: BusinessInputData): Promise<string> {
  const data = await requestJson<{ flowId: string; flow: FlowPayload }>("/api/flow", {
    method: "POST",
    body: JSON.stringify({ businessInput }),
  })

  return data.flowId
}

export async function saveFlowAnswers(
  flowId: string,
  claudeAnswers: ClaudeAnswer[],
  businessInput?: BusinessInputData
): Promise<{ newFlowId?: string }> {
  const data = await requestJson<{ flow: FlowPayload; newFlowId?: string }>("/api/flow", {
    method: "PATCH",
    body: JSON.stringify({ flowId, claudeAnswers, businessInput }),
  })
  return { newFlowId: data.newFlowId }
}

export async function getFlowSession(flowId: string): Promise<FlowPayload> {
  const data = await requestJson<{ flow: FlowPayload }>(`/api/flow?flowId=${encodeURIComponent(flowId)}`)
  return data.flow
}

export async function generateAnalysisFromApi(
  businessInput: BusinessInputData,
  claudeAnswers: ClaudeAnswer[]
): Promise<StartupAnalysis> {
  const data = await requestJson<{ analysis: StartupAnalysis }>("/api/analysis", {
    method: "POST",
    body: JSON.stringify({ businessInput, claudeAnswers }),
  })

  return data.analysis
}

export async function getClarificationQuestionsFromApi(
  businessInput: BusinessInputData,
  flowId?: string
): Promise<ClarificationQuestion[]> {
  const data = await requestJson<{ questions: ClarificationQuestion[] }>("/api/questions", {
    method: "POST",
    body: JSON.stringify({ businessInput, flowId }),
  })

  if (data.questions.length === 0) {
    throw new ApiClientError({
      message: "No se pudieron obtener preguntas desde backend.",
      status: 500,
      code: "INTERNAL_ERROR",
    })
  }

  return data.questions
}
