import { cookies } from "next/headers"
import { apiError, apiSuccess } from "@/lib/server/api-response"
import { extractBearerToken, verifyToken } from "@/lib/server/auth"

export async function GET(request: Request) {
  // Try Authorization header first, then fall back to httpOnly cookie
  const bearerToken = extractBearerToken(request.headers.get("Authorization"))
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get("auth_token")?.value
  const token = bearerToken ?? cookieToken

  if (!token) {
    return apiError({ status: 401, code: "UNAUTHORIZED", message: "Token no proporcionado." })
  }

  try {
    const payload = await verifyToken(token)
    return apiSuccess({ user: { id: payload.sub, email: payload.email, name: payload.name } })
  } catch {
    return apiError({ status: 401, code: "UNAUTHORIZED", message: "Token inválido o expirado." })
  }
}
