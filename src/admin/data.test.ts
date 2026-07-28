import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  adminUsers,
  auditEvents,
  feedbackItems,
  knowledgeDocuments,
  usageStats,
  userTrafficStats,
} from './data'
import type { AuditEvent, PermissionDecision } from './types'

describe('admin sample data', () => {
  it('provides unique IDs for every entity sample', () => {
    const ids = [
      ...adminUsers,
      ...knowledgeDocuments,
      ...auditEvents,
      ...feedbackItems,
      ...userTrafficStats,
    ].map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers realistic user and knowledge-document states', () => {
    expect(adminUsers.length).toBeGreaterThanOrEqual(6)
    expect(adminUsers).toContainEqual(
      expect.objectContaining({ name: '王小明', status: 'sso_active' }),
    )
    expect(new Set(adminUsers.map((user) => user.status))).toEqual(
      new Set(['sso_active', 'sso_disabled', 'sync_error']),
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

    expect(event).toBeDefined()
    expect(Object.isFrozen(before)).toBe(true)
    expect(Object.isFrozen(after)).toBe(true)
    expect(after).toEqual(
      expect.objectContaining({
        reason: '輸入疑似包含帳號密碼或 Token',
        blocked: true,
      }),
    )
    expect(Object.isFrozen(event?.permissionDecision)).toBe(true)

    const originalReason = after?.reason
    expect(() => {
      ;(after as Record<string, unknown>).reason = 'changed'
    }).toThrow(TypeError)
    expect(after?.reason).toBe(originalReason)
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

  it('includes token usage anomaly audit with IT and admin notification', () => {
    const event = auditEvents.find((candidate) => candidate.action === 'Token 用量異常')
    const after = event?.after
    const notification = after?.emailNotification as
      | Readonly<{ status: string; recipients: readonly string[]; subject: string }>
      | undefined

    expect(event).toEqual(
      expect.objectContaining({
        module: '系統管理',
        result: 'failed',
        resource: 'xiaoming.wang@citygpt.example',
      }),
    )
    expect(after).toEqual(
      expect.objectContaining({
        monthlyTokenUsage: 382400,
        monthlyTokenThreshold: 300000,
      }),
    )
    expect(notification?.status).toBe('sent')
    expect(notification?.recipients).toEqual(['IT', 'admin'])
  })

  it('provides complete usage snapshots for every supported range', () => {
    expect(usageStats.map((stats) => stats.rangeDays)).toEqual([7, 30, 90])

    for (const stats of usageStats) {
      expect(stats.kpis.totalQueries).toBeGreaterThan(0)
      expect(stats.trends.length).toBeGreaterThan(0)
      expect(stats.popularKnowledgeBases.length).toBeGreaterThan(0)
      expect(stats.negativeFeedback.count).toBeGreaterThan(0)
      expect(stats.negativeFeedback.unresolved).toBeGreaterThanOrEqual(0)
      expect(stats.negativeFeedback.rate).toBeGreaterThanOrEqual(0)
      expect(stats.negativeFeedback.commonReasons.length).toBeGreaterThan(0)
    }
  })

  it('tracks per-user traffic while reserving audit logs for anomalies', () => {
    expect(userTrafficStats.length).toBeGreaterThanOrEqual(4)
    expect(Object.isFrozen(userTrafficStats)).toBe(true)
    expect(userTrafficStats.every(Object.isFrozen)).toBe(true)

    const alertUser = userTrafficStats.find((item) => item.alertLevel === 'alert')
    const watchUser = userTrafficStats.find((item) => item.alertLevel === 'watch')

    expect(alertUser).toEqual(
      expect.objectContaining({
        email: 'xiaoming.wang@citygpt.example',
        monthlyTokens: 382400,
        tokenLimit: 300000,
      }),
    )
    expect(alertUser?.monthlyTokens).toBeGreaterThan(alertUser?.tokenLimit ?? 0)
    expect(watchUser?.monthlyTokens).toBeGreaterThanOrEqual(
      Math.round((watchUser?.tokenLimit ?? 0) * 0.8),
    )
    expect(watchUser?.monthlyTokens).toBeLessThan(watchUser?.tokenLimit ?? 0)
  })

  it('includes actionable feedback states and supporting context', () => {
    expect(feedbackItems.length).toBeGreaterThanOrEqual(6)
    expect(feedbackItems).toContainEqual(
      expect.objectContaining({ sentiment: 'negative', status: 'pending' }),
    )
    expect(feedbackItems.every((item) => item.rating >= 1 && item.rating <= 10)).toBe(true)
    expect(
      feedbackItems.every(
        (item) => item.context.traceId && item.citations.length > 0,
      ),
    ).toBe(true)
  })
})
