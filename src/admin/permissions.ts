import type { AdminPage, AdminRole, Permission } from './types'

interface RoleAccess {
  readonly pages: readonly AdminPage[]
  readonly permissions: readonly Permission[]
}

const freezeList = <T extends string>(items: readonly T[]) => Object.freeze([...items])

const ROLE_ACCESS: Readonly<Record<AdminRole, RoleAccess>> = Object.freeze({
  admin: Object.freeze({
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
})

export function allowedPages(role: AdminRole): readonly AdminPage[] {
  return ROLE_ACCESS[role].pages
}

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_ACCESS[role].permissions.includes(permission)
}
