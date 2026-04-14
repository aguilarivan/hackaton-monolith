import type { BusinessInputData } from "@/components/hero-input"
import type { ClaudeAnswer } from "@/lib/flow-storage"

// All possible analysis section keys (must stay in sync with dashboard SectionKey)
export const ALL_SECTION_KEYS = [
  "viability",
  "monetization",
  "competitors",
  "clients",
  "legal",
  "kit",
  "roadmap",
  "obstacles",
] as const

export type AnalysisSectionKey = (typeof ALL_SECTION_KEYS)[number]

export interface SectionPlanEntry {
  enabled: boolean
  subsections: string[]
}

/** All possible subsections per section — must match the actual cards/blocks rendered in components/dashboard/ */
export const SECTION_SUBSECTIONS: Record<AnalysisSectionKey, string[]> = {
  viability: ["potencial de mercado", "señales de mercado", "ideas exitosas similares"],
  monetization: ["modelo de negocio", "planes de precios", "benchmark de competidores"],
  competitors: ["análisis de competidores", "mapa de zonas de lanzamiento"],
  clients: ["clientes B2B", "segmentos B2C"],
  legal: ["estructura societaria", "simulador de impuestos", "obligaciones fiscales y trámites"],
  kit: ["distribución del presupuesto", "productos y herramientas", "reserva operativa"],
  roadmap: ["plan de validación", "herramientas de lanzamiento", "roadmap por fases"],
  obstacles: ["riesgos y soluciones", "casos de fracaso de referencia"],
}

export type SectionPlan = Record<AnalysisSectionKey, SectionPlanEntry>

// ── System prompt — Spanish (static — cacheable) ────────────────────────────

const SECTION_PLAN_SYSTEM_PROMPT_ES = `Sos un asesor de startups argentino. Tu tarea es evaluar rápidamente qué secciones de un análisis de negocio son relevantes para una idea específica.

Las secciones posibles y sus subsecciones son:

1. **viability** — Potencial de mercado
   Subsecciones: "potencial de mercado" (score, competencia, barrera de entrada, findings), "señales de mercado" (señales de fuentes con gráficos de tendencia), "ideas exitosas similares" (ideas comparables con % de match)

2. **monetization** — Monetización
   Subsecciones: "modelo de negocio" (tipo, revenue streams con gráfico), "planes de precios" (3 tiers: starter/growth/scale con precios ARS), "benchmark de competidores" (rango de precios del mercado)

3. **competitors** — Competidores (de la ciudad para ideas físicas, de internet para ideas online)
   Subsecciones: "análisis de competidores" (lista con fortalezas y debilidades), "mapa de zonas de lanzamiento" (mapa interactivo con zonas de oportunidad)

4. **clients** — Clientes
   Subsecciones: "clientes B2B" (empresas específicas con generador de email de contacto), "segmentos B2C" (segmentos de consumidores con generador de mensajes)
   Nota: elegí B2B o B2C según la idea, no ambos.

5. **legal** — Legal e impuestos
   Subsecciones: "estructura societaria" (estructuras recomendadas + timeline de evolución), "simulador de impuestos" (calculadora interactiva de cargas fiscales), "obligaciones fiscales y trámites" (estimaciones + links a trámites oficiales)

6. **kit** — Kit de inicio
   Subsecciones: "distribución del presupuesto" (gráfico de barras con categorías), "productos y herramientas" (items esenciales con ofertas y precios reales), "reserva operativa" (monto de reserva recomendado)

7. **roadmap** — Roadmap de lanzamiento
   Subsecciones: "plan de validación" (pasos numerados con métricas de éxito), "herramientas de lanzamiento" (generador de landing page y checker de dominios), "roadmap por fases" (timeline visual con acciones por fase)

8. **obstacles** — Obstáculos y riesgos
   Subsecciones: "riesgos y soluciones" (riesgos por severidad con plan de mitigación), "casos de fracaso de referencia" (startups que fallaron con lecciones aprendidas)

═══ CRITERIOS DE EXCLUSIÓN ═══

Deshabilitá una sección SOLO si es claramente irrelevante o inaplicable:

- **competitors**: Desactivar si la idea es tan novedosa que no existen competidores directos ni indirectos en Argentina (extremadamente raro).
- **kit**: Desactivar si es un servicio puramente intelectual/consultoría individual sin ningún equipamiento, software ni infraestructura necesaria.
- **legal**: Desactivar solo si el usuario explícitamente indicó que ya tiene la estructura legal resuelta.
- **monetization**: Desactivar si es un proyecto sin fines de lucro o puramente social.
- **roadmap**: Casi nunca desactivar — todo negocio necesita un plan de lanzamiento.
- **viability**: NUNCA desactivar.
- **clients**: NUNCA desactivar.
- **obstacles**: NUNCA desactivar.

En caso de duda, HABILITÁ la sección. Es mejor analizar de más que de menos.

═══ FORMATO ═══

Devolvé ÚNICAMENTE un objeto JSON válido (sin texto antes ni después).

Para cada sección:
- "enabled": true/false — si la sección aplica a la idea
- "subsections": array con las subsecciones relevantes (elegí del catálogo de arriba, solo las que aplican)

Si una sección tiene enabled: false, dejá subsections como array vacío [].
Si una sección tiene enabled: true, incluí al menos una subsección.

Ejemplo (consultora digital individual):

{
  "viability": { "enabled": true, "subsections": ["potencial de mercado", "señales de mercado", "ideas exitosas similares"] },
  "monetization": { "enabled": true, "subsections": ["modelo de negocio", "planes de precios", "benchmark de competidores"] },
  "competitors": { "enabled": true, "subsections": ["análisis de competidores"] },
  "clients": { "enabled": true, "subsections": ["clientes B2B"] },
  "legal": { "enabled": true, "subsections": ["estructura societaria", "obligaciones fiscales y trámites"] },
  "kit": { "enabled": false, "subsections": [] },
  "roadmap": { "enabled": true, "subsections": ["plan de validación", "roadmap por fases"] },
  "obstacles": { "enabled": true, "subsections": ["riesgos y soluciones"] }
}`

