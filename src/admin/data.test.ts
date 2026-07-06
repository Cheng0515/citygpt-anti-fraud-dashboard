import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  adminUsers,
  auditEvents,
  feedbackItems,
  knowledgeDocuments,
  usageStats,
} from './data'
import type { AuditEvent } from './types'

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

    expect(knowledgeDocuments.length).toBeGreaterThanOrEqual(7)
    expect(knowledgeDocuments).toContainEqual(
      expect.objectContaining({ name: '農業政策手冊', published: false }),
    )
    expect(knowledgeDocuments).toContainEqual(
      expect.objectContaining({ name: '縣政 FAQ', indexStatus: 'failed' }),
    )
  })

  it('keeps a detailed, immutable audit trail with both outcomes', () => {
    expectTypeOf(auditEvents).toEqualTypeOf<readonly AuditEvent[]>()
    expect(auditEvents.length).toBeGreaterThanOrEqual(8)
    expect(auditEvents.every((event) => event.traceId.length > 0)).toBe(true)
    expect(auditEvents.every((event) => 'before' in event && 'after' in event)).toBe(
      true,
    )
    expect(new Set(auditEvents.map((event) => event.result))).toEqual(
      new Set(['success', 'failed']),
    )
    expect(Object.isFrozen(auditEvents)).toBe(true)
    expect(auditEvents.every(Object.isFrozen)).toBe(true)
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
