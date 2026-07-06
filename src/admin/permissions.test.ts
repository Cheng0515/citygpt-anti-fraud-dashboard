import { describe, expect, it } from 'vitest'

import { allowedPages, can } from './permissions'

describe('admin permissions', () => {
  it('grants system administrators access to every admin page', () => {
    expect(allowedPages('system_admin')).toEqual([
      'users',
      'knowledge',
      'audit',
      'stats',
      'feedback',
    ])
    expect(can('system_admin', 'users.manage')).toBe(true)
  })

  it('limits auditors to audit and statistics access', () => {
    expect(allowedPages('auditor')).toEqual(['audit', 'stats'])
    expect(can('auditor', 'audit.view')).toBe(true)
    expect(can('auditor', 'knowledge.manage')).toBe(false)
  })

  it('grants knowledge administrators knowledge, statistics, and feedback management', () => {
    expect(allowedPages('knowledge_admin')).toEqual([
      'knowledge',
      'stats',
      'feedback',
    ])
    expect(can('knowledge_admin', 'knowledge.manage')).toBe(true)
    expect(can('knowledge_admin', 'stats.view')).toBe(true)
    expect(can('knowledge_admin', 'feedback.manage')).toBe(true)
    expect(can('knowledge_admin', 'users.manage')).toBe(false)
  })

  it('limits analysts to statistics and read-only feedback access', () => {
    expect(allowedPages('analyst')).toEqual(['stats', 'feedback'])
    expect(can('analyst', 'stats.view')).toBe(true)
    expect(can('analyst', 'feedback.manage')).toBe(false)
  })
})
