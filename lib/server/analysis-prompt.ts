import type Anthropic from "@anthropic-ai/sdk"
import type { BusinessInputData } from "@/components/hero-input"
import type { ClaudeAnswer } from "@/lib/server/flow-store"

// ── System prompt (must contain ZERO dynamic content for prompt caching) ──────

export const ANALYSIS_SYSTEM_PROMPT = `Sos un analista senior especializado en startups y negocios del mercado argentino. Generás análisis profundos, realistas y accionables para emprendedores en etapa de lanzamiento.

INSTRUCCIÓN CRÍTICA — BÚSQUEDA WEB OBLIGATORIA:
Tenés acceso a búsqueda web. USALA ACTIVAMENTE para obtener datos reales y actualizados. No uses tu conocimiento de entrenamiento para datos que pueden estar desactualizados (precios, competidores, productos). El análisis debe estar basado en datos reales encontrados en internet.

BÚSQUEDAS QUE DEBÉS HACER ANTES DE GENERAR EL ANÁLISIS:
1. Competidores reales: buscá "[tipo de negocio] [ciudad] Argentina" → encontrá 3-4 empresas/emprendimientos reales que operen en ese mercado
2. Precios del mercado: buscá "[tipo de servicio] precio Argentina 2025" o "cuánto cobra [tipo de negocio] Argentina" → benchmarks reales de precios actuales
3. Productos del kit de inicio: para cada ítem necesario del startup kit, buscá "[nombre del producto] Mercado Libre Argentina" → obtené URLs reales de productos con precios actualizados

REGLAS PARA EL USO DE DATOS REALES:
- Competidores: usá nombres reales de empresas encontrados en búsquedas, no nombres inventados
- Precios y monetización: basá los números en datos reales encontrados, no en estimaciones del entrenamiento
- Startup kit: incluí offers con URLs reales de Mercado Libre u otras tiendas argentinas, encontradas en búsquedas
- Si no encontrás un dato específico, indicalo en el análisis pero no inventes

CONTEXTO DEL MERCADO ARGENTINO:
- Moneda: ARS (pesos argentinos)
- Ciudades principales: Buenos Aires (CABA/GBA), Córdoba, Rosario, Mendoza, Tucumán, Salta
- Marcos legales: Monotributo (hasta ~ARS 8M anuales), SAS (recomendada para startups), SRL, SA
- Plataformas relevantes: Mercado Libre, TiendaNube, Instagram Shopping, WhatsApp Business
- Fintech: Mercado Pago, Ualá, Brubank, Naranja X

REGLAS DE ANÁLISIS:
1. Usá zonas geográficas reales de la ciudad indicada (en Buenos Aires: Palermo, Belgrano, Caballito, Villa Crespo, San Telmo, etc.)
2. Para obstáculos con failureCase: citá startups reales que fallaron por razones similares (Homejoy, Webvan, Fab.com, Zirtual, etc.)
3. El roadmap debe ser específico y accionable, no genérico
4. El appName debe ser creativo y apropiado para el mercado hispano
5. Si no se especificó B2B/B2C, determinalo según la naturaleza del negocio

INSTRUCCIÓN DE RESPUESTA:
Primero hacé las búsquedas necesarias, luego llamá a generate_analysis con el análisis completo basado en datos reales. No respondas con texto libre.`

// ── Web search tool (server-side, Anthropic-managed) ─────────────────────────

export const WEB_SEARCH_TOOL = {
  type: "web_search_20260209",
  name: "web_search",
} as const

// ── Tool definition constant (module-level, never rebuilt per request) ────────

