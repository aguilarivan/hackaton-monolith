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
  url?: string
  sourceQuery?: string
  location?: {
    lat: number
    lng: number
  }
}

export interface CompetitorData {
  competitors: Competitor[]
  mapCenter: {
    lat: number
    lng: number
  }
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
  const periods = ["M-5", "M-4", "M-3", "M-2", "M-1", "Ahora"]
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
  const { idea, city } = input
  const investment = input.investment ?? 500000
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
        type: "Servicio + Producto Híbrido",
        description: "Ingresos por catering corporativo recurrente y menús de eventos con alto margen.",
        revenueStreams: [
          { name: "Planes corporativos", percentage: 55, description: "Planes semanales de comida para oficinas." },
          { name: "Eventos", percentage: 30, description: "Eventos puntuales y activaciones de marca." },
          { name: "Pedidos a demanda", percentage: 15, description: "Ventas directas y por app." },
        ],
      }
    : isTech
    ? {
        type: "SaaS B2B",
        description: "Software por suscripción con upsell de implementación y contratos anuales.",
        revenueStreams: [
          { name: "Suscripciones mensuales", percentage: 65, description: "Planes escalonados por usuarios o uso." },
          { name: "Contratos anuales enterprise", percentage: 25, description: "Contratos anuales con descuento y SLA." },
          { name: "Implementación", percentage: 10, description: "Onboarding, capacitación y setup personalizado." },
        ],
      }
    : {
        type: "Servicios Especializados",
        description: "Entrega basada en proyectos con retainers recurrentes una vez construida la confianza.",
        revenueStreams: [
          { name: "Proyectos", percentage: 50, description: "Entrega con alcance definido." },
          { name: "Retainers", percentage: 35, description: "Acuerdos de servicio recurrente." },
          { name: "Asesoramiento", percentage: 15, description: "Consultoría y optimización." },
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
      "Monetización escalonada con un plan de entrada accesible, un plan central enfocado en margen, y un tier premium para maximizar el ingreso promedio por cuenta.",
    plans: [
      {
        name: "Inicial",
        monthlyPriceArs: Math.round((anchorPrice * 0.68) / 500) * 500,
        target: isTech ? "Equipos chicos" : isFood ? "PyMEs con pedidos recurrentes básicos" : "Clientes iniciales, ticket bajo",
        rationale: "Precio de entrada diseñado para acelerar adquisición sin debilitar el posicionamiento de marca.",
      },
      {
        name: "Crecimiento",
        monthlyPriceArs: anchorPrice,
        target: isTech ? "PyMEs en crecimiento" : isFood ? "Oficinas medianas con frecuencia semanal" : "Clientes recurrentes con mayor volumen",
        rationale: "Plan central recomendado: equilibra competitividad y margen operativo.",
      },
      {
        name: "Escala",
        monthlyPriceArs: Math.round((anchorPrice * 1.52) / 500) * 500,
        target: isTech ? "Cuentas enterprise" : isFood ? "Clientes corporativos y eventos premium" : "Cuentas de alta demanda con requerimientos de SLA",
        rationale: "Captura valor en segmentos con menor sensibilidad al precio.",
      },
    ],
    benchmark: {
      lowArs: Math.round((anchorPrice * 0.8) / 500) * 500,
      medianArs: Math.round((anchorPrice * 1.03) / 500) * 500,
      highArs: Math.round((anchorPrice * 1.37) / 500) * 500,
      note: `Rango estimado basado en competencia ${competitionLevel === "Low" ? "baja" : competitionLevel === "Medium" ? "moderada" : "alta"} y tendencia ${trend === "up" ? "alcista" : trend === "stable" ? "estable" : "bajista"}.`,
    },
  }

  const sourceSignals: MarketSignal[] = [
    {
      source: "Google Trends / Serp snapshot",
      metric: "Impulso de demanda",
      value: `${trendsScore}/100`,
      scoreImpact: Number((trendsScore / 12).toFixed(1)),
      trend: trendsScore > 72 ? "up" : trendsScore > 58 ? "stable" : "down",
      history: buildSignalHistory(Number((trendsScore / 12).toFixed(1)), `${idea}-trends-history`, trendsScore > 72 ? "up" : trendsScore > 58 ? "stable" : "down"),
      lastUpdated: "2026-04-12",
      url: "https://trends.google.com/",
    },
    {
      source: "Mercado Libre API pública",
      metric: "Publicaciones activas",
      value: `${meliListings.toLocaleString("es-AR")} publicaciones`,
      scoreImpact: Number((Math.min(meliListings / 900, 3.3)).toFixed(1)),
      trend: meliListings > 1800 ? "up" : meliListings > 900 ? "stable" : "down",
      history: buildSignalHistory(Number((Math.min(meliListings / 900, 3.3)).toFixed(1)), `${idea}-meli-history`, meliListings > 1800 ? "up" : meliListings > 900 ? "stable" : "down"),
      lastUpdated: "2026-04-12",
      url: "https://developers.mercadolibre.com.ar/",
    },
    {
      source: "INDEC estimación sectorial",
      metric: "Crecimiento interanual del sector",
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
          idea: "Nubity (automatización B2B)",
          market: "PyMEs LATAM",
          annualGrowth: "+29%",
          traction: "Alcanzó 500 cuentas pagas en 14 meses",
          matchScore: 86,
        },
        {
          idea: "Herramientas estilo Mural para workflows",
          market: "Colaboración remota",
          annualGrowth: "+18%",
          traction: "Escaló con crecimiento liderado por producto",
          matchScore: 79,
        },
      ]
    : isFood
    ? [
        {
          idea: "Cocina de Barrio",
          market: "Catering corporativo urbano",
          annualGrowth: "+21%",
          traction: "De 8 a 60 clientes corporativos recurrentes",
          matchScore: 82,
        },
        {
          idea: "Suscripciones de almuerzo saludable",
          market: "Bienestar corporativo",
          annualGrowth: "+17%",
          traction: "Se asoció con 3 cadenas de coworking",
          matchScore: 76,
        },
      ]
    : [
        {
          idea: "UrbanFix Services",
          market: "Servicios para el hogar a demanda",
          annualGrowth: "+16%",
          traction: "Escaló con referidos locales",
          matchScore: 78,
        },
        {
          idea: "ProAssist B2B",
          market: "Operaciones PyME",
          annualGrowth: "+14%",
          traction: "Fuerte base de contratos recurrentes",
          matchScore: 74,
        },
      ]

  const viability: ViabilityData = {
    marketPotential: dynamicMarketScore,
    competitionLevel,
    entryBarrier,
    trend,
    timeToFirstIncome: isTech ? "6-10 semanas" : isFood ? "2-4 semanas" : "3-6 semanas",
    findings: [
      {
        type: "opportunity",
        text: `Las señales de búsqueda y publicaciones muestran demanda sostenida para esta categoría en ${normalizedCity}.`,
      },
      {
        type: "opportunity",
        text: `Con ${investment.toLocaleString("es-AR")} ARS, los primeros 90 días son financieramente viables con burn controlado.`,
      },
      {
        type: "caution",
        text: `Ideas comparables exitosas puntúan ${similarIdeasStrength}/100 en similitud, pero el posicionamiento debe ser más afilado que los competidores locales.`,
      },
      {
        type: "risk",
        text: "La adquisición inicial de clientes puede estancarse sin un nicho claro y un canal de llegada repetible.",
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
        description: "Incumbente bien posicionado con fuerte reconocimiento de marca.",
        strengths: ["Distribución", "Clientes recurrentes", "Disciplina operativa"],
        weaknesses: ["Precios altos", "Personalización lenta", "Paquetes rígidos"],
        cityArea: "Microcentro",
        marketShare: "24%",
        location: competitorLocations[0],
      },
      {
        name: isTech ? "FlowPilot" : isFood ? "DailyFork" : "FastHands",
        description: "Challenger de rápido crecimiento enfocado en conveniencia.",
        strengths: ["Velocidad", "UX moderna", "Fuerte presencia en redes"],
        weaknesses: ["Brechas en soporte", "Calidad variable", "Riesgo de quema de caja"],
        cityArea: "Corredor norte",
        marketShare: "16%",
        location: competitorLocations[1],
      },
      {
        name: isTech ? "LegacySuite" : isFood ? "Tradizione Eventos" : "MasterLocal",
        description: "Operador tradicional con cuentas de larga data.",
        strengths: ["Relaciones", "Experiencia", "Contratos grandes"],
        weaknesses: ["Stack desactualizado", "Funnel digital débil", "Onboarding lento"],
        cityArea: "Centro histórico",
        marketShare: "19%",
        location: competitorLocations[2],
      },
      {
        name: isTech ? "NicheCloud" : isFood ? "GreenBite Co" : "HomePro Plus",
        description: "Especialista de nicho con clientela selecta.",
        strengths: ["Especialización", "Percepción premium", "Alta retención"],
        weaknesses: ["Escala limitada", "Segmento estrecho", "CAC elevado"],
        cityArea: "Zona residencial oeste",
        marketShare: "11%",
        location: competitorLocations[3],
      },
    ],
    mapCenter: center,
  }

  const clients: ClientData = isB2B
    ? {
        type: "b2b",
        b2bClients: [
          {
            name: `Oficinas tech en ${normalizedCity}`,
            reason: "Demanda recurrente y presupuesto asignado para productividad y experiencia de empleados.",
            approach: "Intro cálida + llamada diagnóstica de 20 min + propuesta de piloto.",
            contactRole: "Gerente de Operaciones",
            companyContext: "Ciclos de decisión rápidos y expectativas claras de ROI.",
          },
          {
            name: "Estudios de servicios profesionales",
            reason: "Necesitan calidad confiable y proveedores seguros para su reputación.",
            approach: "Outreach basado en cuentas con un pitch enfocado en cumplimiento.",
            contactRole: "Socio / Responsable administrativo",
            companyContext: "Aversos al riesgo, pero alto lifetime value una vez que entran.",
          },
          {
            name: "Operadores de coworking",
            reason: "Necesitan experiencia diferenciada para sus miembros y reducir churn.",
            approach: "Ofrecer piloto co-brandeado para una sede.",
            contactRole: "Community Manager",
            companyContext: "Abiertos a experimentar con pilotos rápidos.",
          },
        ],
      }
    : {
        type: "b2c",
        b2cSegments: [
          {
            segment: "Jóvenes profesionales (25-40)",
            estimatedSize: `~110.000 personas en ${normalizedCity}`,
            reachStrategy: "Instagram + reseñas en Google Maps + boca en boca.",
          },
          {
            segment: "Familias con hijos",
            estimatedSize: `~82.000 hogares en ${normalizedCity}`,
            reachStrategy: "Grupos de Facebook + campañas de WhatsApp.",
          },
          {
            segment: "Adultos mayores independientes",
            estimatedSize: `~42.000 personas en ${normalizedCity}`,
            reachStrategy: "Alianzas locales y comunicación basada en confianza.",
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
        ? "Monotributo es práctico para arrancar liviano. Mantené los costos fijos bajos y migra cuando la facturación se acerque al tope de la categoría."
        : "La SAS equilibra protección legal y agilidad operativa. Suele ser el mejor camino para operaciones escalables.",
    timeline: [
      { month: 1, action: "Inscribir categoría impositiva y abrir entidad legal si es necesario" },
      { month: 2, action: "Configurar facturación, contratos y controles contables" },
      { month: 6, action: "Reevaluar categoría según facturación mensual real" },
    ],
    taxInfo:
      investment < 1200000
        ? {
            regime: "Régimen Simplificado (Monotributo)",
            monthlyEstimate: "ARS 42.000 - 95.000",
            annualEstimate: "ARS 504.000 - 1.140.000",
            benefits: [
              "Pago mensual único",
              "Menor complejidad administrativa",
              "Planificación de caja predecible",
              "Alta rápida e inicial",
            ],
          }
        : {
            regime: "Régimen General (Responsable Inscripto)",
            monthlyEstimate: "IVA + Ganancias + Cargas sociales",
            annualEstimate: "Depende del margen y la facturación",
            benefits: [
              "Sin topes de facturación",
              "Gastos operativos deducibles",
              "Apto para crecimiento e inversores",
              "Perfil legal más robusto",
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
        label: "AFIP — Inscripción impositiva",
        url: "https://www.afip.gob.ar/",
        description: "Iniciar o actualizar tu situación fiscal y facturación.",
      },
      {
        label: "TAD — Trámites de entidad legal",
        url: "https://tramitesadistancia.gob.ar/",
        description: "Constitución de sociedad y trámites legales administrativos online.",
      },
      {
        label: "IGJ — Registros societarios",
        url: "https://www.argentina.gob.ar/justicia/igj",
        description: "Registro societario y guía de formalización legal.",
      },
    ],
  }

  const equipmentPct = isFood ? 38 : isTech ? 22 : 34
  const stockPct = isFood ? 22 : isTech ? 8 : 16
  const marketingPct = 20
  const reservePct = 100 - equipmentPct - stockPct - marketingPct

  const startupKit: StartupKitData = {
    budgetDistribution: [
      { category: "Equipamiento", percentage: equipmentPct, color: "var(--section-kit)" },
      { category: "Stock inicial", percentage: stockPct, color: "var(--section-clients)" },
      { category: "Marketing", percentage: marketingPct, color: "var(--section-roadmap)" },
      { category: "Reserva", percentage: reservePct, color: "var(--section-viability)" },
    ],
    items: [
      {
        name: isFood ? "Horno de convección comercial" : isTech ? "Notebook de alto rendimiento" : "Kit inicial de servicio en campo",
        reason: "Activo base crítico para entregar confiablemente desde el día uno.",
        price: Math.round(investment * 0.15),
        percentage: 15,
        offers: [
          {
            platform: "Mercado Libre",
            title: "Serie Pro Estándar",
            price: Math.round(investment * 0.14),
            rating: 4.6,
            delivery: "2-3 días",
            url: "https://www.mercadolibre.com.ar/",
          },
          {
            platform: "Amazon",
            title: "Business Essentials Prime",
            price: Math.round(investment * 0.16),
            rating: 4.7,
            delivery: "5-7 días",
            url: "https://www.amazon.com/",
          },
          {
            platform: "Alibaba",
            title: "Pack mayorista",
            price: Math.round(investment * 0.12),
            rating: 4.4,
            delivery: "15-25 días",
            url: "https://www.alibaba.com/",
          },
        ],
      },
      {
        name: isFood ? "Contenedores de cadena de frío" : isTech ? "Stack de software (anual)" : "Pack de software operativo",
        reason: "Protege calidad, velocidad y consistencia para el cliente.",
        price: Math.round(investment * 0.1),
        percentage: 10,
        offers: [
          {
            platform: "Mercado Libre",
            title: "Opción más vendida local",
            price: Math.round(investment * 0.095),
            rating: 4.5,
            delivery: "1-2 días",
            url: "https://www.mercadolibre.com.ar/",
          },
          {
            platform: "Amazon",
            title: "Opción global mejor reseñada",
            price: Math.round(investment * 0.11),
            rating: 4.8,
            delivery: "5-8 días",
            url: "https://www.amazon.com/",
          },
          {
            platform: "TiendaNube Partners",
            title: "Bundle de socio regional",
            price: Math.round(investment * 0.09),
            rating: 4.3,
            delivery: "3-5 días",
            url: "https://www.tiendanube.com/",
          },
        ],
      },
      {
        name: "Activos de marca y lanzamiento",
        reason: "Necesarios para generar confianza y convertir demanda temprana.",
        price: Math.round(investment * 0.08),
        percentage: 8,
        offers: [
          {
            platform: "Canva / plantillas",
            title: "Pack creativo de lanzamiento",
            price: Math.round(investment * 0.06),
            rating: 4.7,
            delivery: "Inmediato",
            url: "https://www.canva.com/",
          },
          {
            platform: "Fiverr",
            title: "Implementación freelance",
            price: Math.round(investment * 0.09),
            rating: 4.5,
            delivery: "2-5 días",
            url: "https://www.fiverr.com/",
          },
          {
            platform: "Upwork",
            title: "Retainer con especialista",
            price: Math.round(investment * 0.1),
            rating: 4.6,
            delivery: "2-6 días",
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
      action: "Entrevistar a 10 clientes ideales",
      metric: "Al menos 8 confirman el dolor principal",
      duration: "Semana 1",
    },
    {
      action: "Lanzar página de lista de espera",
      metric: "100 registros calificados en 14 días",
      duration: "Semana 2",
    },
    {
      action: "Correr 3-5 pilotos pagos",
      metric: "Al menos 2 recompras",
      duration: "Semana 3-4",
    },
    {
      action: "Iterar oferta y pricing",
      metric: "Margen bruto objetivo alcanzado",
      duration: "Semana 5-6",
    },
  ]

  const roadmap: RoadmapStep[] = [
    {
      period: "Semana 1",
      title: "Legales y fundaciones",
      actions: [
        "Definir estructura legal y categoría impositiva",
        "Configurar facturación, contratos y controles contables",
        "Establecer precios base y guardarraíles de margen",
      ],
    },
    {
      period: "Semana 2",
      title: "Página y dominio sprint",
      actions: [
        "Generar borrador de página desde el contexto del análisis",
        "Verificar disponibilidad de dominio y reservar opción principal",
        "Conectar pixel de analytics básico y formulario de leads",
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
      period: "Mes 2",
      title: "Adquisición y prueba",
      actions: [
        "Iniciar outbound y circuitos de referidos",
        "Trackear el funnel de conversión desde lead hasta primera venta",
        "Publicar prueba social de clientes tempranos",
      ],
    },
    {
      period: "Mes 3-4",
      title: "Escalar con control",
      actions: [
        "Automatizar workflows recurrentes",
        "Contratar solo cuando la demanda repetida sea estable",
        "Expandir solo en zonas de alto puntaje del mapa de competidores",
      ],
    },
  ]

  const obstacles: Obstacle[] = [
    {
      severity: "High",
      title: "Diferenciación débil en nicho saturado",
      description: "Entrar con un pitch genérico suele llevar a alto costo de adquisición y baja retención.",
      solution: "Especializate en un caso de uso estrecho y doloroso, y ponele precio en base a resultados medibles.",
      failureCase: {
        startup: "Homejoy",
        reason: "Alto CAC y baja retención de clientes hicieron insostenible la unit economics.",
        lesson: "La retención y el comportamiento de recompra deben validarse antes de escalar el gasto en marketing.",
      },
    },
    {
      severity: "Medium",
      title: "Crecimiento sin preparación operativa",
      description: "Los picos de demanda pueden dañar la marca cuando la calidad de entrega es inconsistente.",
      solution: "Limitar el crecimiento con métricas de nivel de servicio y umbrales de capacidad.",
      failureCase: {
        startup: "Webvan",
        reason: "Escaló logística demasiado temprano con una estructura de costos que superó la demanda.",
        lesson: "La eficiencia operativa debe escalar con demanda local comprobada.",
      },
    },
    {
      severity: "Medium",
      title: "Ignorar runway y disciplina de burn",
      description: "Sobre-invertir en activos no esenciales puede acortar el runway antes del product-market fit.",
      solution: "Proteger la caja de reserva y revisar el burn rate semanalmente.",
      failureCase: {
        startup: "Quibi",
        reason: "Gasto inicial grande con product-market fit débil.",
        lesson: "Validar comportamiento y disposición a pagar antes de presupuestos grandes de producción.",
      },
    },
    {
      severity: "Low",
      title: "Dependencia excesiva de un solo segmento de clientes",
      description: "El riesgo de concentración puede generar caídas repentinas de ingresos.",
      solution: "Diversificar canales de adquisición y mix de segmentos desde el mes uno.",
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
