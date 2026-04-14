import Anthropic from "@anthropic-ai/sdk"
import { generateAnalysis } from "@/lib/mock-data"
import type { StartupAnalysis } from "@/lib/mock-data"
import type { BusinessInputData, ClaudeAnswer } from "@/lib/server/flow-store"
import { apiError, apiSuccess, parseJsonBody } from "@/lib/server/api-response"
import { anthropic } from "@/lib/server/claude-client"
import { ClaudeAnalysisCoreSchema, mergeWithComputedData } from "@/lib/server/analysis-schema"
import {
  ANALYSIS_SYSTEM_PROMPT,
  ANALYSIS_TOOL_DEFINITION,
  WEB_SEARCH_TOOL,
  buildAnalysisUserMessage,
} from "@/lib/server/analysis-prompt"

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

async function generateAnalysisWithClaude(
  input: BusinessInputData,
  answers: ClaudeAnswer[]
): Promise<{ analysis: StartupAnalysis; source: "claude" | "mock" }> {
  const mockFallback = generateAnalysis(input)

  try {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: buildAnalysisUserMessage(input, answers) },
    ]

    const MAX_CONTINUATIONS = 6

    for (let turn = 0; turn < MAX_CONTINUATIONS; turn++) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 12000,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [WEB_SEARCH_TOOL, ANALYSIS_TOOL_DEFINITION] as any[],
        tool_choice: { type: "auto" },
        system: [
          {
            type: "text",
            text: ANALYSIS_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages,
      })

      console.log(
        `[claude/analysis] Turn ${turn + 1}, stop=${response.stop_reason}, cache_read=${response.usage.cache_read_input_tokens ?? 0}`
      )

      // generate_analysis may appear after web search result blocks in the same response
      const generateBlock = response.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "generate_analysis"
      )

      if (generateBlock) {
        const parsed = ClaudeAnalysisCoreSchema.parse(generateBlock.input)
        const analysis = mergeWithComputedData(parsed, input, mockFallback)
        return { analysis, source: "claude" }
      }

      if (response.stop_reason === "pause_turn") {
        // Server-side web search loop hit iteration limit — re-send without a new user message
        // The API detects the trailing server_tool_use block and resumes automatically
        messages.push({ role: "assistant", content: response.content })
        continue
      }

      if (response.stop_reason === "end_turn") {
        // Claude finished text response without calling generate_analysis — nudge it
        messages.push({ role: "assistant", content: response.content })
        messages.push({
          role: "user",
          content: "Llamá a generate_analysis con el análisis completo basado en tu investigación.",
        })
        continue
      }

      // Unexpected state — break and fall through to mock
      break
    }

    throw new Error("Max continuations reached without generate_analysis call")
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[claude/analysis] API error ${error.status}:`, error.message)
    } else {
      console.error("[claude/analysis] Error:", error)
    }
    return { analysis: mockFallback, source: "mock" }
  }
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

    const { analysis, source } = await generateAnalysisWithClaude(
      body.businessInput,
      body.claudeAnswers
    )

    return apiSuccess({
      analysis,
      metadata: {
        clarificationsReceived: body.claudeAnswers.length,
        generatedAt: new Date().toISOString(),
        source,
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