export const ANALYSIS_TOOL_DEFINITION: Anthropic.Tool = {
  name: "generate_analysis",
  description: "Genera un análisis completo de startup para el mercado argentino basado en la idea, ciudad e inversión del usuario.",
  input_schema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Nombre creativo de la app o marca para el emprendimiento. Ej: 'CateringHub', 'MesaFlow', 'NestOps'",
      },
      viability: {
        type: "object",
        properties: {
          marketPotential: {
            type: "number",
            description: "Puntaje de potencial de mercado del 1 al 10",
          },
          competitionLevel: {
            type: "string",
            enum: ["Low", "Medium", "High"],
            description: "Nivel de competencia en el segmento",
          },
          entryBarrier: {
            type: "string",
            enum: ["Low", "Medium", "High"],
            description: "Barrera de entrada al mercado",
          },
          trend: {
            type: "string",
            enum: ["up", "stable", "down"],
            description: "Tendencia del mercado",
          },
          timeToFirstIncome: {
            type: "string",
            description: "Tiempo estimado al primer ingreso. Ej: '3-6 semanas', '2-4 meses'",
          },
          findings: {
            type: "array",
            description: "Hallazgos clave del análisis: oportunidades, precauciones y riesgos",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["opportunity", "caution", "risk"] },
                text: { type: "string", description: "Descripción del hallazgo en español, específica para esta idea" },
              },
              required: ["type", "text"],
            },
          },
          businessModel: {
            type: "object",
            properties: {
              type: { type: "string", description: "Tipo de modelo. Ej: 'B2B SaaS', 'Marketplace', 'Servicios especializados'" },
              description: { type: "string", description: "Descripción del modelo en 1-2 oraciones" },
              revenueStreams: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    percentage: { type: "number", description: "% del revenue total estimado" },
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
              strategy: { type: "string", description: "Descripción de la estrategia de monetización" },
              plans: {
                type: "array",
                description: "3 planes de precio (Starter, Growth, Scale)",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    monthlyPriceArs: { type: "number", description: "Precio mensual en ARS (pesos argentinos 2026)" },
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
            description: "2-3 ideas o startups similares como benchmark",
            items: {
              type: "object",
              properties: {
                idea: { type: "string" },
                market: { type: "string" },
                annualGrowth: { type: "string", description: "Ej: '+22%', '+15%'" },
                traction: { type: "string", description: "Logro o métrica relevante" },
                matchScore: { type: "number", description: "Similitud del 1 al 100" },
              },
              required: ["idea", "market", "annualGrowth", "traction", "matchScore"],
            },
          },
        },
        required: ["marketPotential", "competitionLevel", "entryBarrier", "trend", "timeToFirstIncome", "findings", "businessModel", "monetization", "similarIdeas"],
      },
      competitors: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            description: "4 competidores reales o plausibles para la ciudad indicada",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nombre de empresa real o plausible en Argentina" },
                description: { type: "string" },
                strengths: { type: "array", items: { type: "string" }, description: "3 fortalezas" },
                weaknesses: { type: "array", items: { type: "string" }, description: "3 debilidades" },
                cityArea: { type: "string", description: "Zona/barrio donde opera" },
                marketShare: { type: "string", description: "Ej: '18%', '25%'" },
              },
              required: ["name", "description", "strengths", "weaknesses", "cityArea", "marketShare"],
            },
          },
          launchZones: {
            type: "array",
            description: "4 zonas de la ciudad con análisis de lanzamiento",
            items: {
              type: "object",
              properties: {
                zone: { type: "string", description: "Nombre real del barrio o zona de la ciudad" },
                competitorDensity: { type: "number", description: "Densidad de competidores del 1 al 10" },
                demandSignal: { type: "number", description: "Señal de demanda del 1 al 10" },
                launchScore: { type: "number", description: "Score de lanzamiento del 1 al 10" },
                color: { type: "string", description: "Color hex para el mapa. Verde si launchScore>7.5, amarillo si 5.5-7.5, rojo si <5.5. Ej: '#22c55e', '#f59e0b', '#ef4444'" },
              },
              required: ["zone", "competitorDensity", "demandSignal", "launchScore", "color"],
            },
          },
        },
        required: ["competitors", "launchZones"],
      },
      clients: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["b2b", "b2c"] },
          b2bClients: {
            type: "array",
            description: "Requerido si type es b2b. 3 perfiles de clientes empresa",
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
            description: "Requerido si type es b2c. 3 segmentos de consumidores",
            items: {
              type: "object",
              properties: {
                segment: { type: "string" },
                estimatedSize: { type: "string", description: "Ej: '~90,000 personas en Córdoba'" },
                reachStrategy: { type: "string" },
              },
              required: ["segment", "estimatedSize", "reachStrategy"],
            },
          },
        },
        required: ["type"],
      },
      legalStructure: {
        type: "object",
        properties: {
          structures: {
            type: "array",
            description: "Estructuras legales disponibles con la recomendada marcada",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                recommended: { type: "boolean" },
              },
              required: ["name", "recommended"],
            },
          },
          explanation: { type: "string", description: "Explicación de la recomendación legal" },
          timeline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "number" },
                action: { type: "string" },
              },
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
            description: "Categorías impositivas relevantes con tasas",
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
        required: ["structures", "explanation", "timeline", "taxInfo", "taxCategories"],
      },
      startupKit: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "3 ítems clave del kit de inicio con precio en ARS",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nombre del ítem específico para esta idea" },
                reason: { type: "string", description: "Por qué es crítico para este negocio" },
                price: { type: "number", description: "Precio estimado en ARS basado en búsqueda real" },
                percentage: { type: "number", description: "% del presupuesto total que representa" },
                offers: {
                  type: "array",
                  description: "2-3 opciones reales de compra encontradas en Mercado Libre u otras tiendas argentinas mediante búsqueda web",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string", description: "Nombre de la plataforma. Ej: 'Mercado Libre', 'TiendaNube'" },
                      title: { type: "string", description: "Nombre real del producto encontrado en la búsqueda" },
                      price: { type: "number", description: "Precio en ARS del producto encontrado" },
                      url: { type: "string", description: "URL real del producto tal como fue encontrada en la búsqueda web" },
                      rating: { type: "number", description: "Rating del producto si está disponible" },
                      delivery: { type: "string", description: "Tiempo de entrega si está disponible" },
                    },
                    required: ["platform", "title", "price", "url"],
                  },
                },
              },
              required: ["name", "reason", "price", "percentage"],
            },
          },
        },
        required: ["items"],
      },
      validationPlan: {
        type: "array",
        description: "4 pasos de validación de la idea con métricas claras",
        items: {
          type: "object",
          properties: {
            action: { type: "string" },
            metric: { type: "string", description: "Métrica de éxito medible" },
            duration: { type: "string", description: "Ej: 'Semana 1', 'Semanas 3-4'" },
          },
          required: ["action", "metric", "duration"],
        },
      },
      roadmap: {
        type: "array",
        description: "4 fases del roadmap de lanzamiento",
        items: {
          type: "object",
          properties: {
            period: { type: "string", description: "Ej: 'Semana 1', 'Mes 2', 'Mes 3-4'" },
            title: { type: "string" },
            actions: { type: "array", items: { type: "string" }, description: "3 acciones concretas" },
          },
          required: ["period", "title", "actions"],
        },
      },
      obstacles: {
        type: "array",
        description: "4 obstáculos principales con severidad, solución y caso de fracaso de referencia",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["High", "Medium", "Low"] },
            title: { type: "string" },
            description: { type: "string" },
            solution: { type: "string" },
            failureCase: {
              type: "object",
              description: "Startup real que fracasó por razón similar",
              properties: {
                startup: { type: "string" },
                reason: { type: "string" },
                lesson: { type: "string" },
              },
              required: ["startup", "reason", "lesson"],
            },
          },
          required: ["severity", "title", "description", "solution"],
        },
      },
    },
    required: ["appName", "viability", "competitors", "clients", "legalStructure", "startupKit", "validationPlan", "roadmap", "obstacles"],
  },
}

// ── Per-request message builder ───────────────────────────────────────────────

export function buildAnalysisUserMessage(
  input: BusinessInputData,
  answers: ClaudeAnswer[]
): string {
  const answersText =
    answers.length > 0
      ? answers
          .map(
            (a) =>
              `- ${a.questionId}: "${a.option}"${a.details ? ` — detalle adicional: "${a.details}"` : ""}`
          )
          .join("\n")
      : "No se requirieron preguntas adicionales (la descripción fue suficientemente detallada)."

  return `IDEA DE NEGOCIO A ANALIZAR:
- Descripción: ${input.idea}
- Ciudad: ${input.city || "Buenos Aires"}
- Inversión inicial disponible: ARS ${input.investment.toLocaleString("es-AR")}

INFORMACIÓN ADICIONAL DEL FUNDADOR:
${answersText}

Generá un análisis completo, específico y accionable para esta idea. Para cualquier aspecto no especificado explícitamente (tipo de cliente, precios, modelo de ingresos, zonas, etc.), hacé vos la mejor recomendación basada en tu conocimiento del mercado argentino 2026. Actuá como consultor experto: recomendá, no esperes que el fundador lo resuelva todo.`
}
