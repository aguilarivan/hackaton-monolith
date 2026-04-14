import { z } from "zod"
import type { BusinessInputData } from "@/components/hero-input"
import type {
  StartupAnalysis,
  Competitor,
  StartupKitItem,
  RoadmapStep,
} from "@/lib/mock-data"

// ── Zod schemas for Claude's output ──────────────────────────────────────────

const BusinessModelSchema = z.object({
  type: z.string(),
  description: z.string(),
  revenueStreams: z.array(
    z.object({ name: z.string(), percentage: z.number(), description: z.string() })
  ),
})

const MonetizationPlanSchema = z.object({
  name: z.string(),
  monthlyPriceArs: z.number(),
  target: z.string(),
  rationale: z.string(),
})

const CompetitorPriceBenchmarkSchema = z.object({
  lowArs: z.number(),
  medianArs: z.number(),
  highArs: z.number(),
  note: z.string(),
})

const ViabilityCoreSchema = z.object({
  marketPotential: z.number().min(1).max(10),
  competitionLevel: z.enum(["Low", "Medium", "High"]),
  entryBarrier: z.enum(["Low", "Medium", "High"]),
  trend: z.enum(["up", "stable", "down"]),
  timeToFirstIncome: z.string(),
  findings: z.array(
    z.object({ type: z.enum(["opportunity", "caution", "risk"]), text: z.string() })
  ),
  businessModel: BusinessModelSchema,
  monetization: z.object({
    strategy: z.string(),
    plans: z.array(MonetizationPlanSchema),
    benchmark: CompetitorPriceBenchmarkSchema,
  }),
  similarIdeas: z.array(
    z.object({
      idea: z.string(),
      market: z.string(),
      annualGrowth: z.string(),
      traction: z.string(),
      matchScore: z.number(),
    })
  ),
})

const CompetitorCoreSchema = z.object({
  name: z.string(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  cityArea: z.string(),
  marketShare: z.string(),
})

const LaunchZoneSchema = z.object({
  zone: z.string(),
  competitorDensity: z.number(),
  demandSignal: z.number(),
  launchScore: z.number(),
  color: z.string(),
})

const B2BClientSchema = z.object({
  name: z.string(),
  reason: z.string(),
  approach: z.string(),
  contactRole: z.string(),
  companyContext: z.string(),
})

const B2CSegmentSchema = z.object({
  segment: z.string(),
  estimatedSize: z.string(),
  reachStrategy: z.string(),
})

const TaxInfoSchema = z.object({
  regime: z.string(),
  monthlyEstimate: z.string(),
  annualEstimate: z.string(),
  benefits: z.array(z.string()),
})

const TaxCategorySchema = z.object({
  name: z.string(),
  type: z.enum(["simplified", "general"]),
  fixedMonthlyArs: z.number(),
  vatRate: z.number(),
  incomeTaxRate: z.number(),
  socialChargeRate: z.number(),
})

const LegalStructureCoreSchema = z.object({
  structures: z.array(z.object({ name: z.string(), recommended: z.boolean() })),
  explanation: z.string(),
  timeline: z.array(z.object({ month: z.number(), action: z.string() })),
  taxInfo: TaxInfoSchema,
  taxCategories: z.array(TaxCategorySchema),
})

const ProductOfferCoreSchema = z.object({
  platform: z.string(),
  title: z.string(),
  price: z.number(),
  url: z.string(),
  rating: z.number().optional(),
  delivery: z.string().optional(),
})

const StartupKitItemCoreSchema = z.object({
  name: z.string(),
  reason: z.string(),
  price: z.number(),
  percentage: z.number(),
  offers: z.array(ProductOfferCoreSchema).optional(),
})

const ValidationStepSchema = z.object({
  action: z.string(),
  metric: z.string(),
  duration: z.string(),
})

const RoadmapStepCoreSchema = z.object({
  period: z.string(),
  title: z.string(),
  actions: z.array(z.string()),
})

const FailureCaseSchema = z.object({
  startup: z.string(),
  reason: z.string(),
  lesson: z.string(),
})

const ObstacleSchema = z.object({
  severity: z.enum(["High", "Medium", "Low"]),
  title: z.string(),
  description: z.string(),
  solution: z.string(),
  failureCase: FailureCaseSchema.optional(),
})

export const ClaudeAnalysisCoreSchema = z.object({
  appName: z.string(),
  viability: ViabilityCoreSchema,
  competitors: z.object({
    competitors: z.array(CompetitorCoreSchema),
    launchZones: z.array(LaunchZoneSchema),
  }),
  clients: z.object({
    type: z.enum(["b2b", "b2c"]),
    b2bClients: z.array(B2BClientSchema).optional(),
    b2cSegments: z.array(B2CSegmentSchema).optional(),
  }),
  legalStructure: LegalStructureCoreSchema,
  startupKit: z.object({
    items: z.array(StartupKitItemCoreSchema),
  }),
  validationPlan: z.array(ValidationStepSchema),
  roadmap: z.array(RoadmapStepCoreSchema),
  obstacles: z.array(ObstacleSchema),
})

export type ClaudeAnalysisCore = z.infer<typeof ClaudeAnalysisCoreSchema>

// ── Zod schema for questions ──────────────────────────────────────────────────

export const ClarificationQuestionArraySchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    helper: z.string(),
    options: z.array(z.object({ value: z.string(), label: z.string() })),
  })
)

