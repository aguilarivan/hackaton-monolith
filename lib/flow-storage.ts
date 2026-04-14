import type { BusinessInputData } from "@/components/hero-input"

const BUSINESS_INPUT_KEY = "dayzero.business-input"
const CLAUDE_ANSWERS_KEY = "dayzero.claude-answers"
const FLOW_ID_KEY = "dayzero.flow-id"
const BRAND_IDENTITY_KEY = "dayzero.brand-identity"

export type LogoShape = "circle" | "rounded" | "hexagon"

export interface LogoConfig {
  type: "builder" | "uploaded"
  initials: string
  color: string
  shape: LogoShape
  imageDataUrl?: string
}

export interface BrandIdentity {
  name: string
  logo?: LogoConfig
}

export interface ClaudeAnswer {
  questionId: string
  option: string
  details?: string
}

function canUseStorage() {
  return typeof window !== "undefined"
}

export function saveBusinessInput(data: BusinessInputData) {
  if (!canUseStorage()) return
  window.localStorage.setItem(BUSINESS_INPUT_KEY, JSON.stringify(data))
}

export function getBusinessInput(): BusinessInputData | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(BUSINESS_INPUT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as BusinessInputData
  } catch {
    return null
  }
}

export function saveClaudeAnswers(answers: ClaudeAnswer[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(CLAUDE_ANSWERS_KEY, JSON.stringify(answers))
}

export function getClaudeAnswers(): ClaudeAnswer[] {
  if (!canUseStorage()) return []
  const raw = window.localStorage.getItem(CLAUDE_ANSWERS_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as ClaudeAnswer[]
  } catch {
    return []
  }
}

export function saveBrandIdentity(identity: BrandIdentity) {
  if (!canUseStorage()) return
  window.localStorage.setItem(BRAND_IDENTITY_KEY, JSON.stringify(identity))
}

export function getBrandIdentity(): BrandIdentity | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(BRAND_IDENTITY_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as BrandIdentity
  } catch {
    return null
  }
}

export function clearFlowStorage() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(BUSINESS_INPUT_KEY)
  window.localStorage.removeItem(CLAUDE_ANSWERS_KEY)
  window.localStorage.removeItem(FLOW_ID_KEY)
  window.localStorage.removeItem(BRAND_IDENTITY_KEY)
}

export function saveFlowId(flowId: string) {
  if (!canUseStorage()) return
  window.localStorage.setItem(FLOW_ID_KEY, flowId)
}

export function getFlowId(): string | null {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(FLOW_ID_KEY)
}
