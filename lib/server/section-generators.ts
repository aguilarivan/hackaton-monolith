import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { buildAnalysisUserMessage } from "./analysis-prompt"
import type { BusinessInputData, ClaudeAnswer } from "./flow-store"
import type {
  ViabilityData,
  ClientData,
  Obstacle,
  ValidationStep,
  RoadmapStep,
  LegalStructure,
  CompetitorData,
  StartupKitData,
  StartupKitItem,
  Competitor,
} from "@/lib/mock-data"
import type { StartupAnalysis } from "@/lib/mock-data"

// Haiku sometimes returns nested fields as JSON strings — recursively parse them
function deepParse(val: unknown): unknown {
  if (typeof val === "string") {
    try { return deepParse(JSON.parse(val)) } catch { return val }
  }
  if (Array.isArray(val)) return val.map(deepParse)
  if (val && typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, deepParse(v)])
    )
  }
  return val
}

// Zod wrapper (kept for convenience, but we also call deepParse before .parse())
const jsonString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val) } catch { return val }
    }
    return val
  }, schema)

// Fail fast — no retries so SSE shows fallback immediately instead of waiting
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0,
})

// ── Public types ──────────────────────────────────────────────────────────────

export interface ViabilitySection {
  appName: string
  viability: ViabilityData
  clients: ClientData
  _isMock?: boolean
}

export interface DetailsSection {
  obstacles: Obstacle[]
  validationPlan: ValidationStep[]
  roadmap: RoadmapStep[]
  legalStructure: LegalStructure
  _isMock?: boolean
}

export interface ResearchSection {
  competitors: CompetitorData
  startupKit: StartupKitData
  _isMock?: boolean
}

// ── Shared tool loop ──────────────────────────────────────────────────────────

async function runToolLoop(
  system: string,
  userMessage: string,
  tool: Anthropic.Tool,
): Promise<Anthropic.ToolUseBlock> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }]

  for (let turn = 0; turn < 5; turn++) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 3000,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      tools: [tool],
      tool_choice: { type: "auto" },
      messages,
    })

    console.log(`[${tool.name}] turn=${turn + 1} stop=${response.stop_reason}`)

    const block = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === tool.name
    )
    if (block) return block

    messages.push({ role: "assistant", content: response.content })
    messages.push({ role: "user", content: `Llamá a ${tool.name} con el análisis completo.` })
  }

  throw new Error(`${tool.name} not called after max turns`)
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Viability + Clients
// ══════════════════════════════════════════════════════════════════════════════

const VIABILITY_TOOL: Anthropic.Tool = {
  name: "generate_viability",
  description: "Genera análisis de viabilidad, monetización y perfil de clientes.",
  input_schema: {
    type: "object" as const,
    properties: {
      appName: { type: "string" },
      viability: {
        type: "object",
        properties: {
          marketPotential: { type: "number", description: "1-10" },
          competitionLevel: { type: "string", enum: ["Low", "Medium", "High"] },
          entryBarrier: { type: "string", enum: ["Low", "Medium", "High"] },
          trend: { type: "string", enum: ["up", "stable", "down"] },
          timeToFirstIncome: { type: "string" },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["opportunity", "caution", "risk"] },
                text: { type: "string" },
              },
              required: ["type", "text"],
            },
          },
          businessModel: {
            type: "object",
            properties: {
              type: { type: "string" },
              description: { type: "string" },
              revenueStreams: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    percentage: { type: "number" },
                    description: { type: "string" },
                  },
                  required: ["name", "percentage", "description"],
                },
              },
            },
            required: ["type", "description", "revenueStreams"],
          },
          monetization: {
            type: "object",
            properties: {
              strategy: { type: "string" },
              plans: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    monthlyPriceArs: { type: "number" },
                    target: { type: "string" },
                    rationale: { type: "string" },
                  },
                  required: ["name", "monthlyPriceArs", "target", "rationale"],
                },
              },
              benchmark: {
                type: "object",
                properties: {
                  lowArs: { type: "number" },
                  medianArs: { type: "number" },
                  highArs: { type: "number" },
                  note: { type: "string" },
                },
                required: ["lowArs", "medianArs", "highArs", "note"],
              },
            },
            required: ["strategy", "plans", "benchmark"],
          },
          similarIdeas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                idea: { type: "string" },
                market: { type: "string" },
                annualGrowth: { type: "string" },
                traction: { type: "string" },
                matchScore: { type: "number" },
              },
              required: ["idea", "market", "annualGrowth", "traction", "matchScore"],
            },
          },
        },
        required: ["marketPotential", "competitionLevel", "entryBarrier", "trend", "timeToFirstIncome", "findings", "businessModel", "monetization", "similarIdeas"],
      },
      clients: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["b2b", "b2c"] },
          b2bClients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                reason: { type: "string" },
                approach: { type: "string" },
                contactRole: { type: "string" },
                companyContext: { type: "string" },
              },
              required: ["name", "reason", "approach", "contactRole", "companyContext"],
            },
          },
          b2cSegments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                segment: { type: "string" },
                estimatedSize: { type: "string" },
                reachStrategy: { type: "string" },
              },
              required: ["segment", "estimatedSize", "reachStrategy"],
            },
          },
        },
        required: ["type"],
      },
    },
    required: ["appName", "viability", "clients"],
  },
}

