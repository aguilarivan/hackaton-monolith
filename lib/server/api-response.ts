import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INVALID_PAYLOAD"
  | "INTERNAL_ERROR"

interface ErrorPayload {
  code: ApiErrorCode
  message: string
  requestId: string
  details?: unknown
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status }
  )
}

export function apiError(params: {
  status: number
  code: ApiErrorCode
  message: string
  details?: unknown
}) {
  const error: ErrorPayload = {
    code: params.code,
    message: params.message,
    requestId: randomUUID(),
    details: params.details,
  }

  return NextResponse.json(
    {
      ok: false,
      error,
    },
    { status: params.status }
  )
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new Error("INVALID_JSON_BODY")
  }
}
