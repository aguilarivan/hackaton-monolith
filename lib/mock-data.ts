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
  const isB2B = /business|corporate|b2b|empresa/.test(lowerIdea) || isTech || isFood

  // Fallback defaults — real marketPotential comes from web search signals
  const dynamicMarketScore = 5
  const competitionLevel: "Low" | "Medium" | "High" = "Medium"
  const entryBarrier: "Low" | "Medium" | "High" = isTech ? "Medium" : "Low"
  const trend: "up" | "stable" | "down" = "stable"

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
  const growthFactor = 1.05 // fallback 5% growth
  const growthData: GrowthData[] = [
    { year: currentYear - 3, revenue: Number((baseRevenue * 0.78).toFixed(1)) },
    { year: currentYear - 2, revenue: Number((baseRevenue * 0.93).toFixed(1)) },
    { year: currentYear - 1, revenue: Number((baseRevenue * 1.08).toFixed(1)) },
    { year: currentYear, revenue: Number((baseRevenue * 1.22).toFixed(1)) },
    { year: currentYear + 1, revenue: Number((baseRevenue * 1.22 * growthFactor).toFixed(1)), projected: true },
    { year: currentYear + 2, revenue: Number((baseRevenue * 1.22 * growthFactor * 1.18).toFixed(1)), projected: true },
  ]

  const baseMonthlyPrice = isFood ? 98000 : isTech ? 76000 : 68000
  const anchorPrice = Math.round(baseMonthlyPrice / 500) * 500

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
      note: "Rango estimado basado en el mercado argentino.",
    },
  }

  // Real sourceSignals are fetched via web search at runtime; mock provides empty fallback
  const sourceSignals: MarketSignal[] = []

  // Real similarIdeas are fetched via web search at runtime; mock provides empty fallback
  const similarIdeas: SimilarIdeaBenchmark[] = []

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
        text: `El posicionamiento debe ser más afilado que los competidores locales para capturar mercado.`,
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

  const center = getMapCenter(normalizedCity)

  const competitors: CompetitorData = {
    competitors: [],
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