const ViabilityOutputSchema = z.object({
  appName: z.string(),
  viability: jsonString(z.object({
    marketPotential: z.number(),
    competitionLevel: z.enum(["Low", "Medium", "High"]),
    entryBarrier: z.enum(["Low", "Medium", "High"]),
    trend: z.enum(["up", "stable", "down"]),
    timeToFirstIncome: z.string(),
    findings: z.array(z.object({ type: z.enum(["opportunity", "caution", "risk"]), text: z.string() })),
    businessModel: z.object({
      type: z.string(),
      description: z.string(),
      revenueStreams: z.array(z.object({ name: z.string(), percentage: z.number(), description: z.string() })),
    }),
    monetization: z.object({
      strategy: z.string(),
      plans: z.array(z.object({ name: z.string(), monthlyPriceArs: z.number(), target: z.string(), rationale: z.string() })),
      benchmark: z.object({ lowArs: z.number(), medianArs: z.number(), highArs: z.number(), note: z.string() }),
    }),
    similarIdeas: z.array(z.object({ idea: z.string(), market: z.string(), annualGrowth: z.string(), traction: z.string(), matchScore: z.number() })),
  })),
  clients: jsonString(z.object({
    type: z.enum(["b2b", "b2c"]),
    b2bClients: z.array(z.object({ name: z.string(), reason: z.string(), approach: z.string(), contactRole: z.string(), companyContext: z.string() })).optional(),
    b2cSegments: z.array(z.object({ segment: z.string(), estimatedSize: z.string(), reachStrategy: z.string() })).optional(),
  })),
})

