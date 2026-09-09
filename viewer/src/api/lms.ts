import { apiFetch } from './client'

export interface XapiStatementResult {
  id: string
  stored: boolean
  receivedAt: string
}

export async function postXapiStatement(statement: {
  verb: string
  object?: { id?: string; definition?: { name?: { 'ja-JP'?: string } } }
  context?: { contextActivities?: { grouping?: { id: string }[] } }
  result?: { extensions?: Record<string, unknown> }
}) {
  return apiFetch<XapiStatementResult>('/lms/xapi/statements', {
    method: 'POST',
    body: JSON.stringify(statement),
  })
}
