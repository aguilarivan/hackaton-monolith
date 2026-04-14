import type { BusinessInputData } from "@/components/hero-input"
import type { SectionPlan } from "@/lib/server/section-plan-prompt"

const BUSINESS_INPUT_KEY = "dayzero.business-input"
const CLAUDE_ANSWERS_KEY = "dayzero.claude-answers"
const FLOW_ID_KEY = "dayzero.flow-id"
const BRAND_IDENTITY_KEY = "dayzero.brand-identity"
const SECTION_PLAN_KEY = "dayzero.section-plan"
const LANDING_PROGRESS_KEY = "dayzero.landing-progress"

export const LANDING_PROGRESS_EVENT = "dayzero:landing-progress"

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

export function saveSectionPlan(plan: SectionPlan) {
  if (!canUseStorage()) return
  window.localStorage.setItem(SECTION_PLAN_KEY, JSON.stringify(plan))
}

export function getSectionPlan(): SectionPlan | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(SECTION_PLAN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SectionPlan
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
  window.localStorage.removeItem(SECTION_PLAN_KEY)
  window.localStorage.removeItem(LANDING_PROGRESS_KEY)
}

export function saveFlowId(flowId: string) {
  if (!canUseStorage()) return
  window.localStorage.setItem(FLOW_ID_KEY, flowId)
}

export function getFlowId(): string | null {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(FLOW_ID_KEY)
}

// --- Landing progress (step 4: "Aterrizaje") ---

export interface LandingProgress {
  completedSteps: number[] // indices of checked validation-plan items
  totalSteps: number
  landingGenerated: boolean
  domainChecked: boolean
}

export function getLandingProgress(): LandingProgress | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(LANDING_PROGRESS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LandingProgress
  } catch {
    return null
  }
}

export function saveLandingProgress(progress: LandingProgress) {
  if (!canUseStorage()) return
  window.localStorage.setItem(LANDING_PROGRESS_KEY, JSON.stringify(progress))
  window.dispatchEvent(new CustomEvent(LANDING_PROGRESS_EVENT))
}

export function landingProgressRatio(p: LandingProgress): { done: number; total: number } {
  const done = p.completedSteps.length + (p.landingGenerated ? 1 : 0) + (p.domainChecked ? 1 : 0)
  const total = p.totalSteps + 2 // +2 for the two action buttons
  return { done, total }
}
