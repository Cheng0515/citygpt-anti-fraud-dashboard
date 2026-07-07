import type { AdminPage, AdminRole, Permission } from './types'

interface RoleAccess {
  readonly pages: readonly AdminPage[]
  readonly permissions: readonly Permission[]
}

const freezeList = <T extends string>(items: readonly T[]) => Object.freeze([...items])

const ROLE_ACCESS: Readonly<Record<AdminRole, RoleAccess>> = Object.freeze({
  system_admin: Object.freeze({
    pages: freezeList<AdminPage>([
      'users',
      'knowledge',
      'audit',
      'stats',
      'feedback',
    ]),
    permissions: freezeList<Permission>([
      'users.manage',
      'knowledge.manage',
      'audit.view',
      'stats.view',
      'feedback.manage',
    ]),
  }),
  knowledge_admin: Object.freeze({
    pages: freezeList<AdminPage>(['knowledge', 'stats', 'feedback']),
    permissions: freezeList<Permission>([
      'knowledge.manage',
      'stats.view',
      'feedback.manage',
    ]),
  }),
  auditor: Object.freeze({
    pages: freezeList<AdminPage>(['audit', 'stats']),
    permissions: freezeList<Permission>(['audit.view', 'stats.view']),
  }),
  analyst: Object.freeze({
    pages: freezeList<AdminPage>(['stats', 'feedback']),
    permissions: freezeList<Permission>(['stats.view']),
  }),
})

export function allowedPages(role: AdminRole): readonly AdminPage[] {
  return ROLE_ACCESS[role].pages
}

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_ACCESS[role].permissions.includes(permission)
}
