import { generateAnalysis } from "@/lib/mock-data"
import { parseJsonBody } from "@/lib/server/api-response"
import type { BusinessInputData, ClaudeAnswer } from "@/lib/server/flow-store"
import {
  generateViabilitySection,
  generateDetailsSection,
  generateResearchSection,
  fetchMarketData,
} from "@/lib/server/section-generators"
import type { SectionPlan } from "@/lib/server/section-plan-prompt"

function isBusinessInputData(value: unknown): value is BusinessInputData {
  if (!value || typeof value !== "object") return false
  const p = value as Record<string, unknown>
  return typeof p.idea === "string" && (p.city === undefined || typeof p.city === "string") && (p.investment === undefined || typeof p.investment === "number")
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
  let body: { businessInput?: unknown; claudeAnswers?: unknown; sectionPlan?: unknown }

  try {
    body = (await parseJsonBody(request)) as typeof body
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
  const plan = body.sectionPlan as SectionPlan | undefined
  const mock = generateAnalysis(input)

  // Determine which generator groups to run based on the section plan
  const needViability = !plan || plan.viability.enabled || plan.monetization.enabled || plan.clients.enabled
  const needDetails = !plan || plan.obstacles.enabled || plan.roadmap.enabled || plan.legal.enabled
  const needResearch = !plan || plan.competitors.enabled || plan.kit.enabled

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
      // Haiku sections run sequentially to avoid the 4,000 output TPM rate limit.
      // Research (Sonnet) runs concurrently since it uses a separate model quota.
      // Section plan can skip entire groups if all their sections are disabled.
      const tasks: Promise<void>[] = []

      // Haiku chain: viability → details (sequential to avoid TPM burst)
      // 20s delay between calls to clear the 4,000 output TPM window
      if (needViability || needDetails) {
        tasks.push((async () => {
          if (needViability) {
            const viability = await generateViabilitySection(input, answers, mock)
            await emit({ type: "viability", data: viability })
          }
          if (needDetails) {
            if (needViability) {
              await new Promise((resolve) => setTimeout(resolve, 20000))
            }
            const details = await generateDetailsSection(input, answers, mock)
            await emit({ type: "details", data: details })
          }
        })())
      }

      // Sonnet tasks — each runs independently in parallel with everything else.
      // Both use web search; each has its own try/catch so one failing doesn't block the other.
      if (needResearch) {
        tasks.push(
          generateResearchSection(input, answers, mock).then((data) =>
            emit({ type: "research", data })
          )
        )
      } else {
        // Emit empty research so the UI doesn't hang waiting for it
        tasks.push(emit({ type: "research", data: { competitors: { competitors: [], mapCenter: mock.competitors.mapCenter }, startupKit: mock.startupKit, _isMock: false } }))
      }

      if (needViability) {
        tasks.push(
          fetchMarketData(input, answers).then((data) =>
            emit({ type: "market-data", data })
          )
        )
      }

      await Promise.all(tasks)
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
