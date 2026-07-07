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
  admin: permissions,
}

describe('admin permissions', () => {
  it('grants the single administrator role access to every admin page', () => {
    expect(allowedPages('admin')).toEqual([
      'users',
      'knowledge',
      'audit',
      'stats',
      'feedback',
    ])
    for (const permission of permissions) {
      expect(can('admin', permission), permission).toBe(true)
    }
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
    const pages = allowedPages('admin')

    expect(Object.isFrozen(pages)).toBe(true)
    expect(() => (pages as AdminPage[]).push('users')).toThrow(TypeError)
    expect(allowedPages('admin')).toEqual([
      'users',
      'knowledge',
      'audit',
      'stats',
      'feedback',
    ])
  })
})
