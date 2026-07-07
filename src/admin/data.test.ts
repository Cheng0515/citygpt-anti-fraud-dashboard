import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  adminUsers,
  auditEvents,
  feedbackItems,
  knowledgeDocuments,
  usageStats,
} from './data'
import type { AuditEvent, PermissionDecision } from './types'

describe('admin sample data', () => {
  it('provides unique IDs for every entity sample', () => {
    const ids = [
      ...adminUsers,
      ...knowledgeDocuments,
      ...auditEvents,
      ...feedbackItems,
    ].map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers realistic user and knowledge-document states', () => {
    expect(adminUsers.length).toBeGreaterThanOrEqual(6)
    expect(adminUsers).toContainEqual(
      expect.objectContaining({ name: '王小明', status: 'active' }),
    )
    expect(new Set(adminUsers.map((user) => user.status))).toEqual(
      new Set(['active', 'suspended', 'invited']),
    )
    expect(new Set(adminUsers.map((user) => user.role))).toEqual(
      new Set(['user', 'admin']),
    )

    expect(knowledgeDocuments.length).toBeGreaterThanOrEqual(7)
    expect(knowledgeDocuments).toContainEqual(
      expect.objectContaining({ name: '民政戶籍補助說明', published: false }),
    )
    expect(knowledgeDocuments).toContainEqual(
      expect.objectContaining({ name: '1999 服務 FAQ', indexStatus: 'failed' }),
    )
  })

  it('keeps a detailed, immutable audit trail with both outcomes', () => {
    expectTypeOf(auditEvents).toEqualTypeOf<readonly AuditEvent[]>()
    expect(auditEvents.length).toBeGreaterThanOrEqual(8)
    expect(auditEvents.every((event) => event.traceId.length > 0)).toBe(true)
    expect(
      auditEvents.every((event) => 'before' in event && 'after' in event),
    ).toBe(true)
    expect(new Set(auditEvents.map((event) => event.result))).toEqual(
      new Set(['success', 'failed']),
    )
    expect(Object.isFrozen(auditEvents)).toBe(true)
    expect(auditEvents.every(Object.isFrozen)).toBe(true)
  })

  it('deeply freezes audit snapshots and rejects mutation attempts', () => {
    const event = auditEvents.find((candidate) => candidate.id === 'audit-008')
    const before = event?.before
    const after = event?.after
    const error = after?.error as Readonly<Record<string, unknown>> | undefined

    expect(event).toBeDefined()
    expect(Object.isFrozen(before)).toBe(true)
    expect(Object.isFrozen(after)).toBe(true)
    expect(error).toEqual({ code: 'CONTENT_PARSE_ERROR', retryable: false })
    expect(Object.isFrozen(error)).toBe(true)
    expect(Object.isFrozen(event?.permissionDecision)).toBe(true)

    const originalStatus = after?.indexStatus
    expect(() => {
      ;(after as Record<string, unknown>).indexStatus = 'completed'
    }).toThrow(TypeError)
    expect(after?.indexStatus).toBe(originalStatus)
  })

  it('uses discriminated permission decisions with denial reasons', () => {
    expectTypeOf(auditEvents[0].permissionDecision).toEqualTypeOf<PermissionDecision>()

    const decisions = auditEvents.map((event) => event.permissionDecision.decision)
    expect(new Set(decisions)).toEqual(new Set(['allowed', 'denied']))

    const denied = auditEvents
      .map((event) => event.permissionDecision)
      .filter((decision) => decision.decision === 'denied')
    expect(denied.every((decision) => decision.reason.length > 0)).toBe(true)
  })

  it('provides complete usage snapshots for every supported range', () => {
    expect(usageStats.map((stats) => stats.rangeDays)).toEqual([7, 30, 90])

    for (const stats of usageStats) {
      expect(stats.kpis.totalQueries).toBeGreaterThan(0)
      expect(stats.trends.length).toBeGreaterThan(0)
      expect(stats.popularKnowledgeBases.length).toBeGreaterThan(0)
      expect(stats.departmentRanking.length).toBeGreaterThan(0)
      expect(stats.unansweredRate).toBeGreaterThanOrEqual(0)
      expect(stats.errorSummaries.length).toBeGreaterThan(0)
    }
  })

  it('includes actionable feedback states and supporting context', () => {
    expect(feedbackItems.length).toBeGreaterThanOrEqual(6)
    expect(feedbackItems).toContainEqual(
      expect.objectContaining({ sentiment: 'negative', status: 'pending' }),
    )
    expect(
      feedbackItems.every(
        (item) => item.context.traceId && item.citations.length > 0,
      ),
    ).toBe(true)
  })
})
