import { NextResponse } from "next/server"
import { apiError, parseJsonBody } from "@/lib/server/api-response"
import { findUserByEmail, validatePassword } from "@/lib/server/user-store"
import { signToken } from "@/lib/server/auth"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await parseJsonBody(request)
  } catch {
    return apiError({ status: 400, code: "BAD_REQUEST", message: "Cuerpo de solicitud inválido." })
  }

  const { email, password } = body as Record<string, unknown>

  if (typeof email !== "string" || !email.trim()) {
    return apiError({ status: 400, code: "BAD_REQUEST", message: "El email es requerido." })
  }
  if (typeof password !== "string" || !password) {
    return apiError({ status: 400, code: "BAD_REQUEST", message: "La contraseña es requerida." })
  }

  const user = await findUserByEmail(email)
  if (!user || !(await validatePassword(user, password))) {
    return apiError({ status: 401, code: "UNAUTHORIZED", message: "Email o contraseña incorrectos." })
  }

  const token = await signToken({ sub: user.id, email: user.email, name: user.name })

  const response = NextResponse.json({
    ok: true,
    data: { user: { id: user.id, email: user.email, name: user.name } },
  })

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