// ── System prompt — English (static — cacheable) ────────────────────────────

const SECTION_PLAN_SYSTEM_PROMPT_EN = `You are an Argentine startup advisor. Your task is to quickly evaluate which sections of a business analysis are relevant for a specific idea.

The possible sections and their subsections are:

1. **viability** — Market potential
   Subsections: "potencial de mercado" (score, competition, entry barrier, findings), "señales de mercado" (source signals with trend charts), "ideas exitosas similares" (comparable ideas with match %)

2. **monetization** — Monetization
   Subsections: "modelo de negocio" (type, revenue streams with chart), "planes de precios" (3 tiers: starter/growth/scale with ARS prices), "benchmark de competidores" (market price range)

3. **competitors** — Competitors (from the city for physical ideas, from the internet for online ideas)
   Subsections: "análisis de competidores" (list with strengths and weaknesses), "mapa de zonas de lanzamiento" (interactive map with opportunity zones)

4. **clients** — Customers
   Subsections: "clientes B2B" (specific companies with contact email generator), "segmentos B2C" (consumer segments with message generator)
   Note: choose B2B or B2C based on the idea, not both.

5. **legal** — Legal and taxes
   Subsections: "estructura societaria" (recommended structures + evolution timeline), "simulador de impuestos" (interactive tax burden calculator), "obligaciones fiscales y trámites" (estimates + links to official procedures)

6. **kit** — Starter kit
   Subsections: "distribución del presupuesto" (bar chart with categories), "productos y herramientas" (essential items with real offers and prices), "reserva operativa" (recommended reserve amount)

7. **roadmap** — Launch roadmap
   Subsections: "plan de validación" (numbered steps with success metrics), "herramientas de lanzamiento" (landing page generator and domain checker), "roadmap por fases" (visual timeline with actions per phase)

8. **obstacles** — Obstacles and risks
   Subsections: "riesgos y soluciones" (risks by severity with mitigation plan), "casos de fracaso de referencia" (startups that failed with lessons learned)

=== EXCLUSION CRITERIA ===

Disable a section ONLY if it is clearly irrelevant or inapplicable:

- **competitors**: Disable if the idea is so novel that no direct or indirect competitors exist in Argentina (extremely rare).
- **kit**: Disable if it is a purely intellectual service/individual consulting with no equipment, software, or infrastructure needed.
- **legal**: Disable only if the user explicitly indicated the legal structure is already resolved.
- **monetization**: Disable if it is a non-profit or purely social project.
- **roadmap**: Almost never disable — every business needs a launch plan.
- **viability**: NEVER disable.
- **clients**: NEVER disable.
- **obstacles**: NEVER disable.

When in doubt, ENABLE the section. It is better to over-analyze than under-analyze.

=== FORMAT ===

Return ONLY a valid JSON object (no text before or after).

For each section:
- "enabled": true/false — whether the section applies to the idea
- "subsections": array with the relevant subsections (choose from the catalog above, only those that apply)

If a section has enabled: false, leave subsections as an empty array [].
If a section has enabled: true, include at least one subsection.

Example (individual digital consulting):

{
  "viability": { "enabled": true, "subsections": ["potencial de mercado", "señales de mercado", "ideas exitosas similares"] },
  "monetization": { "enabled": true, "subsections": ["modelo de negocio", "planes de precios", "benchmark de competidores"] },
  "competitors": { "enabled": true, "subsections": ["análisis de competidores"] },
  "clients": { "enabled": true, "subsections": ["clientes B2B"] },
  "legal": { "enabled": true, "subsections": ["estructura societaria", "obligaciones fiscales y trámites"] },
  "kit": { "enabled": false, "subsections": [] },
  "roadmap": { "enabled": true, "subsections": ["plan de validación", "roadmap por fases"] },
  "obstacles": { "enabled": true, "subsections": ["riesgos y soluciones"] }
}`

