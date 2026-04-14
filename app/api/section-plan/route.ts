import Anthropic from "@anthropic-ai/sdk"
import { apiSuccess, apiError, parseJsonBody } from "@/lib/server/api-response"
import type { BusinessInputData } from "@/components/hero-input"
import type { ClaudeAnswer } from "@/lib/flow-storage"
import {
  SECTION_PLAN_SYSTEM_PROMPT,
  buildSectionPlanUserMessage,
  ALL_SECTION_KEYS,
  SECTION_SUBSECTIONS,
  type SectionPlan,
} from "@/lib/server/section-plan-prompt"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0,
})

function isBusinessInputData(value: unknown): value is BusinessInputData {
  if (!value || typeof value !== "object") return false
  const p = value as Record<string, unknown>
  return (
    typeof p.idea === "string" &&
    (p.city === undefined || typeof p.city === "string") &&
    (p.investment === undefined || typeof p.investment === "number")
  )
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

function isValidSectionPlan(value: unknown): value is SectionPlan {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  return ALL_SECTION_KEYS.every((key) => {
    const entry = obj[key]
    if (!entry || typeof entry !== "object") return false
    const e = entry as Record<string, unknown>
    return typeof e.enabled === "boolean" && Array.isArray(e.subsections)
  })
}

/** Default plan: everything enabled with all subsections */
function defaultPlan(): SectionPlan {
  return Object.fromEntries(
    ALL_SECTION_KEYS.map((key) => [key, { enabled: true, subsections: [...SECTION_SUBSECTIONS[key]] }])
  ) as SectionPlan
}

export async function POST(request: Request) {
  let body: { businessInput?: unknown; claudeAnswers?: unknown }

  try {
    body = (await parseJsonBody(request)) as typeof body
  } catch {
    return apiError({ status: 400, code: "BAD_REQUEST", message: "Invalid JSON body" })
  }

  if (!isBusinessInputData(body.businessInput)) {
    return apiError({ status: 400, code: "INVALID_PAYLOAD", message: "Invalid businessInput" })
  }

  if (!isClaudeAnswerArray(body.claudeAnswers)) {
    return apiError({ status: 400, code: "INVALID_PAYLOAD", message: "Invalid claudeAnswers" })
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SECTION_PLAN_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildSectionPlanUserMessage(body.businessInput, body.claudeAnswers) },
      ],
    })

    const text =
      response.content[0]?.type === "text" ? response.content[0].text.trim() : ""

    // Extract JSON from response (may have markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[section-plan] no JSON in response:", text)
      return apiSuccess({ plan: defaultPlan() })
    }

    const parsed: unknown = JSON.parse(jsonMatch[0])

    if (!isValidSectionPlan(parsed)) {
      console.error("[section-plan] invalid shape:", parsed)
      return apiSuccess({ plan: defaultPlan() })
    }

    // Safety: viability, clients, obstacles are never disabled
    for (const key of ["viability", "clients", "obstacles"] as const) {
      const plan = parsed as SectionPlan
      if (!plan[key].enabled) {
        plan[key] = { enabled: true, subsections: [...SECTION_SUBSECTIONS[key]] }
      }
    }

    const planSummary = ALL_SECTION_KEYS.map((k) => `${k}:${(parsed as SectionPlan)[k].enabled ? "✓" : "✗"}`).join(" ")
    console.log("[section-plan] result:", planSummary)
    return apiSuccess({ plan: parsed })
  } catch (error) {
    console.error("[section-plan] Claude error:", (error as Error).message)
    // On failure, return all sections enabled so the analysis proceeds normally
    return apiSuccess({ plan: defaultPlan() })
  }
}
