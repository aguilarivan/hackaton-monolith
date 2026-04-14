import Anthropic from "@anthropic-ai/sdk"
import { getFlow, type BusinessInputData } from "@/lib/server/flow-store"
import { generateClarificationQuestions } from "@/lib/server/question-generator"
import { apiError, apiSuccess, parseJsonBody } from "@/lib/server/api-response"
import { anthropic } from "@/lib/server/claude-client"
import { ClarificationQuestionArraySchema } from "@/lib/server/analysis-schema"
import { getQuestionsSystemPrompt, buildQuestionsUserMessage } from "@/lib/server/questions-prompt"

function isBusinessInputData(value: unknown): value is BusinessInputData {
  if (!value || typeof value !== "object") return false

  const payload = value as Record<string, unknown>
  return (
    typeof payload.idea === "string" &&
    (payload.city === undefined || typeof payload.city === "string") &&
    (payload.investment === undefined || typeof payload.investment === "number")
  )
}

async function generateQuestionsWithClaude(input: BusinessInputData, locale: string = "es") {
  const fallback = generateClarificationQuestions(input)

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: getQuestionsSystemPrompt(locale),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildQuestionsUserMessage(input, locale),
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    const text = textBlock?.type === "text" ? textBlock.text.trim() : ""

    // Extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn("[claude/questions] No JSON array found in response, text:", text.slice(0, 200))
      return fallback
    }

    const parsed = ClarificationQuestionArraySchema.parse(JSON.parse(jsonMatch[0]))

    console.log(
      `[claude/questions] OK — ${parsed.length} questions, cache_read=${response.usage.cache_read_input_tokens ?? 0}`
    )

    return parsed
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[claude/questions] API error ${error.status}:`, error.message)
    } else {
      console.error("[claude/questions] Parse/validation error:", error)
    }
    return fallback
  }
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

    const locale = request.headers.get("X-Locale") ?? "es"
    const questions = await generateQuestionsWithClaude(input, locale)

    // Empty array is a valid response: Claude determined the idea has enough context
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