// ── Merge function: Claude core + mock computed data → full StartupAnalysis ──

export function mergeWithComputedData(
  core: ClaudeAnalysisCore,
  input: BusinessInputData,
  mock: StartupAnalysis
): StartupAnalysis {
  const competitorsWithLocations: Competitor[] = core.competitors.competitors.map((c) => ({ ...c }))

  // Prefer real offers from Claude's web search; fall back to mock if not found
  const kitItemsWithOffers: StartupKitItem[] = core.startupKit.items.map((item, i) => {
    const claudeOffers = item.offers?.length
      ? item.offers.map((o) => ({
          platform: o.platform,
          title: o.title,
          price: o.price,
          url: o.url,
          rating: o.rating ?? 4.5,
          delivery: o.delivery ?? "Consultar",
        }))
      : null
    return {
      ...item,
      offers: claudeOffers ?? mock.startupKit.items[i]?.offers ?? mock.startupKit.items[0]?.offers ?? [],
    }
  })

  // Compute budget distribution from Claude's item percentages
  const totalItemPct = core.startupKit.items.reduce((sum, item) => sum + item.percentage, 0)
  const reservePct = Math.max(5, 100 - totalItemPct - 20)
  const budgetDistribution = [
    { category: "Equipment & Setup", percentage: totalItemPct, color: "var(--section-kit)" },
    { category: "Marketing", percentage: 20, color: "var(--section-roadmap)" },
    { category: "Reserve", percentage: reservePct, color: "var(--section-viability)" },
  ]

  // Attach domain suggestions from mock to Claude's roadmap steps
  const roadmapWithDomains: RoadmapStep[] = core.roadmap.map((step, i) => ({
    ...step,
    domainSuggestion: mock.roadmap[i]?.domainSuggestion,
    domainChecks: mock.roadmap[i]?.domainChecks,
  }))

  return {
    appName: core.appName,
    input,
    viability: {
      ...core.viability,
      // growthData from mock; real sourceSignals injected by route handler
      growthData: mock.viability.growthData,
      sourceSignals: [],
    },
    competitors: {
      competitors: competitorsWithLocations,
      mapCenter: mock.competitors.mapCenter,
    },
    clients: core.clients,
    legalStructure: {
      ...core.legalStructure,
      bureaucracyLinks: mock.legalStructure.bureaucracyLinks,
    },
    startupKit: {
      budgetDistribution,
      items: kitItemsWithOffers,
      operationalReserve: mock.startupKit.operationalReserve,
    },
    validationPlan: core.validationPlan,
    roadmap: roadmapWithDomains,
    obstacles: core.obstacles,
  }
}
