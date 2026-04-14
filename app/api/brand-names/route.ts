import { apiError, apiSuccess, parseJsonBody } from "@/lib/server/api-response"
import { generateBrandNames } from "@/lib/server/brand-name-generator"
import type { BusinessInputData } from "@/components/hero-input"

function isBusinessInput(v: unknown): v is BusinessInputData {
  if (!v || typeof v !== "object") return false
  const p = v as Record<string, unknown>
  return typeof p.idea === "string" && typeof p.city === "string" && typeof p.investment === "number"
}

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as { businessInput?: unknown }

    if (!isBusinessInput(body.businessInput)) {
      return apiError({ status: 400, code: "BAD_REQUEST", message: "businessInput is required" })
    }

    const names = generateBrandNames(body.businessInput)
    return apiSuccess({ names })
  } catch {
    return apiError({ status: 500, code: "INTERNAL_ERROR", message: "No se pudieron generar sugerencias" })
  }
}