export async function generateViabilitySection(
  input: BusinessInputData,
  answers: ClaudeAnswer[],
  mock: StartupAnalysis
): Promise<ViabilitySection> {
  try {
    const block = await runToolLoop(
      `Sos un analista de startups argentinos. Generá viabilidad, monetización y clientes para la idea recibida. Moneda ARS 2026. Llamá a generate_viability.`,
      buildAnalysisUserMessage(input, answers),
      VIABILITY_TOOL
    )
    const parsed = ViabilityOutputSchema.parse(deepParse(block.input))
    return {
      appName: parsed.appName,
      viability: { ...parsed.viability, growthData: mock.viability.growthData, sourceSignals: mock.viability.sourceSignals },
      clients: parsed.clients,
      _isMock: false,
    }
  } catch (error) {
    console.error("[generate_viability] error:", (error as Error).message)
    return { appName: mock.appName, viability: mock.viability, clients: mock.clients, _isMock: true }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Obstacles + Roadmap + Legal
// ══════════════════════════════════════════════════════════════════════════════

const DETAILS_TOOL: Anthropic.Tool = {
  name: "generate_details",
  description: "Genera obstáculos, plan de validación, roadmap y estructura legal.",
  input_schema: {
    type: "object" as const,
    properties: {
      obstacles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["High", "Medium", "Low"] },
            title: { type: "string" },
            description: { type: "string" },
            solution: { type: "string" },
            failureCase: {
              type: "object",
              properties: { startup: { type: "string" }, reason: { type: "string" }, lesson: { type: "string" } },
              required: ["startup", "reason", "lesson"],
            },
          },
          required: ["severity", "title", "description", "solution"],
        },
      },
      validationPlan: {
        type: "array",
        items: {
          type: "object",
          properties: { action: { type: "string" }, metric: { type: "string" }, duration: { type: "string" } },
          required: ["action", "metric", "duration"],
        },
      },
      roadmap: {
        type: "array",
        items: {
          type: "object",
          properties: {
            period: { type: "string" },
            title: { type: "string" },
            actions: { type: "array", items: { type: "string" } },
          },
          required: ["period", "title", "actions"],
        },
      },
      legalStructure: {
        type: "object",
        properties: {
          structures: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, recommended: { type: "boolean" } },
              required: ["name", "recommended"],
            },
          },
          explanation: { type: "string" },
          timeline: {
            type: "array",
            items: {
              type: "object",
              properties: { month: { type: "number" }, action: { type: "string" } },
              required: ["month", "action"],
            },
          },
          taxInfo: {
            type: "object",
            properties: {
              regime: { type: "string" },
              monthlyEstimate: { type: "string" },
              annualEstimate: { type: "string" },
              benefits: { type: "array", items: { type: "string" } },
            },
            required: ["regime", "monthlyEstimate", "annualEstimate", "benefits"],
          },
          taxCategories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["simplified", "general"] },
                fixedMonthlyArs: { type: "number" },
                vatRate: { type: "number" },
                incomeTaxRate: { type: "number" },
                socialChargeRate: { type: "number" },
              },
              required: ["name", "type", "fixedMonthlyArs", "vatRate", "incomeTaxRate", "socialChargeRate"],
            },
          },
        },
        required: ["structures", "explanation", "timeline", "taxInfo"],
      },
    },
    required: ["obstacles", "validationPlan", "roadmap", "legalStructure"],
  },
}

const DetailsOutputSchema = z.object({
  obstacles: jsonString(z.array(z.object({
    severity: z.enum(["High", "Medium", "Low"]),
    title: z.string(),
    description: z.string(),
    solution: z.string(),
    failureCase: z.object({ startup: z.string(), reason: z.string(), lesson: z.string() }).optional(),
  }))).optional(),
  validationPlan: jsonString(z.array(z.object({ action: z.string(), metric: z.string(), duration: z.string() }))).optional(),
  roadmap: jsonString(z.array(z.object({ period: z.string(), title: z.string(), actions: z.array(z.string()) }))).optional(),
  legalStructure: jsonString(z.object({
    structures: z.array(z.object({ name: z.string(), recommended: z.boolean() })),
    explanation: z.string(),
    timeline: z.array(z.object({ month: z.number(), action: z.string() })),
    taxInfo: z.object({ regime: z.string(), monthlyEstimate: z.string(), annualEstimate: z.string(), benefits: z.array(z.string()) }),
    taxCategories: z.array(z.object({ name: z.string(), type: z.enum(["simplified", "general"]), fixedMonthlyArs: z.number(), vatRate: z.number(), incomeTaxRate: z.number(), socialChargeRate: z.number() })).optional().default([]),
  })).optional(),
})

