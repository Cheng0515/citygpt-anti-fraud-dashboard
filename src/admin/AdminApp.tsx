import {
  Activity,
  Archive,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileSearch,
  Filter,
  History,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  UserCog,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  adminUsers,
  auditEvents,
  feedbackItems,
  knowledgeDocuments,
  usageStats,
  userTrafficStats,
} from './data'
import { allowedPages, can } from './permissions'
import type {
  AdminPage,
  AdminRole,
  AdminUser,
  AuditEvent,
  FeedbackItem,
  KnowledgeDocument,
  Permission,
  UsageStats,
  UserTrafficStats,
} from './types'
import './admin.css'

const pageMeta: Record<
  AdminPage,
  { label: string; description: string; icon: React.ReactNode }
> = {
  users: {
    label: '使用者與權限',
    description: '查看 SSO 狀態與管理者角色',
    icon: <UserCog size={18} />,
  },
  stats: {
    label: '使用統計',
    description: '日週月 KPI、Token 與問題來源',
    icon: <BarChart3 size={18} />,
  },
  audit: {
    label: '稽核日誌',
    description: '追蹤誰在何時做了什麼',
    icon: <History size={18} />,
  },
  feedback: {
    label: '回饋管理',
    description: '處理正負回饋與改善任務',
    icon: <MessageSquare size={18} />,
  },
  system: {
    label: '系統狀態',
    description: '文件同步、讀取與搜尋資料狀態',
    icon: <Activity size={18} />,
  },
}

const roleLabels: Record<AdminRole, string> = {
  user: '一般USER',
  admin: '管理者',
}

const permissionLabels: Record<Permission, string> = {
  'users.manage': '管理使用者',
  'knowledge.manage': '管理知識代理人',
  'audit.view': '查看稽核日誌',
  'stats.view': '查看使用統計',
  'feedback.manage': '處理回饋',
  'system.audit': '系統安全判斷',
}

const userStatusLabels: Record<AdminUser['status'], string> = {
  sso_active: 'SSO 有效',
  sso_disabled: 'SSO 停用',
  sync_error: '同步異常',
}

const indexStatusLabels: Record<KnowledgeDocument['indexStatus'], string> = {
  pending: '等待索引',
  indexing: '索引中',
  completed: '可搜尋',
  failed: '索引失敗',
}

const pipelineStatusLabels: Record<KnowledgeDocument['syncStatus'], string> = {
  completed: '完成',
  failed: '失敗',
  waiting_retry: '等待重試',
  processing: '處理中',
}

const accessLabels: Record<KnowledgeDocument['access'], string> = {
  public: '全府可用',
  department: '限處室',
  restricted: '指定對象',
}

const operationTypeLabels = {
  login: '登入',
  query: '查詢',
  download: '下載',
  management: '管理操作',
  system: '系統判斷',
} as const

const feedbackStatusLabels: Record<FeedbackItem['status'], string> = {
  pending: '待處理',
  in_progress: '處理中',
  completed: '已完成',
  ignored: '不列入',
}

type KnowledgeAgentStatus = 'draft' | 'published' | 'paused'
type KnowledgeAgentAccess = 'all' | 'department' | 'selected'

interface KnowledgeAgent {
  id: string
  name: string
  serviceType: string
  owner: string
  status: KnowledgeAgentStatus
  access: KnowledgeAgentAccess
  allowedGroups: string[]
  prompt: string
  guardrails: string
  model: string
  usage: number
  updatedAt: string
}

const agentStatusLabels: Record<KnowledgeAgentStatus, string> = {
  draft: '草稿',
  published: '已發布',
  paused: '已停用',
}

const agentAccessLabels: Record<KnowledgeAgentAccess, string> = {
  all: '全員可用',
  department: '限所屬處室',
  selected: '指定對象',
}

const knowledgeAgentSamples: KnowledgeAgent[] = [
  {
    id: 'agent-001',
    name: '市政問答助手',
    serviceType: '一般問答',
    owner: '資訊管理處',
    status: 'published',
    access: 'all',
    allowedGroups: ['全府員工', '客服窗口'],
    prompt:
      '你是 CityGPT 市政問答助手。請用清楚、可執行的方式回答，必要時提醒使用者查詢最新公告。',
    guardrails: '不可編造法規條號；沒有來源時要明確說明需要人工確認。',
    model: 'GPT-4.1 mini',
    usage: 8420,
    updatedAt: '2026-07-06T09:40:00+08:00',
  },
  {
    id: 'agent-002',
    name: '1999 客服摘要代理人',
    serviceType: '客服摘要',
    owner: '客服營運小組',
    status: 'published',
    access: 'department',
    allowedGroups: ['客服營運小組', '1999 值班主管'],
    prompt:
      '將民眾來電內容整理成案件摘要、承辦單位、建議回覆與待確認事項。',
    guardrails: '不得輸出個資到非授權欄位；不確定承辦單位時標記「需人工判斷」。',
    model: 'GPT-4.1',
    usage: 3160,
    updatedAt: '2026-07-05T16:12:00+08:00',
  },
  {
    id: 'agent-003',
    name: '社福資格初判助手',
    serviceType: '資格判斷',
    owner: '社會處',
    status: 'draft',
    access: 'selected',
    allowedGroups: ['社會處承辦', '社福知識維護小組'],
    prompt:
      '根據使用者提供的家庭、收入與身分條件，整理可能符合的社福方案與缺漏資料。',
    guardrails: '只能做初步整理，不可宣稱審核通過；需附上承辦提醒。',
    model: 'GPT-4.1 mini',
    usage: 620,
    updatedAt: '2026-07-04T11:20:00+08:00',
  },
  {
    id: 'agent-004',
    name: '稽核紀錄查詢助理',
    serviceType: '資安稽核',
    owner: '政風處',
    status: 'paused',
    access: 'selected',
    allowedGroups: ['政風處', '資安稽核小組'],
    prompt:
      '協助稽核人員以自然語言查詢操作紀錄，並整理可追溯的 Trace ID 與事件摘要。',
    guardrails: '只能檢索已授權範圍；不可輸出完整個資或機敏參數。',
    model: 'GPT-4.1',
    usage: 940,
    updatedAt: '2026-07-03T15:05:00+08:00',
  },
]

function formatDateTime(value: string | null) {
  if (!value) return '尚未登入'
  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-notice" role="status">
      <Check size={17} />
      {children}
    </div>
  )
}

