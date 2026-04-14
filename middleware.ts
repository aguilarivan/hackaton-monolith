import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production-must-be-32chars"
)

const PROTECTED = ["/preguntas-claude", "/analisis"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      // token inválido o expirado — redirigir a login
    }
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/preguntas-claude", "/analisis"],
}