// ── System prompt selector ───────────────────────────────────────────────────

export function getSectionPlanSystemPrompt(locale: string): string {
  return locale === "en" ? SECTION_PLAN_SYSTEM_PROMPT_EN : SECTION_PLAN_SYSTEM_PROMPT_ES
}

/** @deprecated Use getSectionPlanSystemPrompt(locale) instead */
export const SECTION_PLAN_SYSTEM_PROMPT = SECTION_PLAN_SYSTEM_PROMPT_ES

// ── Per-request message builder ──────────────────────────────────────────────

export function buildSectionPlanUserMessage(
  input: BusinessInputData,
  answers: ClaudeAnswer[],
  locale: string = "es"
): string {
  if (locale === "en") {
    const lines = [`- Idea: ${input.idea}`]
    if (input.city) lines.push(`- City: ${input.city}`)
    if (input.investment) lines.push(`- Initial investment: ARS ${input.investment.toLocaleString("es-AR")}`)
    if (input.brandName) lines.push(`- Brand: ${input.brandName}`)
    if (input.businessType) lines.push(`- Type: ${input.businessType}`)

    const answersText =
      answers.length > 0
        ? answers
            .map(
              (a) =>
                `- ${a.questionId}: "${a.option}"${a.details ? ` — ${a.details}` : ""}`
            )
            .join("\n")
        : "(no additional questions)"

    return `BUSINESS INFORMATION:
${lines.join("\n")}

FOUNDER'S ANSWERS:
${answersText}

Evaluate which analysis sections apply to this idea. Return ONLY the JSON.`
  }

  const lines = [`- Idea: ${input.idea}`]
  if (input.city) lines.push(`- Ciudad: ${input.city}`)
  if (input.investment) lines.push(`- Inversión inicial: ARS ${input.investment.toLocaleString("es-AR")}`)
  if (input.brandName) lines.push(`- Marca: ${input.brandName}`)
  if (input.businessType) lines.push(`- Tipo: ${input.businessType}`)

  const answersText =
    answers.length > 0
      ? answers
          .map(
            (a) =>
              `- ${a.questionId}: "${a.option}"${a.details ? ` — ${a.details}` : ""}`
          )
          .join("\n")
      : "(sin preguntas adicionales)"

  return `INFORMACIÓN DEL NEGOCIO:
${lines.join("\n")}

RESPUESTAS DEL FUNDADOR:
${answersText}

Evaluá qué secciones del análisis aplican para esta idea. Devolvé SOLO el JSON.`
}