function EmptyPermission({ label }: { label: string }) {
  return (
    <div className="admin-permission-note">
      <Lock size={18} />
      <div>
        <strong>目前權限沒有「{label}」能力</strong>
        <span>你仍可檢視資料，但不能送出會改變後臺狀態的操作。</span>
      </div>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="關閉" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

function UsersPage({
  role,
  users,
  setUsers,
  setNotice,
}: {
  role: AdminRole
  users: AdminUser[]
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>
  setNotice: (message: string) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | AdminUser['status']>('all')
  const canManage = can(role, 'users.manage')

  const visible = users.filter((user) => {
    const text = `${user.name} ${user.email}`.toLowerCase()
    return (
      text.includes(query.toLowerCase()) &&
      (status === 'all' || user.status === status)
    )
  })

  const updateRole = (target: AdminUser, nextRole: AdminRole) => {
    setUsers((current) =>
      current.map((user) => (user.id === target.id ? { ...user, role: nextRole } : user)),
    )
    setNotice(
      nextRole === 'admin'
        ? `${target.name} 已設為管理者，可進入後臺。`
        : `${target.name} 已設為一般USER，不可進入後臺。`,
    )
  }

  return (
    <div className="admin-grid">
      <div className="admin-main-column full-width">
        {!canManage && <EmptyPermission label="管理使用者" />}
        <Panel
          title="SSO 使用者清單"
          subtitle="帳號是否有效由 SSO / AD 控制；CityGPT 後臺只管理一般USER與管理者角色。"
        >
          <section className="sso-policy-card">
            <ShieldCheck size={18} />
            <div>
              <strong>帳號生命週期以 SSO 為準</strong>
              <span>
                停用、離職與全縣帳號有效性不在 CityGPT 後臺操作；這裡只顯示 SSO
                同步狀態，並設定誰是管理者。
              </span>
            </div>
          </section>
          <div className="admin-filters" aria-label="使用者篩選">
            <label className="admin-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋姓名或 Email"
              />
            </label>
            <label>
              SSO 狀態
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as 'all' | AdminUser['status'])
                }
              >
                <option value="all">全部狀態</option>
                <option value="sso_active">SSO 有效</option>
                <option value="sso_disabled">SSO 停用</option>
                <option value="sync_error">同步異常</option>
              </select>
            </label>
          </div>
          <div className="admin-table user-table">
            <div className="admin-table-head">
              <span>使用者</span>
              <span>SSO 狀態</span>
              <span>最後登入</span>
              <span>CityGPT 角色</span>
            </div>
            {visible.map((user) => (
              <article key={user.id} className="admin-row">
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
                <span className={`admin-pill ${user.status}`}>{userStatusLabels[user.status]}</span>
                <span>{formatDateTime(user.lastLogin)}</span>
                <div className="admin-row-actions">
                  <select
                    value={user.role}
                    disabled={!canManage || user.status !== 'sso_active'}
                    aria-label={`${user.name} 權限類型`}
                    onChange={(event) => updateRole(user, event.target.value as AdminRole)}
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function KnowledgePage({
  role,
  documents,
  setDocuments,
  setNotice,
}: {
  role: AdminRole
  documents: KnowledgeDocument[]
  setDocuments: React.Dispatch<React.SetStateAction<KnowledgeDocument[]>>
  setNotice: (message: string) => void
}) {
  const canManage = can(role, 'knowledge.manage')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<KnowledgeDocument | null>(documents[0] ?? null)
  const [confirming, setConfirming] = useState<KnowledgeDocument | null>(null)
  const [uploadName, setUploadName] = useState('')

  const visible = documents.filter((document) => {
    const text = `${document.name} ${document.knowledgeBase} ${document.category}`.toLowerCase()
    const lifecycle = document.published ? 'published' : 'draft'
    return text.includes(query.toLowerCase()) && (status === 'all' || status === lifecycle)
  })

  const updateDocument = (target: KnowledgeDocument, patch: Partial<KnowledgeDocument>) => {
    const next = { ...target, ...patch, updatedAt: new Date().toISOString() }
    setDocuments((current) =>
      current.map((document) => (document.id === target.id ? next : document)),
    )
    setSelected(next)
  }

  const publishToggle = () => {
    if (!confirming) return
    updateDocument(confirming, { published: !confirming.published })
    setNotice(`${confirming.name} 已${confirming.published ? '下架' : '上架'}。`)
    setConfirming(null)
  }

  const reindex = (target: KnowledgeDocument) => {
    updateDocument(target, { indexStatus: 'indexing' })
    setNotice(`${target.name} 已排入重新索引。`)
    window.setTimeout(() => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === target.id ? { ...document, indexStatus: 'completed' } : document,
        ),
      )
      setSelected((current) =>
        current?.id === target.id ? { ...current, indexStatus: 'completed' } : current,
      )
    }, 700)
  }

  const addDocument = () => {
    if (!uploadName) return
    const next: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      name: uploadName,
      knowledgeBase: '市政服務知識庫',
      source: '手動上傳',
      category: '待分類',
      version: 'v1.0-draft',
      access: 'department',
      published: false,
      indexStatus: 'pending',
      syncStatus: 'completed',
      readStatus: 'waiting_retry',
      searchableStatus: 'waiting_retry',
      failureReason: '新文件等待讀取與建立搜尋資料。',
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: '目前使用者',
    }
    setDocuments((current) => [next, ...current])
    setSelected(next)
    setUploadName('')
    setNotice(`${next.name} 已新增為草稿，等待分類與索引。`)
  }

  return (
    <div className="admin-grid">
      <div className="admin-main-column">
        {!canManage && <EmptyPermission label="管理文件與索引" />}
        <Panel
          title="文件與知識庫管理"
          subtitle="把後臺操作拆成上架、分類、權限、索引，不讓管理者碰工程變數。"
          action={
            <div className="inline-upload">
              <input
                value={uploadName}
                disabled={!canManage}
                onChange={(event) => setUploadName(event.target.value)}
                placeholder="輸入文件名稱即可模擬上傳"
              />
              <button type="button" disabled={!canManage} onClick={addDocument}>
                <Upload size={16} />
                加入草稿
              </button>
            </div>
          }
        >
          <div className="admin-filters">
            <label className="admin-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋文件、知識庫或分類"
              />
            </label>
            <label>
              生命週期
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">全部</option>
                <option value="published">已上架</option>
                <option value="draft">草稿/未上架</option>
              </select>
            </label>
          </div>
          <div className="admin-table knowledge-table">
            <div className="admin-table-head">
              <span>文件</span>
              <span>分類</span>
              <span>權限</span>
              <span>索引</span>
              <span>操作</span>
            </div>
            {visible.map((document) => (
              <article key={document.id} className="admin-row">
                <div>
                  <strong>{document.name}</strong>
                  <small>{document.knowledgeBase} · {document.version}</small>
                </div>
                <span>{document.category}</span>
                <span>{accessLabels[document.access]}</span>
                <span className={`admin-pill ${document.indexStatus}`}>
                  {indexStatusLabels[document.indexStatus]}
                </span>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => setSelected(document)}>
                    <Eye size={15} />
                    詳細
                  </button>
                  <button type="button" disabled={!canManage} onClick={() => setConfirming(document)}>
                    {document.published ? '下架' : '上架'}
                  </button>
                  <button type="button" disabled={!canManage} onClick={() => reindex(document)}>
                    <RefreshCw size={15} />
                    重建索引
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
      <aside className="admin-side-card">
        <h2>文件設定</h2>
        {selected ? (
          <>
            <p>{selected.name}</p>
            <label>
              分類
              <input
                value={selected.category}
                disabled={!canManage}
                onChange={(event) => updateDocument(selected, { category: event.target.value })}
              />
            </label>
            <label>
              可使用範圍
              <select
                value={selected.access}
                disabled={!canManage}
                onChange={(event) =>
                  updateDocument(selected, {
                    access: event.target.value as KnowledgeDocument['access'],
                  })
                }
              >
                <option value="public">全府可用</option>
                <option value="department">限處室</option>
                <option value="restricted">指定對象</option>
              </select>
            </label>
            <dl className="admin-detail-list">
              <div>
                <dt>生命週期</dt>
                <dd>{selected.published ? '已上架' : '未上架'}</dd>
              </div>
              <div>
                <dt>索引狀態</dt>
                <dd>{indexStatusLabels[selected.indexStatus]}</dd>
              </div>
              <div>
                <dt>最後更新</dt>
                <dd>{formatDateTime(selected.updatedAt)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p>請先選擇文件。</p>
        )}
      </aside>
      {confirming && (
        <Modal
          title={`確認${confirming.published ? '下架' : '上架'}文件`}
          onClose={() => setConfirming(null)}
        >
          <p>
            {confirming.name} 將{confirming.published ? '停止出現在回答引用來源中' : '可被 CityGPT 引用'}。
          </p>
          <div className="admin-modal-actions">
            <button type="button" onClick={() => setConfirming(null)}>
              取消
            </button>
            <button type="button" className="admin-primary" onClick={publishToggle}>
              確認{confirming.published ? '下架' : '上架'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function SystemStatusPage({
  documents,
  setNotice,
}: {
  documents: KnowledgeDocument[]
  setNotice: (message: string) => void
}) {
  const [source, setSource] = useState('all')
  const [access, setAccess] = useState<'all' | KnowledgeDocument['access']>('all')
  const [status, setStatus] = useState<
    'all' | 'published' | 'draft' | KnowledgeDocument['indexStatus']
  >('all')
  const [selected, setSelected] = useState<KnowledgeDocument | null>(documents[0] ?? null)
  const sources = ['all', ...Array.from(new Set(documents.map((document) => document.source)))]
  const failedCount = documents.filter(
    (document) =>
      document.syncStatus === 'failed' ||
      document.readStatus === 'failed' ||
      document.searchableStatus === 'failed',
  ).length
  const waitingRetryCount = documents.filter(
    (document) =>
      document.syncStatus === 'waiting_retry' ||
      document.readStatus === 'waiting_retry' ||
      document.searchableStatus === 'waiting_retry',
  ).length

  const visible = documents.filter((document) => {
    const lifecycle = document.published ? 'published' : 'draft'
    return (
      (source === 'all' || document.source === source) &&
      (access === 'all' || document.access === access) &&
      (status === 'all' || document.indexStatus === status || lifecycle === status)
    )
  })

  return (
    <div className="admin-grid">
      <div className="admin-main-column">
        <Panel
          title="系統狀態"
          subtitle="本期不做完整 RAG 文件管理；只監控文件同步、讀取與建立 AI 可搜尋資料。"
          action={
            <button
              type="button"
              className="admin-secondary"
              onClick={() => setNotice('已建立文件狀態檢查請求（Prototype，不會呼叫真實排程）。')}
            >
              <RefreshCw size={16} />
              重新檢查狀態
            </button>
          }
        >
          <div className="system-summary-grid">
            <article>
              <span>文件總數</span>
              <strong>{documents.length}</strong>
            </article>
            <article>
              <span>建立搜尋資料完成</span>
              <strong>{documents.filter((document) => document.searchableStatus === 'completed').length}</strong>
            </article>
            <article>
              <span>失敗 / 等待重試</span>
              <strong>{failedCount + waitingRetryCount}</strong>
            </article>
          </div>
          <section className="prd-note-card">
            <strong>PRD 對齊方式</strong>
            <span>
              文件來源、權限與上架狀態只作為輔助資訊唯讀顯示；真正要交付的是同步、
              讀取、建立搜尋資料的狀態與失敗原因。
            </span>
          </section>
          <div className="admin-filters">
            <label>
              來源
              <select value={source} onChange={(event) => setSource(event.target.value)}>
                {sources.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? '全部來源' : item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              權限
              <select
                value={access}
                onChange={(event) =>
                  setAccess(event.target.value as 'all' | KnowledgeDocument['access'])
                }
              >
                <option value="all">全部權限</option>
                {Object.entries(accessLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              狀態
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | 'all'
                      | 'published'
                      | 'draft'
                      | KnowledgeDocument['indexStatus'],
                  )
                }
              >
                <option value="all">全部狀態</option>
                <option value="published">已上架</option>
                <option value="draft">未上架</option>
                <option value="completed">可搜尋</option>
                <option value="failed">失敗</option>
                <option value="pending">等待索引</option>
                <option value="indexing">索引中</option>
              </select>
            </label>
          </div>
          <div className="system-doc-list">
            {visible.map((document) => (
              <button
                key={document.id}
                type="button"
                className={selected?.id === document.id ? 'system-doc-card active' : 'system-doc-card'}
                onClick={() => {
                  setSelected(document)
                  setNotice(`已留下查閱紀錄：${document.name} 文件狀態。`)
                }}
              >
                <span className={`admin-pill ${document.indexStatus}`}>
                  {indexStatusLabels[document.indexStatus]}
                </span>
                <strong>{document.name}</strong>
                <small>
                  {document.source} · {accessLabels[document.access]} ·{' '}
                  {document.published ? '已上架' : '未上架'}
                </small>
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <aside className="admin-side-card system-detail">
        <h2>文件處理狀態</h2>
        {selected && (
          <>
            <p>{selected.name}</p>
            <dl className="admin-detail-list">
              <div>
                <dt>來源</dt>
                <dd>{selected.source}</dd>
              </div>
              <div>
                <dt>存取權限</dt>
                <dd>{accessLabels[selected.access]}</dd>
              </div>
              <div>
                <dt>上架狀態</dt>
                <dd>{selected.published ? '已上架' : '未上架'}</dd>
              </div>
              <div>
                <dt>最後同步</dt>
                <dd>{formatDateTime(selected.lastSyncedAt)}</dd>
              </div>
            </dl>
            <div className="pipeline-list">
              <div>
                <span>同步文件</span>
                <strong className={`pipeline-status ${selected.syncStatus}`}>
                  {pipelineStatusLabels[selected.syncStatus]}
                </strong>
              </div>
              <div>
                <span>讀取內容</span>
                <strong className={`pipeline-status ${selected.readStatus}`}>
                  {pipelineStatusLabels[selected.readStatus]}
                </strong>
              </div>
              <div>
                <span>建立 AI 可搜尋資料</span>
                <strong className={`pipeline-status ${selected.searchableStatus}`}>
                  {pipelineStatusLabels[selected.searchableStatus]}
                </strong>
              </div>
            </div>
            <section className="failure-reason-card">
              <strong>原因</strong>
              <span>{selected.failureReason ?? '目前無失敗原因。'}</span>
            </section>
            <button
              type="button"
              className="admin-primary full"
              disabled={
                !selected.failureReason &&
                selected.syncStatus !== 'waiting_retry' &&
                selected.readStatus !== 'waiting_retry' &&
                selected.searchableStatus !== 'waiting_retry'
              }
              onClick={() => setNotice(`${selected.name} 已排入重新執行。`)}
            >
              重新執行
            </button>
          </>
        )}
      </aside>
    </div>
  )
}

function KnowledgeAgentsPage({
  role,
  agents,
  setAgents,
  setNotice,
}: {
  role: AdminRole
  agents: KnowledgeAgent[]
  setAgents: React.Dispatch<React.SetStateAction<KnowledgeAgent[]>>
  setNotice: (message: string) => void
}) {
  const canManage = can(role, 'knowledge.manage')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | KnowledgeAgentStatus>('all')
  const [selected, setSelected] = useState<KnowledgeAgent | null>(agents[0] ?? null)
  const [confirming, setConfirming] = useState<KnowledgeAgent | null>(null)
  const [newAgentName, setNewAgentName] = useState('')

  const visible = agents.filter((agent) => {
    const text = `${agent.name} ${agent.serviceType} ${agent.owner} ${agent.allowedGroups.join(' ')}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === 'all' || agent.status === status)
  })

  const updateAgent = (target: KnowledgeAgent, patch: Partial<KnowledgeAgent>) => {
    const next = { ...target, ...patch, updatedAt: new Date().toISOString() }
    setAgents((current) => current.map((agent) => (agent.id === target.id ? next : agent)))
    setSelected(next)
  }

  const addAgent = () => {
    if (!newAgentName.trim()) return
    const next: KnowledgeAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      serviceType: '客製化服務',
      owner: '目前管理者',
      status: 'draft',
      access: 'selected',
      allowedGroups: ['試用名單'],
      prompt: '請在這裡定義代理人的角色、任務範圍、回答語氣與不可跨越的邊界。',
      guardrails: '若資料不足，請要求使用者補充；不可編造政策、法規或個人資料。',
      model: 'GPT-4.1 mini',
      usage: 0,
      updatedAt: new Date().toISOString(),
    }
    setAgents((current) => [next, ...current])
    setSelected(next)
    setNewAgentName('')
    setNotice(`${next.name} 已建立為草稿，可先設定 Prompt 與可使用對象。`)
  }

  const togglePublish = () => {
    if (!confirming) return
    const nextStatus: KnowledgeAgentStatus =
      confirming.status === 'published' ? 'paused' : 'published'
    updateAgent(confirming, { status: nextStatus })
    setNotice(`${confirming.name} 已${nextStatus === 'published' ? '發布給授權使用者' : '停用'}。`)
    setConfirming(null)
  }

  return (
    <div className="admin-grid">
      <div className="admin-main-column">
        {!canManage && <EmptyPermission label="管理知識代理人" />}
        <Panel
          title="知識代理人管理"
          subtitle="管理每個可被同仁使用的代理人服務：Prompt、服務範圍、模型、可使用對象與發布狀態。"
          action={
            <div className="inline-upload">
              <input
                value={newAgentName}
                disabled={!canManage}
                onChange={(event) => setNewAgentName(event.target.value)}
                placeholder="輸入代理人名稱，例如：採購規範助手"
              />
              <button type="button" disabled={!canManage} onClick={addAgent}>
                <Plus size={16} />
                新增代理人
              </button>
            </div>
          }
        >
          <div className="agent-summary-grid">
            <article>
              <span>已發布</span>
              <strong>{agents.filter((agent) => agent.status === 'published').length}</strong>
            </article>
            <article>
              <span>草稿</span>
              <strong>{agents.filter((agent) => agent.status === 'draft').length}</strong>
            </article>
            <article>
              <span>受限服務</span>
              <strong>{agents.filter((agent) => agent.access === 'selected').length}</strong>
            </article>
          </div>
          <div className="admin-filters">
            <label className="admin-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋代理人、服務類型、擁有處室或可使用對象"
              />
            </label>
            <label>
              發布狀態
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as 'all' | KnowledgeAgentStatus)
                }
              >
                <option value="all">全部狀態</option>
                <option value="published">已發布</option>
                <option value="draft">草稿</option>
                <option value="paused">已停用</option>
              </select>
            </label>
          </div>
          <div className="admin-table agent-table">
            <div className="admin-table-head">
              <span>代理人服務</span>
              <span>擁有單位</span>
              <span>可使用對象</span>
              <span>狀態</span>
              <span>操作</span>
            </div>
            {visible.map((agent) => (
              <article key={agent.id} className="admin-row">
                <div>
                  <strong>{agent.name}</strong>
                  <small>{agent.serviceType} · {agent.model} · {agent.usage.toLocaleString()} 次使用</small>
                </div>
                <span>{agent.owner}</span>
                <span>{agentAccessLabels[agent.access]}</span>
                <span className={`admin-pill ${agent.status}`}>{agentStatusLabels[agent.status]}</span>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => setSelected(agent)}>
                    <Eye size={15} />
                    設定
                  </button>
                  <button type="button" disabled={!canManage} onClick={() => setConfirming(agent)}>
                    {agent.status === 'published' ? '停用' : '發布'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
      <aside className="admin-side-card agent-editor">
        <h2>代理人設定</h2>
        {selected ? (
          <>
            <p>{selected.name}</p>
            <label>
              服務類型
              <input
                value={selected.serviceType}
                disabled={!canManage}
                onChange={(event) => updateAgent(selected, { serviceType: event.target.value })}
              />
            </label>
            <label>
              System Prompt
              <textarea
                rows={6}
                value={selected.prompt}
                disabled={!canManage}
                onChange={(event) => updateAgent(selected, { prompt: event.target.value })}
              />
            </label>
            <label>
              回答邊界 / Guardrails
              <textarea
                rows={4}
                value={selected.guardrails}
                disabled={!canManage}
                onChange={(event) => updateAgent(selected, { guardrails: event.target.value })}
              />
            </label>
            <label>
              可使用對象
              <select
                value={selected.access}
                disabled={!canManage}
                onChange={(event) =>
                  updateAgent(selected, {
                    access: event.target.value as KnowledgeAgentAccess,
                  })
                }
              >
                <option value="all">全員可用</option>
                <option value="department">限所屬處室</option>
                <option value="selected">指定對象</option>
              </select>
            </label>
            <label>
              授權群組
              <input
                value={selected.allowedGroups.join('、')}
                disabled={!canManage}
                onChange={(event) =>
                  updateAgent(selected, {
                    allowedGroups: event.target.value
                      .split('、')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <dl className="admin-detail-list">
              <div>
                <dt>發布狀態</dt>
                <dd>{agentStatusLabels[selected.status]}</dd>
              </div>
              <div>
                <dt>模型</dt>
                <dd>{selected.model}</dd>
              </div>
              <div>
                <dt>最後更新</dt>
                <dd>{formatDateTime(selected.updatedAt)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p>請先選擇一個代理人。</p>
        )}
      </aside>
      {confirming && (
        <Modal
          title={`${confirming.status === 'published' ? '停用' : '發布'}知識代理人`}
          onClose={() => setConfirming(null)}
        >
          <p>
            {confirming.status === 'published'
              ? `${confirming.name} 停用後，使用者將暫時無法在服務入口選用。`
              : `${confirming.name} 將開放給「${confirming.allowedGroups.join('、')}」使用。`}
          </p>
          <div className="admin-modal-actions">
            <button type="button" onClick={() => setConfirming(null)}>
              取消
            </button>
            <button type="button" className="admin-primary" onClick={togglePublish}>
              確認{confirming.status === 'published' ? '停用' : '發布'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AuditPage({ events, setNotice }: { events: AuditEvent[]; setNotice: (message: string) => void }) {
  const [result, setResult] = useState('all')
  const [module, setModule] = useState('all')
  const [actor, setActor] = useState('all')
  const [operationType, setOperationType] = useState('all')
  const [timeRange, setTimeRange] = useState('180')
  const [selected, setSelected] = useState<AuditEvent | null>(events[0] ?? null)
  const modules = ['all', ...Array.from(new Set(events.map((event) => event.module)))]
  const actors = ['all', ...Array.from(new Set(events.map((event) => event.actor)))]
  const latestTimestamp = Math.max(...events.map((event) => new Date(event.timestamp).getTime()))
  const rangeDays = Number(timeRange)
  const cutoff = latestTimestamp - rangeDays * 24 * 60 * 60 * 1000
  const visible = events.filter(
    (event) =>
      (result === 'all' || event.result === result) &&
      (module === 'all' || event.module === module) &&
      (actor === 'all' || event.actor === actor) &&
      (operationType === 'all' || event.operationType === operationType) &&
      new Date(event.timestamp).getTime() >= cutoff,
  )
  const tokenAlert = events.find((event) => event.action === 'Token 用量異常')

  return (
    <div className="admin-grid">
      <div className="admin-main-column">
        <Panel
          title="稽核日誌"
          subtitle="此頁只提供檢視與匯出請求，不提供任何修改操作。"
          action={
            <button
              type="button"
              className="admin-secondary"
              onClick={() => setNotice('已建立匯出請求（Prototype，不會下載真實檔案）。')}
            >
              <Download size={16} />
              匯出稽核紀錄
            </button>
          }
        >
          <section className="retention-card">
            <strong>保存期限</strong>
            <span>操作紀錄至少保留 180 天；此 prototype 以事件時間模擬人員、時間與操作類型查詢。</span>
          </section>
          <div className="admin-filters">
            <label>
              人員
              <select value={actor} onChange={(event) => setActor(event.target.value)}>
                {actors.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? '全部人員' : item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              時間
              <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
                <option value="1">今日</option>
                <option value="7">近一週</option>
                <option value="30">近一月</option>
                <option value="180">180 天內</option>
              </select>
            </label>
            <label>
              操作類型
              <select value={operationType} onChange={(event) => setOperationType(event.target.value)}>
                <option value="all">全部類型</option>
                {Object.entries(operationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              模組
              <select value={module} onChange={(event) => setModule(event.target.value)}>
                {modules.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? '全部模組' : item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              結果
              <select value={result} onChange={(event) => setResult(event.target.value)}>
                <option value="all">全部結果</option>
                <option value="success">成功</option>
                <option value="failed">失敗</option>
              </select>
            </label>
          </div>
          <div className="admin-table audit-table">
            <div className="admin-table-head">
              <span>時間</span>
              <span>操作者</span>
              <span>類型</span>
              <span>模組</span>
              <span>動作</span>
              <span>結果</span>
            </div>
            {visible.map((event) => (
              <article key={event.id} className="admin-row">
                <span>{formatDateTime(event.timestamp)}</span>
                <span>{event.actor}</span>
                <span>{operationTypeLabels[event.operationType]}</span>
                <span>{event.module}</span>
                <span>{event.action}</span>
                <div className="admin-row-actions">
                  <span className={`admin-pill ${event.result}`}>{event.result === 'success' ? '成功' : '失敗'}</span>
                  <button type="button" onClick={() => setSelected(event)}>
                    查看細節
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
      <aside className="admin-side-card audit-detail">
        <h2>事件細節</h2>
        {selected && (
          <>
            <p>{selected.action}</p>
            <dl className="admin-detail-list">
              <div>
                <dt>Trace ID</dt>
                <dd>{selected.traceId}</dd>
              </div>
              <div>
                <dt>IP</dt>
                <dd>{selected.ip}</dd>
              </div>
              <div>
                <dt>操作類型</dt>
                <dd>{operationTypeLabels[selected.operationType]}</dd>
              </div>
              <div>
                <dt>權限判定</dt>
                <dd>
                  {selected.permissionDecision.decision === 'allowed'
                    ? `允許：${permissionLabels[selected.permissionDecision.permission]}`
                    : `拒絕：${selected.permissionDecision.reason}`}
                </dd>
              </div>
            </dl>
            <div className="before-after">
              <section>
                <strong>異動前</strong>
                <pre>{JSON.stringify(selected.before, null, 2) || '無'}</pre>
              </section>
              <section>
                <strong>異動後</strong>
                <pre>{JSON.stringify(selected.after, null, 2) || '無'}</pre>
              </section>
            </div>
          </>
        )}
        <section className="audit-rule-card">
          <h3>Token 用量異常規則</h3>
          <p>
            以一般同仁「短問答 + 公文摘要」混用推估，合理月用量門檻暫定
            <strong> 300,000 tokens / 月</strong>。
          </p>
          <div className="audit-rule-list">
            <span>短問答 / 潤飾：約 800 tokens，約 28 次 / 天</span>
            <span>公文 / 報告摘要：約 2,200 tokens，約 10 次 / 天</span>
            <span>長文件 / 法規研析：約 5,000 tokens，約 4-5 次 / 天</span>
          </div>
          <p>
            超過門檻時建立稽核事件，並自動發信通知 <strong>IT</strong> 與{' '}
            <strong>admin</strong>。
          </p>
          {tokenAlert?.after && (
            <div className="audit-alert-summary">
              <span>本月用量</span>
              <strong>
                {Number(tokenAlert.after.monthlyTokenUsage).toLocaleString()} tokens
              </strong>
              <small>
                已超過 {Number(tokenAlert.after.overThresholdTokens).toLocaleString()} tokens；
                通知狀態：已寄送
              </small>
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}

function StatsPage({
  stats,
  traffic,
}: {
  stats: UsageStats[]
  traffic: UserTrafficStats[]
}) {
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [selectedKpi, setSelectedKpi] = useState('totalQueries')
  const current = stats.find((item) => item.rangeDays === range) ?? stats[0]
  const rangeLabels: Record<7 | 30 | 90, string> = {
    7: '日',
    30: '週',
    90: '月',
  }
  const sortedTraffic = [...traffic].sort((a, b) => b.monthlyTokens - a.monthlyTokens)
  const alertUsers = traffic.filter((item) => item.alertLevel === 'alert').length
  const watchUsers = traffic.filter((item) => item.alertLevel === 'watch').length
  const totalMonthlyTokens = traffic.reduce((sum, item) => sum + item.monthlyTokens, 0)
  const tokenLimit = traffic[0]?.tokenLimit ?? 300000
  const kpis = [
    {
      id: 'totalQueries',
      label: '總提問數',
      value: current.kpis.totalQueries.toLocaleString(),
      definition: '使用者送出且被系統接收的提問總量。',
    },
    {
      id: 'activeUsers',
      label: '活躍使用者',
      value: current.kpis.activeUsers.toLocaleString(),
      definition: '期間內至少提問一次的不重複使用者。',
    },
    {
      id: 'aiTokens',
      label: 'AI 使用量',
      value: current.kpis.aiTokens.toLocaleString(),
      definition: '期間內所有互動累計消耗的 Token，作為成本控管與異常偵測依據。',
    },
    {
      id: 'satisfactionRate',
      label: '正向回饋率',
      value: `${Math.round(current.kpis.satisfactionRate * 100)}%`,
      definition: '1-10 分回饋中，7 分以上或正向回饋占全部回饋的比例。',
    },
    {
      id: 'negativeFeedback',
      label: '負向回饋',
      value: current.negativeFeedback.count.toLocaleString(),
      definition: '使用者給 1-6 分或選擇負向回饋的次數。',
    },
    {
      id: 'monthlyTokens',
      label: '本月 Token',
      value: totalMonthlyTokens.toLocaleString(),
      definition: '每位使用者每次互動都累計 token，用於成本控管與異常偵測。',
    },
    {
      id: 'trafficAlerts',
      label: '用量觀察',
      value: `${alertUsers + watchUsers} 人`,
      definition: '超過 80% 門檻先列入觀察；超過 300,000 tokens 才建立稽核與通知。',
    },
    {
      id: 'averageResponseMs',
      label: '平均回覆時間',
      value: `${current.kpis.averageResponseMs}ms`,
      definition: '從送出問題到第一段回答完成的平均時間。',
    },
  ]
  const selected = kpis.find((kpi) => kpi.id === selectedKpi) ?? kpis[0]

  return (
    <div className="admin-main-column full-width">
      <Panel
        title="使用統計"
        subtitle={`${rangeLabels[range]}資料範圍，支撐驗收、營運報告與品質追蹤。`}
        action={
          <div className="range-switch" aria-label="統計區間">
            {([7, 30, 90] as const).map((days) => (
              <button
                key={days}
                type="button"
                className={range === days ? 'active' : ''}
                onClick={() => setRange(days)}
              >
                {rangeLabels[days]}
              </button>
            ))}
          </div>
        }
      >
        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              className={selectedKpi === kpi.id ? 'kpi-card active' : 'kpi-card'}
              onClick={() => setSelectedKpi(kpi.id)}
            >
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </button>
          ))}
        </div>
        <div className="stats-layout">
          <section className="definition-card">
            <h3>{selected.label}怎麼算？</h3>
            <p>{selected.definition}</p>
            <small>這裡刻意用白話解釋 KPI，避免管理者被迫理解資料欄位名稱。</small>
          </section>
          <section className="traffic-policy-card">
            <h3>流量統計怎麼記？</h3>
            <div className="traffic-policy-list">
              <span>
                <strong>每個人都記錄</strong>
                月 token、提問次數、平均每日提問、最後使用時間。
              </span>
              <span>
                <strong>不全部進稽核</strong>
                一般使用只放統計，避免 1,000 人資料把稽核日誌洗版。
              </span>
              <span>
                <strong>異常才發 alert</strong>
                超過 {tokenLimit.toLocaleString()} tokens / 月，建立稽核事件並通知 IT / admin。
              </span>
            </div>
          </section>
          <section className="traffic-watch-card">
            <h3>個人月用量監控</h3>
            <p>
              目前 {alertUsers} 人已異常、{watchUsers} 人接近門檻；稽核日誌只收已異常與管理操作。
            </p>
            <div className="traffic-table" role="table" aria-label="個人月流量統計">
              <div className="traffic-row traffic-head" role="row">
                <span>使用者</span>
                <span>本月 token</span>
                <span>狀態</span>
                <span>處理方式</span>
              </div>
              {sortedTraffic.map((item) => {
                const ratio = Math.round((item.monthlyTokens / item.tokenLimit) * 100)
                const statusLabel =
                  item.alertLevel === 'alert'
                    ? '已 alert'
                    : item.alertLevel === 'watch'
                      ? '觀察'
                      : '正常'

                return (
                  <div key={item.id} className="traffic-row" role="row">
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.department} · {item.email}</small>
                    </span>
                    <span>
                      <strong>{item.monthlyTokens.toLocaleString()}</strong>
                      <small>
                        {item.monthlyQueries} 次 / 日均 {item.dailyAverageQueries} 次
                      </small>
                    </span>
                    <span>
                      <em className={`traffic-status ${item.alertLevel}`}>{statusLabel}</em>
                      <small>{ratio}%</small>
                    </span>
                    <span>{item.note}</span>
                  </div>
                )
              })}
            </div>
          </section>
          <section>
            <h3>各功能使用頻率</h3>
            {current.featureUsage.map((feature) => (
              <div key={feature.name} className="progress-row">
                <span>{feature.name}</span>
                <progress max={current.kpis.totalQueries} value={feature.count} />
                <strong>{feature.count.toLocaleString()}</strong>
              </div>
            ))}
          </section>
          <section>
            <h3>部門與角色用量</h3>
            {current.departmentUsage.map((department) => (
              <div key={department.department} className="error-row">
                <strong>{department.department}</strong>
                <span>{department.tokens.toLocaleString()} tokens</span>
                <em>{department.queries.toLocaleString()}</em>
              </div>
            ))}
            {current.roleUsage.map((roleUsage) => (
              <div key={roleUsage.role} className="error-row">
                <strong>{roleLabels[roleUsage.role]}</strong>
                <span>{roleUsage.tokens.toLocaleString()} tokens</span>
                <em>{roleUsage.queries.toLocaleString()}</em>
              </div>
            ))}
          </section>
          <section>
            <h3>常被引用文件</h3>
            {current.citedDocuments.map((document) => (
              <div key={document.name} className="progress-row">
                <span>{document.name}</span>
                <progress
                  max={current.citedDocuments[0]?.citations ?? 1}
                  value={document.citations}
                />
                <strong>{document.citations.toLocaleString()}</strong>
              </div>
            ))}
          </section>
          <section>
            <h3>找不到答案 / 低相關度</h3>
            {current.qualityIssues.map((issue) => (
              <div key={`${issue.type}-${issue.question}`} className="quality-issue-row">
                <strong>{issue.type}</strong>
                <span>{issue.question}</span>
                <em>{issue.count}</em>
              </div>
            ))}
          </section>
          <section>
            <h3>負向回饋與未解決</h3>
            <p className="large-number">{Math.round(current.negativeFeedback.rate * 100)}%</p>
            <div className="error-row">
              <strong>未解決</strong>
              <span>負向回饋尚未完成處理</span>
              <em>{current.negativeFeedback.unresolved.toLocaleString()}</em>
            </div>
            {current.negativeFeedback.commonReasons.map((reason) => (
              <div key={reason.reason} className="error-row">
                <strong>{reason.reason}</strong>
                <span>{reason.description}</span>
                <em>{reason.count}</em>
              </div>
            ))}
          </section>
        </div>
      </Panel>
    </div>
  )
}

function FeedbackPage({
  role,
  items,
  setItems,
  setNotice,
}: {
  role: AdminRole
  items: FeedbackItem[]
  setItems: React.Dispatch<React.SetStateAction<FeedbackItem[]>>
  setNotice: (message: string) => void
}) {
  const canManage = can(role, 'feedback.manage')
  const [sentiment, setSentiment] = useState('all')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<FeedbackItem | null>(items[0] ?? null)
  const [assignee, setAssignee] = useState(selected?.assignee ?? '')
  const [tag, setTag] = useState('')
  const [nextStatus, setNextStatus] = useState<FeedbackItem['status']>(
    selected?.status ?? 'pending',
  )
  const [note, setNote] = useState(selected?.note ?? '')
  const [rating, setRating] = useState<FeedbackItem['rating']>(selected?.rating ?? 5)
  const averageRating = Math.round(
    (items.reduce((sum, item) => sum + item.rating, 0) / items.length) * 10,
  ) / 10
  const positiveRate = Math.round(
    (items.filter((item) => item.rating >= 7).length / items.length) * 100,
  )
  const visible = items.filter(
    (item) =>
      (sentiment === 'all' || item.sentiment === sentiment) &&
      (status === 'all' || item.status === status),
  )

  useEffect(() => {
    setAssignee(selected?.assignee ?? '')
    setTag('')
    setNextStatus(selected?.status ?? 'pending')
    setNote(selected?.note ?? '')
    setRating(selected?.rating ?? 5)
  }, [selected])

  const save = () => {
    if (!selected) return
    if (nextStatus === 'completed' && !note.trim()) {
      setNotice('完成回饋前，請先填寫處理說明。')
      return
    }
    const next: FeedbackItem = {
      ...selected,
      rating,
      sentiment: rating >= 7 ? 'positive' : 'negative',
      assignee: assignee || null,
      status: nextStatus,
      note,
      tags: tag ? [...selected.tags, tag] : selected.tags,
    }
    setItems((current) => current.map((item) => (item.id === selected.id ? next : item)))
    setSelected(next)
    setNotice(`已更新 ${selected.id} 的處理狀態。`)
  }

  return (
    <div className="admin-grid">
      <div className="admin-main-column">
        {!canManage && <EmptyPermission label="處理回饋" />}
        <Panel
          title="回饋管理"
          subtitle="把正負回饋轉成可追蹤的知識庫改善任務。"
          action={
            <div className="feedback-kpi-stack">
              <div className="mini-kpi">
                <span>平均評分</span>
                <strong>{averageRating}/10</strong>
              </div>
              <div className={positiveRate >= 70 ? 'mini-kpi' : 'mini-kpi warning'}>
                <span>正向回饋率目標 70%</span>
                <strong>{positiveRate}%</strong>
              </div>
            </div>
          }
        >
          <div className="admin-filters">
            <label>
              回饋類型
              <select value={sentiment} onChange={(event) => setSentiment(event.target.value)}>
                <option value="all">全部</option>
                <option value="positive">正向</option>
                <option value="negative">負向</option>
              </select>
            </label>
            <label>
              處理狀態
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">全部</option>
                <option value="pending">待處理</option>
                <option value="in_progress">處理中</option>
                <option value="completed">已完成</option>
                <option value="ignored">不列入</option>
              </select>
            </label>
          </div>
          <div className="feedback-list">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={selected?.id === item.id ? 'feedback-card active' : 'feedback-card'}
                onClick={() => setSelected(item)}
              >
                <span className={`admin-pill ${item.sentiment}`}>
                  {item.sentiment === 'positive' ? '正向' : '負向'}
                </span>
                <strong>{item.question}</strong>
                <small>
                  評分 {item.rating}/10 · {item.knowledgeBase} · {feedbackStatusLabels[item.status]}
                </small>
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <aside className="admin-side-card feedback-detail">
        <h2>處理回饋</h2>
        {selected && (
          <>
            <p>{selected.question}</p>
            <div className="quoted-answer">
              <strong>系統回答</strong>
              <span>{selected.answer}</span>
            </div>
            <div className="citation-list">
              {selected.citations.map((citation) => (
                <span key={citation.documentId}>
                  {citation.documentName}：{citation.excerpt}
                </span>
              ))}
            </div>
            <label>
              回饋評分
              <select
                value={rating}
                disabled={!canManage}
                onChange={(event) =>
                  setRating(Number(event.target.value) as FeedbackItem['rating'])
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <option key={score} value={score}>
                    {score} 分
                  </option>
                ))}
              </select>
            </label>
            <label>
              負責小組
              <select
                value={assignee}
                disabled={!canManage}
                onChange={(event) => setAssignee(event.target.value)}
              >
                <option value="">尚未指派</option>
                <option value="knowledge-team">知識維護小組</option>
                <option value="service-team">客服營運小組</option>
                <option value="security-team">資安稽核小組</option>
              </select>
            </label>
            <label>
              新增標籤
              <input
                value={tag}
                disabled={!canManage}
                onChange={(event) => setTag(event.target.value)}
                placeholder="例如：需補文件"
              />
            </label>
            <label>
              處理狀態
              <select
                value={nextStatus}
                disabled={!canManage}
                onChange={(event) =>
                  setNextStatus(event.target.value as FeedbackItem['status'])
                }
              >
                <option value="pending">待處理</option>
                <option value="in_progress">處理中</option>
                <option value="completed">已完成</option>
                <option value="ignored">不列入</option>
              </select>
            </label>
            <label>
              處理說明
              <textarea
                rows={4}
                maxLength={200}
                value={note}
                disabled={!canManage}
                onChange={(event) => setNote(event.target.value)}
                placeholder="完成時請填寫更新了哪些知識或為何不列入。"
              />
              <small>文字意見上限 200 字，目前 {note.length}/200。</small>
            </label>
            <button type="button" className="admin-primary full" disabled={!canManage} onClick={save}>
              儲存處理結果
            </button>
            <dl className="admin-detail-list">
              <div>
                <dt>Trace ID</dt>
                <dd>{selected.context.traceId}</dd>
              </div>
              <div>
                <dt>來源</dt>
                <dd>{selected.context.channel}</dd>
              </div>
            </dl>
          </>
        )}
      </aside>
    </div>
  )
}

export default function AdminApp({ onExit }: { onExit?: () => void }) {
  const role: AdminRole = 'admin'
  const [page, setPage] = useState<AdminPage>('users')
  const [notice, setNotice] = useState('')
  const [users, setUsers] = useState<AdminUser[]>(() => adminUsers.map((user) => ({ ...user })))
  const [agents, setAgents] = useState<KnowledgeAgent[]>(() =>
    knowledgeAgentSamples.map((agent) => ({ ...agent, allowedGroups: [...agent.allowedGroups] })),
  )
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() =>
    knowledgeDocuments.map((document) => ({ ...document })),
  )
  const [feedback, setFeedback] = useState<FeedbackItem[]>(() =>
    feedbackItems.map((item) => ({ ...item, tags: [...item.tags] })),
  )
  const pages = allowedPages(role)

  useEffect(() => {
    if (!pages.includes(page)) setPage(pages[0])
  }, [page, pages])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2400)
    return () => window.clearTimeout(timer)
  }, [notice])

  const currentPage = pageMeta[page]

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>CG</span>
          <div>
            <strong>CityGPT</strong>
            <small>管理後臺 Prototype</small>
          </div>
        </div>
        {onExit && (
          <button type="button" className="admin-back" onClick={onExit}>
            <ArrowLeft size={17} />
            回到任務排程
          </button>
        )}
        <div className="admin-nav-section">基本配置</div>
        <nav aria-label="管理後臺導覽">
          {pages.map((item) => (
            <button
              key={item}
              type="button"
              className={page === item ? 'active' : ''}
              onClick={() => setPage(item)}
            >
              {pageMeta[item].icon}
              <span>
                <strong>{pageMeta[item].label}</strong>
                <small>{pageMeta[item].description}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </nav>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">AI Empowerment · 後臺治理</p>
            <h1>{currentPage.label}</h1>
            <p>{currentPage.description}</p>
          </div>
          <div className="admin-topbar-actions">
            <span className="security-badge">
              <ShieldCheck size={16} />
              目前權限：管理者
            </span>
            <span className="security-badge">
              <ShieldCheck size={16} />
              Local Prototype
            </span>
          </div>
        </header>
        {notice && <Notice>{notice}</Notice>}
        <section className="admin-content">
          {page === 'users' && (
            <UsersPage role={role} users={users} setUsers={setUsers} setNotice={setNotice} />
          )}
          {page === 'audit' && (
            <AuditPage events={auditEvents.map((event) => ({ ...event }))} setNotice={setNotice} />
          )}
          {page === 'stats' && (
            <StatsPage
              stats={usageStats.map((item) => ({ ...item }))}
              traffic={userTrafficStats.map((item) => ({ ...item }))}
            />
          )}
          {page === 'feedback' && (
            <FeedbackPage
              role={role}
              items={feedback}
              setItems={setFeedback}
              setNotice={setNotice}
            />
          )}
          {page === 'system' && (
            <SystemStatusPage documents={documents} setNotice={setNotice} />
          )}
        </section>
        <footer className="admin-footer">
          <Filter size={16} />
          這版 prototype 只模擬操作，不連真實 API；所有異動都留在瀏覽器本機狀態。
          <ClipboardList size={16} />
          驗收重點：SSO 權限、日週月統計、180 天稽核、回饋品質、文件系統狀態。
          <FileSearch size={16} />
          所有工程細節都收在後面，不出現在主要操作路徑。
        </footer>
      </section>
    </main>
  )
}