export async function generateDetailsSection(
  input: BusinessInputData,
  answers: ClaudeAnswer[],
  mock: StartupAnalysis
): Promise<DetailsSection> {
  try {
    const block = await runToolLoop(
      `Sos un analista de startups argentinos. Generá obstáculos, roadmap, plan de validación y estructura legal para la idea. Marcos legales: Monotributo, SAS (recomendada), SRL, SA. Citá startups reales que fallaron. Llamá a generate_details con los 4 campos: obstacles, validationPlan, roadmap y legalStructure.`,
      buildAnalysisUserMessage(input, answers),
      DETAILS_TOOL
    )
    const parsed = DetailsOutputSchema.parse(deepParse(block.input))

    // Merge per-field: use Claude's data where available, fall back to mock
    return {
      obstacles: parsed.obstacles ?? mock.obstacles,
      validationPlan: parsed.validationPlan ?? mock.validationPlan,
      roadmap: (parsed.roadmap ?? mock.roadmap).map((step, i) => ({
        ...step,
        domainSuggestion: mock.roadmap[i]?.domainSuggestion,
        domainChecks: mock.roadmap[i]?.domainChecks,
      })),
      legalStructure: parsed.legalStructure
        ? { ...parsed.legalStructure, bureaucracyLinks: mock.legalStructure.bureaucracyLinks }
        : mock.legalStructure,
      _isMock: false,
    }
  } catch (error) {
    console.error("[generate_details] error:", (error as Error).message)
    return { obstacles: mock.obstacles, validationPlan: mock.validationPlan, roadmap: mock.roadmap, legalStructure: mock.legalStructure, _isMock: true }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Competitors + Kit  (Sonnet + web search)
// ══════════════════════════════════════════════════════════════════════════════

const WEB_SEARCH_TOOL = { type: "web_search_20260209" as const, name: "web_search" } as const

/**
 * Like runToolLoop but also handles web_search tool calls transparently.
 * Claude may call web_search multiple times before calling the target tool.
 * For each web_search tool_use we send back an empty tool_result; Anthropic's
 * server-side infrastructure injects the real search results.
 */
async function runToolLoopWithSearch(
  system: string,
  userMessage: string,
  tool: Anthropic.Tool,
): Promise<Anthropic.ToolUseBlock> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }]

  for (let turn = 0; turn < 12; turn++) {
    // Force the very first turn to be a web_search so Claude can't skip it
    const toolChoice = turn === 0
      ? { type: "tool" as const, name: "web_search" }
      : { type: "auto" as const }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      tools: [WEB_SEARCH_TOOL as unknown as Anthropic.Tool, tool],
      tool_choice: toolChoice,
      messages,
    })

    console.log(`[${tool.name}+search] turn=${turn + 1} stop=${response.stop_reason} blocks=${response.content.length}`)

    // Target tool was called → done
    const targetBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === tool.name
    )
    if (targetBlock) return targetBlock

    if (response.stop_reason === "end_turn") {
      // Claude finished without calling the tool — nudge it
      messages.push({ role: "assistant", content: response.content })
      messages.push({ role: "user", content: `Ahora llamá a ${tool.name} con toda la información que encontraste.` })
      continue
    }

    // stop_reason === "tool_use" — handle web_search tool_use blocks
    const webSearchBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "web_search"
    )

    if (webSearchBlocks.length > 0) {
      messages.push({ role: "assistant", content: response.content })
      // Acknowledge each web_search call; server injects real results
      messages.push({
        role: "user",
        content: webSearchBlocks.map((b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: [],
        })),
      })
      continue
    }

    // Unknown stop — nudge
    messages.push({ role: "assistant", content: response.content })
    messages.push({ role: "user", content: `Llamá a ${tool.name} con el análisis completo.` })
  }

  throw new Error(`${tool.name} not called after max turns`)
}

const RESEARCH_TOOL: Anthropic.Tool = {
  name: "generate_research",
  description: "Genera análisis de competidores reales (encontrados via web search) y kit de inicio.",
  input_schema: {
    type: "object" as const,
    properties: {
      competitors: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            description: "4 competidores REALES encontrados via búsqueda web. Cada uno debe tener URL verificable.",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nombre real de la empresa/emprendimiento encontrado en la búsqueda" },
                description: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                cityArea: { type: "string", description: "Barrio o zona real donde opera" },
                marketShare: { type: "string", description: "Estimación de market share. Ej: '15-20%'" },
                url: { type: "string", description: "URL real del sitio web o perfil en redes del competidor, encontrada en la búsqueda" },
              },
              required: ["name", "description", "strengths", "weaknesses", "cityArea", "marketShare"],
            },
          },
          launchZones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zone: { type: "string", description: "Nombre real de barrio/zona de la ciudad" },
                competitorDensity: { type: "number" },
                demandSignal: { type: "number" },
                launchScore: { type: "number" },
                color: { type: "string", description: "hex: verde #22c55e si >7.5, amarillo #f59e0b si 5.5-7.5, rojo #ef4444 si <5.5" },
              },
              required: ["zone", "competitorDensity", "demandSignal", "launchScore", "color"],
            },
          },
        },
        required: ["competitors", "launchZones"],
      },
      startupKit: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                reason: { type: "string" },
                price: { type: "number", description: "precio estimado en ARS 2026" },
                percentage: { type: "number", description: "% del presupuesto total" },
              },
              required: ["name", "reason", "price", "percentage"],
            },
          },
        },
        required: ["items"],
      },
    },
    required: ["competitors", "startupKit"],
  },
}

