export type AdminRole = 'user' | 'admin'

export type AdminPage = 'users' | 'stats' | 'audit' | 'feedback'

export type Permission =
  | 'users.manage'
  | 'knowledge.manage'
  | 'audit.view'
  | 'stats.view'
  | 'feedback.manage'
  | 'system.audit'

export type PermissionDecision =
  | {
      readonly decision: 'allowed'
      readonly permission: Permission
    }
  | {
      readonly decision: 'denied'
      readonly permission: Permission
      readonly reason: string
    }

export interface AdminUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly department: string
  readonly role: AdminRole
  readonly status: 'sso_active' | 'sso_disabled' | 'sync_error'
  readonly lastLogin: string | null
}

export interface KnowledgeDocument {
  readonly id: string
  readonly name: string
  readonly knowledgeBase: string
  readonly source: string
  readonly category: string
  readonly version: string
  readonly access: 'public' | 'department' | 'restricted'
  readonly published: boolean
  readonly indexStatus: 'pending' | 'indexing' | 'completed' | 'failed'
  readonly syncStatus: 'completed' | 'failed' | 'waiting_retry' | 'processing'
  readonly readStatus: 'completed' | 'failed' | 'waiting_retry' | 'processing'
  readonly searchableStatus: 'completed' | 'failed' | 'waiting_retry' | 'processing'
  readonly failureReason: string | null
  readonly lastSyncedAt: string | null
  readonly updatedAt: string
  readonly updatedBy: string
}

export type AuditOperationType = 'login' | 'query' | 'download' | 'management' | 'system'

export interface AuditEvent {
  readonly id: string
  readonly timestamp: string
  readonly actor: string
  readonly ip: string
  readonly module: string
  readonly operationType: AuditOperationType
  readonly action: string
  readonly result: 'success' | 'failed'
  readonly resource: string
  readonly traceId: string
  readonly before: Readonly<Record<string, unknown>> | null
  readonly after: Readonly<Record<string, unknown>> | null
  readonly permissionDecision: PermissionDecision
}

export interface UsageTrendPoint {
  readonly date: string
  readonly queries: number
  readonly activeUsers: number
}

export interface KnowledgeBaseUsage {
  readonly name: string
  readonly queries: number
  readonly satisfactionRate: number
}

export interface NegativeFeedbackSummary {
  readonly reason: string
  readonly count: number
  readonly description: string
}

export interface UserTrafficStats {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly role: AdminRole
  readonly department: string
  readonly monthlyTokens: number
  readonly monthlyQueries: number
  readonly dailyAverageQueries: number
  readonly tokenLimit: number
  readonly alertLevel: 'normal' | 'watch' | 'alert'
  readonly lastActivityAt: string
  readonly note: string
}

export interface UsageStats {
  readonly rangeDays: 7 | 30 | 90
  readonly kpis: {
    readonly totalQueries: number
    readonly aiTokens: number
    readonly activeUsers: number
    readonly averageResponseMs: number
    readonly satisfactionRate: number
  }
  readonly trends: readonly UsageTrendPoint[]
  readonly popularKnowledgeBases: readonly KnowledgeBaseUsage[]
  readonly featureUsage: readonly {
    readonly name: string
    readonly count: number
  }[]
  readonly departmentUsage: readonly {
    readonly department: string
    readonly queries: number
    readonly tokens: number
  }[]
  readonly roleUsage: readonly {
    readonly role: AdminRole
    readonly queries: number
    readonly tokens: number
  }[]
  readonly citedDocuments: readonly {
    readonly name: string
    readonly citations: number
  }[]
  readonly qualityIssues: readonly {
    readonly type: '找不到答案' | '搜尋相關度偏低'
    readonly question: string
    readonly count: number
  }[]
  readonly negativeFeedback: {
    readonly count: number
    readonly unresolved: number
    readonly rate: number
    readonly commonReasons: readonly NegativeFeedbackSummary[]
  }
}

export interface FeedbackCitation {
  readonly documentId: string
  readonly documentName: string
  readonly excerpt: string
}

export interface FeedbackContext {
  readonly traceId: string
  readonly conversationId: string
  readonly channel: string
}

export interface FeedbackItem {
  readonly id: string
  readonly userId: string
  readonly userName: string
  readonly userEmail: string
  readonly department: string
  readonly agentName: string
  readonly sentiment: 'positive' | 'negative'
  readonly rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  readonly question: string
  readonly answer: string
  readonly feedbackText: string
  readonly knowledgeBase: string
  readonly tags: readonly string[]
  readonly status: 'pending' | 'in_progress' | 'completed' | 'ignored'
  readonly createdAt: string
  readonly assignee: string | null
  readonly note: string
  readonly citations: readonly FeedbackCitation[]
  readonly context: FeedbackContext
}
