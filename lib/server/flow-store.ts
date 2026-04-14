import { randomUUID } from "node:crypto"

export interface BusinessInputData {
  idea: string
  city: string
  investment: number
  brandName?: string
}

export interface ClaudeAnswer {
  questionId: string
  option: string
  details?: string
}

export interface FlowRecord {
  id: string
  businessInput: BusinessInputData
  claudeAnswers: ClaudeAnswer[]
  createdAt: string
  updatedAt: string
}

const flowStore = new Map<string, FlowRecord>()

export function createFlow(businessInput: BusinessInputData): FlowRecord {
  const now = new Date().toISOString()
  const record: FlowRecord = {
    id: randomUUID(),
    businessInput,
    claudeAnswers: [],
    createdAt: now,
    updatedAt: now,
  }

  flowStore.set(record.id, record)
  return record
}

export function updateFlowAnswers(flowId: string, claudeAnswers: ClaudeAnswer[]): FlowRecord | null {
  const current = flowStore.get(flowId)
  if (!current) return null

  const updated: FlowRecord = {
    ...current,
    claudeAnswers,
    updatedAt: new Date().toISOString(),
  }

  flowStore.set(flowId, updated)
  return updated
}

export function getFlow(flowId: string): FlowRecord | null {
  return flowStore.get(flowId) ?? null
}
