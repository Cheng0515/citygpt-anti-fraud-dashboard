import { describe, expect, it } from 'vitest'

import { allowedPages, can } from './permissions'
import type { AdminPage, AdminRole, Permission } from './types'

const permissions: readonly Permission[] = [
  'users.manage',
  'knowledge.manage',
  'audit.view',
  'stats.view',
  'feedback.manage',
]

const expectedPermissions: Readonly<
  Record<AdminRole, readonly Permission[]>
> = {
  system_admin: permissions,
  knowledge_admin: ['knowledge.manage', 'stats.view', 'feedback.manage'],
  auditor: ['audit.view', 'stats.view'],
  analyst: ['stats.view'],
}

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
    expect(can('auditor', 'stats.view')).toBe(true)
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

  it('enforces the complete role permission matrix', () => {
    for (const role of Object.keys(expectedPermissions) as AdminRole[]) {
      for (const permission of permissions) {
        expect(can(role, permission), `${role}: ${permission}`).toBe(
          expectedPermissions[role].includes(permission),
        )
      }
    }
  })

  it('prevents consumers from mutating internal navigation rules', () => {
    const pages = allowedPages('auditor')

    expect(Object.isFrozen(pages)).toBe(true)
    expect(() => (pages as AdminPage[]).push('users')).toThrow(TypeError)
    expect(allowedPages('auditor')).toEqual(['audit', 'stats'])
  })
})
