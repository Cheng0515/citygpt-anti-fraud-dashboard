import type { AdminPage, AdminRole, Permission } from './types'

interface RoleAccess {
  readonly pages: readonly AdminPage[]
  readonly permissions: readonly Permission[]
}

const ROLE_ACCESS: Readonly<Record<AdminRole, RoleAccess>> = {
  system_admin: {
    pages: ['users', 'knowledge', 'audit', 'stats', 'feedback'],
    permissions: [
      'users.manage',
      'knowledge.manage',
      'audit.view',
      'stats.view',
      'feedback.manage',
    ],
  },
  knowledge_admin: {
    pages: ['knowledge', 'stats', 'feedback'],
    permissions: ['knowledge.manage', 'stats.view', 'feedback.manage'],
  },
  auditor: {
    pages: ['audit', 'stats'],
    permissions: ['audit.view'],
  },
  analyst: {
    pages: ['stats', 'feedback'],
    permissions: ['stats.view'],
  },
}

export function allowedPages(role: AdminRole): readonly AdminPage[] {
  return ROLE_ACCESS[role].pages
}

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_ACCESS[role].permissions.includes(permission)
}
