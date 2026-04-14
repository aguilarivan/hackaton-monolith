import type { BusinessInputData } from "@/components/hero-input"

export interface BusinessModel {
  type: string
  description: string
  revenueStreams: {
    name: string
    percentage: number
    description: string
  }[]
}

export interface MonetizationPlan {
  name: string
  monthlyPriceArs: number
  target: string
  rationale: string
}

export interface CompetitorPriceBenchmark {
  lowArs: number
  medianArs: number
  highArs: number
  note: string
}

export interface MonetizationData {
  strategy: string
  plans: MonetizationPlan[]
  benchmark: CompetitorPriceBenchmark
}

export interface GrowthData {
  year: number
  revenue: number
  projected?: boolean
}

export interface MarketSignal {
  source: string
  metric: string
  value: string
  scoreImpact: number
  trend: "up" | "stable" | "down"
  history: {
    period: string
    value: number
  }[]
  lastUpdated: string
  url: string
}

export interface SimilarIdeaBenchmark {
  idea: string
  market: string
  annualGrowth: string
  traction: string
  matchScore: number
}

export interface ViabilityData {
  marketPotential: number
  competitionLevel: "Low" | "Medium" | "High"
  entryBarrier: "Low" | "Medium" | "High"
  trend: "up" | "stable" | "down"
  timeToFirstIncome: string
  findings: {
    type: "opportunity" | "caution" | "risk"
    text: string
  }[]
  sourceSignals: MarketSignal[]
  similarIdeas: SimilarIdeaBenchmark[]
  businessModel: BusinessModel
  growthData: GrowthData[]
  monetization: MonetizationData
}

export interface Competitor {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  cityArea: string
  marketShare: string
  location?: {
    lat: number
    lng: number
  }
}

export interface LaunchZone {
  zone: string
  competitorDensity: number
  demandSignal: number
  launchScore: number
  color: string
}

export interface CompetitorData {
  competitors: Competitor[]
  mapCenter: {
    lat: number
    lng: number
  }
  launchZones: LaunchZone[]
}

export interface B2BClient {
  name: string
  reason: string
  approach: string
  contactRole: string
  companyContext: string
}

export interface B2CSegment {
  segment: string
  estimatedSize: string
  reachStrategy: string
}

export interface ClientData {
  type: "b2b" | "b2c"
  b2bClients?: B2BClient[]
  b2cSegments?: B2CSegment[]
}

export interface TaxInfo {
  regime: string
  monthlyEstimate: string
  annualEstimate: string
  benefits: string[]
}

export interface TaxCategory {
  name: string
  type: "simplified" | "general"
  fixedMonthlyArs: number
  vatRate: number
  incomeTaxRate: number
  socialChargeRate: number
}

export interface LegalStructure {
  structures: {
    name: string
    recommended: boolean
  }[]
  explanation: string
  timeline: {
    month: number
    action: string
  }[]
  taxInfo: TaxInfo
  taxCategories: TaxCategory[]
  bureaucracyLinks: {
    label: string
    url: string
    description: string
  }[]
}

export interface ProductOffer {
  platform: string
  title: string
  price: number
  rating: number
  delivery: string
  url: string
}

export interface StartupKitItem {
  name: string
  reason: string
  price: number
  percentage: number
  offers: ProductOffer[]
}

export interface StartupKitData {
  budgetDistribution: {
    category: string
    percentage: number
    color: string
  }[]
  items: StartupKitItem[]
  operationalReserve: number
}

export interface ValidationStep {
  action: string
  metric: string
  duration: string
}

export interface DomainSuggestion {
  domain: string
  available: boolean
}

export interface RoadmapStep {
  period: string
  title: string
  actions: string[]
  domainSuggestion?: DomainSuggestion
  domainChecks?: DomainSuggestion[]
}

export interface FailureCase {
  startup: string
  reason: string
  lesson: string
}

export interface Obstacle {
  severity: "High" | "Medium" | "Low"
  title: string
  description: string
  solution: string
  failureCase?: FailureCase
}

