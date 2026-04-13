import type { BusinessInputData } from "@/components/hero-input"

const BUSINESS_INPUT_KEY = "dayzero.business-input"
const CLAUDE_ANSWERS_KEY = "dayzero.claude-answers"

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

export function clearFlowStorage() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(BUSINESS_INPUT_KEY)
  window.localStorage.removeItem(CLAUDE_ANSWERS_KEY)
}
