import { generateAnalysis } from "@/lib/mock-data"
import { parseJsonBody } from "@/lib/server/api-response"
import type { BusinessInputData, ClaudeAnswer } from "@/lib/server/flow-store"
import {
  generateViabilitySection,
  generateDetailsSection,
  generateResearchSection,
} from "@/lib/server/section-generators"

function isBusinessInputData(value: unknown): value is BusinessInputData {
  if (!value || typeof value !== "object") return false
  const p = value as Record<string, unknown>
  return typeof p.idea === "string" && typeof p.city === "string" && typeof p.investment === "number"
}

function isClaudeAnswerArray(value: unknown): value is ClaudeAnswer[] {
  if (!Array.isArray(value)) return false
  return value.every((item) => {
    if (!item || typeof item !== "object") return false
    const a = item as Record<string, unknown>
    return (
      typeof a.questionId === "string" &&
      typeof a.option === "string" &&
      (a.details === undefined || typeof a.details === "string")
    )
  })
}

export async function POST(request: Request) {
  let body: { businessInput?: unknown; claudeAnswers?: unknown }

  try {
    body = (await parseJsonBody(request)) as { businessInput?: unknown; claudeAnswers?: unknown }
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  if (!isBusinessInputData(body.businessInput)) {
    return new Response(
      JSON.stringify({ ok: false, error: { code: "INVALID_PAYLOAD", message: "Invalid businessInput payload" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  if (!isClaudeAnswerArray(body.claudeAnswers)) {
    return new Response(
      JSON.stringify({ ok: false, error: { code: "INVALID_PAYLOAD", message: "Invalid claudeAnswers payload" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const input = body.businessInput
  const answers = body.claudeAnswers
  const mock = generateAnalysis(input)

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const enc = new TextEncoder()

  const emit = async (data: object) => {
    try {
      await writer.write(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch {
      // client disconnected
    }
  }

  ;(async () => {
    try {
      await Promise.all([
        // Section 1: viability + clients — Haiku, fast (~5s)
        generateViabilitySection(input, answers, mock).then((data) =>
          emit({ type: "viability", data })
        ),
        // Section 2: obstacles + roadmap + legal — Haiku, medium (~10s)
        generateDetailsSection(input, answers, mock).then((data) =>
          emit({ type: "details", data })
        ),
        // Section 3: competitors + kit — Sonnet + web search, slow (~30s)
        generateResearchSection(input, answers, mock).then((data) =>
          emit({ type: "research", data })
        ),
      ])
    } catch (error) {
      console.error("[analysis/stream] unexpected error:", error)
      await emit({ type: "error", message: "Analysis failed" })
    } finally {
      await emit({ type: "complete" })
      try {
        writer.close()
      } catch {
        // already closed
      }
    }
  })()

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