const ResearchOutputSchema = z.object({
  competitors: z.preprocess(
    (val) => {
      const v = typeof val === "string" ? (() => { try { return JSON.parse(val) } catch { return val } })() : val
      if (Array.isArray(v)) return { competitors: v, launchZones: [] }
      return v
    },
    z.object({
      competitors: z.array(z.object({
        name: z.string(),
        description: z.string(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        cityArea: z.string(),
        marketShare: z.string(),
        url: z.string().optional(),
      })),
      launchZones: z.array(z.object({
        zone: z.string(),
        competitorDensity: z.number(),
        demandSignal: z.number(),
        launchScore: z.number(),
        color: z.string(),
      })).default([]),
    })
  ),
  startupKit: z.preprocess(
    (val) => {
      const v = typeof val === "string" ? (() => { try { return JSON.parse(val) } catch { return val } })() : val
      if (Array.isArray(v)) return { items: v }
      return v
    },
    z.object({
      items: z.array(z.object({
        name: z.string(),
        reason: z.string(),
        price: z.number(),
        percentage: z.number(),
      })),
    })
  ),
})

function buildResearchSystem(city: string): string {
  return `Sos un analista de startups con acceso a búsqueda web.

TAREA: Encontrar competidores REALES para la idea y ciudad indicadas.

PASOS OBLIGATORIOS:
1. Buscá "[tipo de negocio] ${city}" — encontrá empresas/emprendimientos reales que operen en ese mercado
2. Buscá "[tipo de negocio] ${city} Instagram" o "[tipo de negocio] ${city} sitio web" — encontrá perfiles reales
3. Para cada competidor: anotá su nombre real, URL del sitio o Instagram, y zona donde opera
4. Identificá 4 zonas geográficas reales de ${city} con análisis de densidad competidora vs demanda

REGLA CRÍTICA: Solo incluí competidores que encontraste en la búsqueda. Si no encontrás suficientes reales, podés completar con competidores plausibles pero indicalo en la descripción.

Después de buscar, llamá a generate_research con los datos.`
}

export async function generateResearchSection(
  input: BusinessInputData,
  answers: ClaudeAnswer[],
  mock: StartupAnalysis
): Promise<ResearchSection> {
  try {
    const block = await runToolLoopWithSearch(
      buildResearchSystem(input.city || "la ciudad indicada"),
      buildAnalysisUserMessage(input, answers),
      RESEARCH_TOOL
    )
    console.log("[generate_research] raw block.input:", JSON.stringify(block.input, null, 2))
    const parsed = ResearchOutputSchema.parse(deepParse(block.input))

    const competitorsWithLocations: Competitor[] = parsed.competitors.competitors.map((c, i) => ({
      ...c,
      location: mock.competitors.competitors[i]?.location,
    }))

    const kitItems: StartupKitItem[] = parsed.startupKit.items.map((item, i) => ({
      ...item,
      offers: mock.startupKit.items[i]?.offers ?? mock.startupKit.items[0]?.offers ?? [],
    }))

    const totalItemPct = parsed.startupKit.items.reduce((sum, item) => sum + item.percentage, 0)
    const reservePct = Math.max(5, 100 - totalItemPct - 20)

    return {
      competitors: {
        competitors: competitorsWithLocations,
        mapCenter: mock.competitors.mapCenter,
        launchZones: parsed.competitors.launchZones,
      },
      startupKit: {
        items: kitItems,
        operationalReserve: mock.startupKit.operationalReserve,
        budgetDistribution: [
          { category: "Equipment & Setup", percentage: totalItemPct, color: "var(--section-kit)" },
          { category: "Marketing", percentage: 20, color: "var(--section-roadmap)" },
          { category: "Reserve", percentage: reservePct, color: "var(--section-viability)" },
        ],
      },
      _isMock: false,
    }
  } catch (error) {
    console.error("[generate_research] error:", (error as Error).message)
    return { competitors: mock.competitors, startupKit: mock.startupKit, _isMock: true }
  }
}