export interface StartupAnalysis {
  appName: string
  input: BusinessInputData
  viability: ViabilityData
  competitors: CompetitorData
  clients: ClientData
  legalStructure: LegalStructure
  startupKit: StartupKitData
  validationPlan: ValidationStep[]
  roadmap: RoadmapStep[]
  obstacles: Obstacle[]
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pseudoRange(seed: string, min: number, max: number): number {
  const hash = hashString(seed)
  const normalized = (hash % 1000) / 1000
  return min + (max - min) * normalized
}

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

function buildSignalHistory(base: number, seed: string, trend: "up" | "stable" | "down") {
  const periods = ["M-5", "M-4", "M-3", "M-2", "M-1", "Now"]
  const drift = trend === "up" ? 0.28 : trend === "down" ? -0.28 : 0.03

  return periods.map((period, index) => {
    const volatility = pseudoRange(`${seed}-${period}`, -0.18, 0.18)
    const value = clamp(0.5, Number((base + (index - 2.5) * drift + volatility).toFixed(1)), 10)
    return { period, value }
  })
}

function generateSlug(idea: string): string {
  return idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("")
}

function generateAppName(idea: string): string {
  const words = idea
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (words.length === 0) return "NovaPilot"

  const suffixes = ["Hub", "Flow", "Pulse", "Forge", "Pilot", "Nest"]
  const suffix = suffixes[hashString(idea) % suffixes.length]

  const base = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")

  return `${base}${suffix}`
}

function getMapCenter(city: string): { lat: number; lng: number } {
  const normalized = city.toLowerCase()
  if (normalized.includes("cordoba")) return { lat: -31.4201, lng: -64.1888 }
  if (normalized.includes("rosario")) return { lat: -32.9442, lng: -60.6505 }
  if (normalized.includes("mendoza")) return { lat: -32.8895, lng: -68.8458 }
  return { lat: -34.6037, lng: -58.3816 }
}

export function generateAnalysis(input: BusinessInputData): StartupAnalysis {
  const { idea, city, investment } = input
  const normalizedCity = city || "Buenos Aires"
  const lowerIdea = idea.toLowerCase()
  const appName = generateAppName(idea)

  const isFood = /catering|food|restaurant|kitchen|comida|restaurante/.test(lowerIdea)
  const isTech = /app|software|platform|saas|ia|ai|automation/.test(lowerIdea)
  const isService = /service|cleaning|maintenance|servicio|consulting/.test(lowerIdea)
  const isB2B = /business|corporate|b2b|empresa/.test(lowerIdea) || isTech || isFood

  const trendsScore = Math.round(pseudoRange(`${idea}-${normalizedCity}-trends`, 48, 92))
  const meliListings = Math.round(pseudoRange(`${idea}-${normalizedCity}-meli`, 180, 3400))
  const indecGrowth = Number(pseudoRange(`${idea}-indec`, -2, 18).toFixed(1))
  const similarIdeasStrength = Math.round(pseudoRange(`${idea}-comparables`, 52, 93))

  const dynamicMarketScore = clamp(
    1,
    Number(
      (
        trendsScore * 0.045 +
        Math.min(meliListings / 780, 3.5) +
        (indecGrowth + 3) * 0.17 +
        similarIdeasStrength * 0.022
      ).toFixed(1)
    ),
    10
  )

  const competitionLevel: "Low" | "Medium" | "High" = dynamicMarketScore > 7.5 ? "High" : dynamicMarketScore > 5.8 ? "Medium" : "Low"
  const entryBarrier: "Low" | "Medium" | "High" = isTech ? "Medium" : isFood ? "Low" : "Low"
  const trend: "up" | "stable" | "down" = indecGrowth > 8 ? "up" : indecGrowth > 3 ? "stable" : "down"

  const businessModel: BusinessModel = isFood
    ? {
        type: "Service + Product Hybrid",
        description: "Revenue from recurring company catering plus high-margin event menus.",
        revenueStreams: [
          { name: "Corporate plans", percentage: 55, description: "Weekly recurring office meal plans." },
          { name: "Events", percentage: 30, description: "One-off events and branded activations." },
          { name: "On-demand orders", percentage: 15, description: "Direct and app-based ad-hoc sales." },
        ],
      }
    : isTech
    ? {
        type: "B2B SaaS",
        description: "Subscription software with implementation upsell and annual contracts.",
        revenueStreams: [
          { name: "Monthly subscriptions", percentage: 65, description: "Tiered plans by seats or usage." },
          { name: "Annual enterprise", percentage: 25, description: "Discounted annual contracts with SLA." },
          { name: "Implementation", percentage: 10, description: "Onboarding, training, and custom setup." },
        ],
      }
    : {
        type: "Specialized Services",
        description: "Project-based delivery with recurring retainers once trust is built.",
        revenueStreams: [
          { name: "Projects", percentage: 50, description: "Defined-scope delivery." },
          { name: "Retainers", percentage: 35, description: "Recurring service agreements." },
          { name: "Advisory", percentage: 15, description: "Consulting and optimization." },
        ],
      }

  const currentYear = new Date().getFullYear()
  const baseRevenue = isTech ? 1.8 : isFood ? 2.4 : 1.9
  const growthFactor = 1 + indecGrowth / 100
  const growthData: GrowthData[] = [
    { year: currentYear - 3, revenue: Number((baseRevenue * 0.78).toFixed(1)) },
    { year: currentYear - 2, revenue: Number((baseRevenue * 0.93).toFixed(1)) },
    { year: currentYear - 1, revenue: Number((baseRevenue * 1.08).toFixed(1)) },
    { year: currentYear, revenue: Number((baseRevenue * 1.22).toFixed(1)) },
    { year: currentYear + 1, revenue: Number((baseRevenue * 1.22 * growthFactor).toFixed(1)), projected: true },
    { year: currentYear + 2, revenue: Number((baseRevenue * 1.22 * growthFactor * 1.18).toFixed(1)), projected: true },
  ]

  const baseMonthlyPrice = isFood ? 98000 : isTech ? 76000 : 68000
  const competitionMultiplier = competitionLevel === "High" ? 0.93 : competitionLevel === "Medium" ? 1 : 1.09
  const trendMultiplier = trend === "up" ? 1.06 : trend === "stable" ? 1 : 0.94
  const scoreMultiplier = dynamicMarketScore >= 7.5 ? 1.05 : dynamicMarketScore >= 6 ? 1 : 0.95
  const anchorPrice = Math.round((baseMonthlyPrice * competitionMultiplier * trendMultiplier * scoreMultiplier) / 500) * 500

  const monetization: MonetizationData = {
    strategy:
      "Tiered monetization with an accessible entry plan, a margin-focused core plan, and a premium tier to maximize ARPU on higher-value accounts.",
    plans: [
      {
        name: "Starter",
        monthlyPriceArs: Math.round((anchorPrice * 0.68) / 500) * 500,
        target: isTech ? "Small teams" : isFood ? "SMBs with basic recurring orders" : "Early-stage, lower-ticket clients",
        rationale: "Entry price designed to speed up acquisition without weakening brand positioning.",
      },
      {
        name: "Growth",
        monthlyPriceArs: anchorPrice,
        target: isTech ? "Growing SMBs" : isFood ? "Mid-sized offices with weekly frequency" : "Recurring clients with higher volume",
        rationale: "Recommended core plan: balances competitiveness and operating margin.",
      },
      {
        name: "Scale",
        monthlyPriceArs: Math.round((anchorPrice * 1.52) / 500) * 500,
        target: isTech ? "Enterprise accounts" : isFood ? "Corporate clients and premium events" : "High-demand accounts with SLA requirements",
        rationale: "Captures value in segments with lower price sensitivity.",
      },
    ],
    benchmark: {
      lowArs: Math.round((anchorPrice * 0.8) / 500) * 500,
      medianArs: Math.round((anchorPrice * 1.03) / 500) * 500,
      highArs: Math.round((anchorPrice * 1.37) / 500) * 500,
      note: `Estimated range based on ${competitionLevel.toLowerCase()} competition and a ${trend} trend scenario.`,
    },
  }

  const sourceSignals: MarketSignal[] = [
    {
      source: "Google Trends / Serp snapshot",
      metric: "Demand momentum",
      value: `${trendsScore}/100`,
      scoreImpact: Number((trendsScore / 12).toFixed(1)),
      trend: trendsScore > 72 ? "up" : trendsScore > 58 ? "stable" : "down",
      history: buildSignalHistory(Number((trendsScore / 12).toFixed(1)), `${idea}-trends-history`, trendsScore > 72 ? "up" : trendsScore > 58 ? "stable" : "down"),
      lastUpdated: "2026-04-12",
      url: "https://trends.google.com/",
    },
    {
      source: "Mercado Libre public API",
      metric: "Active listings",
      value: `${meliListings.toLocaleString("en-US")} listings`,
      scoreImpact: Number((Math.min(meliListings / 900, 3.3)).toFixed(1)),
      trend: meliListings > 1800 ? "up" : meliListings > 900 ? "stable" : "down",
      history: buildSignalHistory(Number((Math.min(meliListings / 900, 3.3)).toFixed(1)), `${idea}-meli-history`, meliListings > 1800 ? "up" : meliListings > 900 ? "stable" : "down"),
      lastUpdated: "2026-04-12",
      url: "https://developers.mercadolibre.com.ar/",
    },
    {
      source: "INDEC sector estimate",
      metric: "Sector yearly growth",
      value: `${indecGrowth}% YoY`,
      scoreImpact: Number(((indecGrowth + 2) / 5).toFixed(1)),
      trend: indecGrowth > 8 ? "up" : indecGrowth > 3 ? "stable" : "down",
      history: buildSignalHistory(Number(((indecGrowth + 2) / 5).toFixed(1)), `${idea}-indec-history`, indecGrowth > 8 ? "up" : indecGrowth > 3 ? "stable" : "down"),
      lastUpdated: "2026-04-11",
      url: "https://www.indec.gob.ar/",
    },
  ]

  const similarIdeas: SimilarIdeaBenchmark[] = isTech
    ? [
        {
          idea: "Nubity (B2B automation)",
          market: "LATAM SMB",
          annualGrowth: "+29%",
          traction: "Reached 500 paid accounts in 14 months",
          matchScore: 86,
        },
        {
          idea: "Mural-style workflow tools",
          market: "Remote collaboration",
          annualGrowth: "+18%",
          traction: "Scaled through product-led growth",
          matchScore: 79,
        },
      ]
    : isFood
    ? [
        {
          idea: "Cocina de Barrio",
          market: "Urban office catering",
          annualGrowth: "+21%",
          traction: "From 8 to 60 recurring company clients",
          matchScore: 82,
        },
        {
          idea: "Healthy Lunch Subscriptions",
          market: "Corporate wellness",
          annualGrowth: "+17%",
          traction: "Partnered with 3 coworking chains",
          matchScore: 76,
        },
      ]
    : [
        {
          idea: "UrbanFix Services",
          market: "On-demand home services",
          annualGrowth: "+16%",
          traction: "Scaled through local referrals",
          matchScore: 78,
        },
        {
          idea: "ProAssist B2B",
          market: "SMB operations",
          annualGrowth: "+14%",
          traction: "Strong recurring contracts",
          matchScore: 74,
        },
      ]

  const viability: ViabilityData = {
    marketPotential: dynamicMarketScore,
    competitionLevel,
    entryBarrier,
    trend,
    timeToFirstIncome: isTech ? "6-10 weeks" : isFood ? "2-4 weeks" : "3-6 weeks",
    findings: [
      {
        type: "opportunity",
        text: `Search and listing signals show sustained demand for this category in ${normalizedCity}.`,
      },
      {
        type: "opportunity",
        text: `With ${investment.toLocaleString("en-US")} ARS, the first 90 days are financially viable with controlled burn.`,
      },
      {
        type: "caution",
        text: `Comparable successful ideas score ${similarIdeasStrength}/100 in similarity, but positioning must be sharper than local incumbents.`,
      },
      {
        type: "risk",
        text: "Initial client acquisition can stall without a clear niche and repeatable outreach.",
      },
    ],
    sourceSignals,
    similarIdeas,
    businessModel,
    growthData,
    monetization,
  }

  const isBuenosAires = /buenos aires|caba/i.test(normalizedCity)
  const center = isBuenosAires ? { lat: -34.6037, lng: -58.3816 } : getMapCenter(normalizedCity)
  const competitorOffsets = [
    { lat: 0.016, lng: 0.01 },
    { lat: -0.013, lng: -0.012 },
    { lat: 0.007, lng: -0.016 },
    { lat: -0.009, lng: 0.014 },
  ]
  const hardcodedBuenosAiresLocations = [
    { lat: -34.6024, lng: -58.3789 }, // Microcentro
    { lat: -34.5885, lng: -58.4305 }, // Palermo
    { lat: -34.5621, lng: -58.4562 }, // Belgrano
    { lat: -34.6195, lng: -58.4432 }, // Caballito
  ]
  const competitorLocations = isBuenosAires
    ? hardcodedBuenosAiresLocations
    : competitorOffsets.map((offset) => ({ lat: center.lat + offset.lat, lng: center.lng + offset.lng }))

  const competitors: CompetitorData = {
    competitors: [
      {
        name: isTech ? "ScaleOps" : isFood ? "MesaPro Catering" : "UrbanAssist",
        description: "Well-positioned incumbent with strong brand recognition.",
        strengths: ["Distribution", "Repeat customers", "Operational discipline"],
        weaknesses: ["Higher prices", "Slow personalization", "Rigid packages"],
        cityArea: "Financial district",
        marketShare: "24%",
        location: competitorLocations[0],
      },
      {
        name: isTech ? "FlowPilot" : isFood ? "DailyFork" : "FastHands",
        description: "Fast-growing challenger focused on convenience.",
        strengths: ["Speed", "Modern UX", "Strong social presence"],
        weaknesses: ["Support gaps", "Quality variance", "Cash burn risk"],
        cityArea: "North corridor",
        marketShare: "16%",
        location: competitorLocations[1],
      },
      {
        name: isTech ? "LegacySuite" : isFood ? "Tradizione Eventos" : "MasterLocal",
        description: "Traditional operator with long-standing accounts.",
        strengths: ["Relationships", "Experience", "Large contracts"],
        weaknesses: ["Outdated stack", "Weak digital funnel", "Slow onboarding"],
        cityArea: "Historic center",
        marketShare: "19%",
        location: competitorLocations[2],
      },
      {
        name: isTech ? "NicheCloud" : isFood ? "GreenBite Co" : "HomePro Plus",
        description: "Niche specialist with selective clientele.",
        strengths: ["Specialization", "Premium perception", "High retention"],
        weaknesses: ["Limited scale", "Narrow segment", "Higher CAC"],
        cityArea: "Residential west",
        marketShare: "11%",
        location: competitorLocations[3],
      },
    ],
    mapCenter: center,
    launchZones: [
      { zone: "North Corridor", competitorDensity: 8.4, demandSignal: 9.1, launchScore: 6.4, color: "#f59e0b" },
      { zone: "West Residential", competitorDensity: 4.2, demandSignal: 7.9, launchScore: 8.2, color: "#22c55e" },
      { zone: "Downtown Core", competitorDensity: 9.3, demandSignal: 8.8, launchScore: 5.9, color: "#ef4444" },
      { zone: "South Logistics", competitorDensity: 5.1, demandSignal: 7.2, launchScore: 7.6, color: "#84cc16" },
    ],
  }

  const clients: ClientData = isB2B
    ? {
        type: "b2b",
        b2bClients: [
          {
            name: `Tech offices in ${normalizedCity}`,
            reason: "Recurring demand and budget allocated for productivity and employee experience.",
            approach: "Warm intro + 20-minute diagnostic call + pilot proposal.",
            contactRole: "Operations Manager",
            companyContext: "Fast decision cycles and clear ROI expectations.",
          },
          {
            name: "Professional services firms",
            reason: "Need reliable quality and reputation-safe providers.",
            approach: "Account-based outreach with a compliance-first pitch.",
            contactRole: "Managing Partner / Admin Lead",
            companyContext: "Risk-averse but high lifetime value once onboarded.",
          },
          {
            name: "Coworking operators",
            reason: "Need differentiated member experience to reduce churn.",
            approach: "Offer co-branded pilot for one location.",
            contactRole: "Community Manager",
            companyContext: "Open to experimentation and quick pilots.",
          },
        ],
      }
    : {
        type: "b2c",
        b2cSegments: [
          {
            segment: "Young professionals (25-40)",
            estimatedSize: `~110,000 people in ${normalizedCity}`,
            reachStrategy: "Instagram + Google Maps reviews + referral loops.",
          },
          {
            segment: "Families with children",
            estimatedSize: `~82,000 households in ${normalizedCity}`,
            reachStrategy: "Facebook community groups + WhatsApp campaigns.",
          },
          {
            segment: "Independent seniors",
            estimatedSize: `~42,000 people in ${normalizedCity}`,
            reachStrategy: "Local partnerships and trust-focused messaging.",
          },
        ],
      }

  const legalStructure: LegalStructure = {
    structures: [
      { name: "Monotributo", recommended: investment < 1200000 },
      { name: "SAS", recommended: investment >= 1200000 && investment < 6000000 },
      { name: "SRL", recommended: false },
      { name: "SA", recommended: investment >= 6000000 },
    ],
    explanation:
      investment < 1200000
        ? "Monotributo is practical for a lean start. Keep fixed costs low and migrate once invoicing approaches category ceilings."
        : "SAS balances legal protection and operational agility. It is typically the best path for scalable operations.",
    timeline: [
      { month: 1, action: "Register tax category and open legal entity if needed" },
      { month: 2, action: "Set invoicing, contracts, and accounting controls" },
      { month: 6, action: "Reassess category based on actual monthly revenue" },
    ],
    taxInfo:
      investment < 1200000
        ? {
            regime: "Simplified Tax Regime",
            monthlyEstimate: "ARS 42,000 - 95,000",
            annualEstimate: "ARS 504,000 - 1,140,000",
            benefits: [
              "Single monthly payment",
              "Lower administrative complexity",
              "Predictable cash planning",
              "Fast initial setup",
            ],
          }
        : {
            regime: "General Tax Regime",
            monthlyEstimate: "VAT + Income Tax + Social charges",
            annualEstimate: "Depends on margin and invoices",
            benefits: [
              "No billing ceilings",
              "Deductible operational expenses",
              "Suitable for growth and investors",
              "More robust legal profile",
            ],
          },
    taxCategories: [
      {
        name: "Monotributo",
        type: "simplified",
        fixedMonthlyArs: 65000,
        vatRate: 0,
        incomeTaxRate: 0,
        socialChargeRate: 0,
      },
      {
        name: "Responsable Inscripto",
        type: "general",
        fixedMonthlyArs: 38000,
        vatRate: 0.21,
        incomeTaxRate: 0.12,
        socialChargeRate: 0.06,
      },
      {
        name: "SAS (estimated)",
        type: "general",
        fixedMonthlyArs: 52000,
        vatRate: 0.21,
        incomeTaxRate: 0.15,
        socialChargeRate: 0.07,
      },
    ],
    bureaucracyLinks: [
      {
        label: "AFIP - Tax registration",
        url: "https://www.afip.gob.ar/",
        description: "Start or update tax status and billing setup.",
      },
      {
        label: "TAD - Legal entity procedures",
        url: "https://tramitesadistancia.gob.ar/",
        description: "Online incorporation and administrative legal workflows.",
      },
      {
        label: "IGJ - Corporate filings",
        url: "https://www.argentina.gob.ar/justicia/igj",
        description: "Corporate registration and legal formalization guidance.",
      },
    ],
  }

  const equipmentPct = isFood ? 38 : isTech ? 22 : 34
  const stockPct = isFood ? 22 : isTech ? 8 : 16
  const marketingPct = 20
  const reservePct = 100 - equipmentPct - stockPct - marketingPct

  const startupKit: StartupKitData = {
    budgetDistribution: [
      { category: "Equipment", percentage: equipmentPct, color: "var(--section-kit)" },
      { category: "Initial Stock", percentage: stockPct, color: "var(--section-clients)" },
      { category: "Marketing", percentage: marketingPct, color: "var(--section-roadmap)" },
      { category: "Reserve", percentage: reservePct, color: "var(--section-viability)" },
    ],
    items: [
      {
        name: isFood ? "Commercial convection oven" : isTech ? "High-performance laptop" : "Field service starter set",
        reason: "Critical base asset to deliver reliably from day one.",
        price: Math.round(investment * 0.15),
        percentage: 15,
        offers: [
          {
            platform: "Mercado Libre",
            title: "Pro Series Standard",
            price: Math.round(investment * 0.14),
            rating: 4.6,
            delivery: "2-3 days",
            url: "https://www.mercadolibre.com.ar/",
          },
          {
            platform: "Amazon",
            title: "Business Essentials Prime",
            price: Math.round(investment * 0.16),
            rating: 4.7,
            delivery: "5-7 days",
            url: "https://www.amazon.com/",
          },
          {
            platform: "Alibaba",
            title: "Wholesale Supplier Pack",
            price: Math.round(investment * 0.12),
            rating: 4.4,
            delivery: "15-25 days",
            url: "https://www.alibaba.com/",
          },
        ],
      },
      {
        name: isFood ? "Cold chain containers" : isTech ? "Software stack (annual)" : "Operations software pack",
        reason: "Protects quality, speed, and customer consistency.",
        price: Math.round(investment * 0.1),
        percentage: 10,
        offers: [
          {
            platform: "Mercado Libre",
            title: "Local bestseller option",
            price: Math.round(investment * 0.095),
            rating: 4.5,
            delivery: "1-2 days",
            url: "https://www.mercadolibre.com.ar/",
          },
          {
            platform: "Amazon",
            title: "Top reviewed global option",
            price: Math.round(investment * 0.11),
            rating: 4.8,
            delivery: "5-8 days",
            url: "https://www.amazon.com/",
          },
          {
            platform: "TiendaNube Partners",
            title: "Regional partner bundle",
            price: Math.round(investment * 0.09),
            rating: 4.3,
            delivery: "3-5 days",
            url: "https://www.tiendanube.com/",
          },
        ],
      },
      {
        name: "Brand and launch assets",
        reason: "Needed to build trust and convert early demand.",
        price: Math.round(investment * 0.08),
        percentage: 8,
        offers: [
          {
            platform: "Canva / templates",
            title: "Launch creative pack",
            price: Math.round(investment * 0.06),
            rating: 4.7,
            delivery: "Instant",
            url: "https://www.canva.com/",
          },
          {
            platform: "Fiverr",
            title: "Freelance implementation",
            price: Math.round(investment * 0.09),
            rating: 4.5,
            delivery: "2-5 days",
            url: "https://www.fiverr.com/",
          },
          {
            platform: "Upwork",
            title: "Specialist retainer",
            price: Math.round(investment * 0.1),
            rating: 4.6,
            delivery: "2-6 days",
            url: "https://www.upwork.com/",
          },
        ],
      },
    ],
    operationalReserve: Math.round(investment * (reservePct / 100)),
  }

  const slug = generateSlug(idea) || "dayzero"
  const validationPlan: ValidationStep[] = [
    {
      action: "Interview 10 ideal customers",
      metric: "At least 8 confirm the core pain",
      duration: "Week 1",
    },
    {
      action: "Launch waitlist landing page",
      metric: "100 qualified signups in 14 days",
      duration: "Week 2",
    },
    {
      action: "Run 3-5 paid pilots",
      metric: "At least 2 repeat purchases",
      duration: "Week 3-4",
    },
    {
      action: "Iterate offer and pricing",
      metric: "Gross margin target reached",
      duration: "Week 5-6",
    },
  ]

  const roadmap: RoadmapStep[] = [
    {
      period: "Week 1",
      title: "Legal and foundations",
      actions: [
        "Define legal structure and tax category",
        "Set accounting and invoicing flow",
        "Set baseline pricing and margin guardrails",
      ],
    },
    {
      period: "Week 2",
      title: "Landing and domain sprint",
      actions: [
        "Generate landing page draft from analysis context",
        "Check domain availability and reserve a primary option",
        "Connect a basic analytics pixel and lead form",
      ],
      domainSuggestion: {
        domain: `${slug}.com`,
        available: pseudoRange(`${slug}-com`, 0, 1) > 0.35,
      },
      domainChecks: [
        { domain: `${slug}.com`, available: pseudoRange(`${slug}-com`, 0, 1) > 0.35 },
        { domain: `${slug}.com.ar`, available: pseudoRange(`${slug}-comar`, 0, 1) > 0.25 },
        { domain: `get${slug}.com`, available: pseudoRange(`get-${slug}`, 0, 1) > 0.4 },
      ],
    },
    {
      period: "Month 2",
      title: "Acquisition and proof",
      actions: [
        "Start outbound and referral loops",
        "Track conversion funnel from lead to first sale",
        "Publish social proof from early customers",
      ],
    },
    {
      period: "Month 3-4",
      title: "Scale with control",
      actions: [
        "Automate recurring workflows",
        "Hire only after repeat demand is stable",
        "Expand only in high-score zones from competitor map",
      ],
    },
  ]

  const obstacles: Obstacle[] = [
    {
      severity: "High",
      title: "Weak differentiation in crowded niche",
      description: "Entering with a generic pitch often leads to high acquisition cost and low retention.",
      solution: "Specialize in a narrow, painful use case and price around measurable outcomes.",
      failureCase: {
        startup: "Homejoy",
        reason: "High CAC and low customer retention made unit economics unsustainable.",
        lesson: "Retention and repeat behavior must be validated before scaling marketing spend.",
      },
    },
    {
      severity: "Medium",
      title: "Growth without operational readiness",
      description: "Demand spikes can damage brand when delivery quality is inconsistent.",
      solution: "Gate growth with service-level metrics and capacity thresholds.",
      failureCase: {
        startup: "Webvan",
        reason: "Scaled logistics too early with a cost structure that outpaced demand.",
        lesson: "Operational efficiency should scale with proven local demand.",
      },
    },
    {
      severity: "Medium",
      title: "Ignoring runway and burn discipline",
      description: "Over-investing in non-essential assets can shorten runway before product-market fit.",
      solution: "Protect reserve cash and review burn rate weekly.",
      failureCase: {
        startup: "Quibi",
        reason: "Large upfront spend with weak product-market fit.",
        lesson: "Validate behavior and willingness to pay before heavy production budgets.",
      },
    },
    {
      severity: "Low",
      title: "Over-reliance on one client segment",
      description: "Concentration risk can create sudden revenue drops.",
      solution: "Diversify acquisition channels and segment mix from month one.",
    },
  ]

  return {
    appName,
    input,
    viability,
    competitors,
    clients,
    legalStructure,
    startupKit,
    validationPlan,
    roadmap,
    obstacles,
  }
}
